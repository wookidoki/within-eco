import { Router } from 'express'
import crypto from 'crypto'
import { query } from '../config/database.js'

const router = Router()

// Google OAuth 설정 (함수로 래핑하여 런타임에 읽도록)
const getConfig = () => ({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8000/api/auth/google/callback',
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_EXPIRY_HOURS: parseInt(process.env.SESSION_EXPIRY_HOURS || '168')
})

// JWT 생성
function generateToken(payload) {
  const config = getConfig()
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + config.SESSION_EXPIRY_HOURS * 3600000 })).toString('base64url')
  const signature = crypto.createHmac('sha256', config.JWT_SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

// JWT 검증
function verifyToken(token) {
  const config = getConfig()
  try {
    const [header, body, signature] = token.split('.')
    const expectedSig = crypto.createHmac('sha256', config.JWT_SECRET).update(`${header}.${body}`).digest('base64url')
    if (signature !== expectedSig) return null

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp < Date.now()) return null

    return payload
  } catch {
    return null
  }
}

/**
 * GET /api/auth/google
 * Google OAuth 로그인 URL 반환
 */
router.get('/google', (req, res) => {
  const config = getConfig()

  if (!config.GOOGLE_CLIENT_ID || config.GOOGLE_CLIENT_ID.includes('your-google')) {
    console.log('[AUTH] Google OAuth not configured')
    return res.json({
      configured: false,
      message: 'Google OAuth 설정이 필요합니다.',
      instructions: [
        '1. Google Cloud Console에서 프로젝트 생성',
        '2. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)',
        '3. 승인된 리디렉션 URI 추가: http://localhost:8000/api/auth/google/callback',
        '4. server/.env에 GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET 설정'
      ]
    })
  }

  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: config.GOOGLE_CLIENT_ID,
    redirect_uri: config.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent'
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

  console.log('[AUTH] Google OAuth URL generated')
  res.json({ url, state })
})

/**
 * GET /api/auth/google/callback
 * Google OAuth 콜백 처리
 */
router.get('/google/callback', async (req, res) => {
  const config = getConfig()
  const { code, error } = req.query

  if (error) {
    console.error('[AUTH] Google OAuth error:', error)
    return res.redirect(`${config.FRONTEND_URL}?auth_error=${error}`)
  }

  if (!code) {
    return res.redirect(`${config.FRONTEND_URL}?auth_error=no_code`)
  }

  try {
    // 1. Authorization code를 access token으로 교환
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('[AUTH] Token exchange error:', tokenData.error)
      return res.redirect(`${config.FRONTEND_URL}?auth_error=token_exchange_failed`)
    }

    // 2. 사용자 정보 가져오기
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })

    const googleUser = await userResponse.json()
    console.log('[AUTH] Google user info:', googleUser.email)

    // 3. DB에 사용자 저장/업데이트
    const user = await upsertUser(googleUser)

    // 4. 세션 토큰 생성
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      googleId: user.google_id
    })

    // 5. 세션 저장
    await saveSession(user.id, accessToken, tokenData.refresh_token)

    // 6. 프론트엔드로 리다이렉트 (토큰 포함)
    const redirectUrl = new URL(`${config.FRONTEND_URL}/auth/callback`)
    redirectUrl.searchParams.set('token', accessToken)
    redirectUrl.searchParams.set('user', Buffer.from(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname || null,
      avatar: user.avatar_url
    })).toString('base64url'))

    res.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('[AUTH] Google callback error:', error)
    res.redirect(`${config.FRONTEND_URL}?auth_error=server_error`)
  }
})

/**
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (token) {
    try {
      await query('UPDATE sessions SET is_valid = 0 WHERE access_token = $1', [token])
    } catch (err) {
      console.error('[AUTH] Logout DB error:', err.message)
    }
  }

  res.json({ success: true, message: 'Logged out' })
})

/**
 * GET /api/auth/user
 */
router.get('/user', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  try {
    const result = await query(
      'SELECT id, email, name, nickname, avatar_url FROM users WHERE id = $1 AND is_active = 1',
      [payload.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      avatar: user.avatar_url,
      provider: 'google'
    })
  } catch (error) {
    console.error('[AUTH] Get user error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * PATCH /api/auth/nickname
 * 닉네임 변경
 */
router.patch('/nickname', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const { nickname } = req.body

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  // 닉네임 유효성 검사
  if (!nickname || nickname.trim().length < 2) {
    return res.status(400).json({ error: '닉네임은 2자 이상이어야 합니다' })
  }

  if (nickname.length > 20) {
    return res.status(400).json({ error: '닉네임은 20자 이하여야 합니다' })
  }

  const validPattern = /^[가-힣a-zA-Z0-9]+$/
  if (!validPattern.test(nickname)) {
    return res.status(400).json({ error: '한글, 영문, 숫자만 사용 가능합니다' })
  }

  try {
    await query(
      'UPDATE users SET nickname = $1, updated_at = NOW() WHERE id = $2',
      [nickname.trim(), payload.userId]
    )

    console.log('[AUTH] Nickname updated for user:', payload.userId, '->', nickname)
    res.json({ success: true, nickname: nickname.trim() })
  } catch (error) {
    console.error('[AUTH] Update nickname error:', error.message)
    res.status(500).json({ error: '닉네임 변경에 실패했습니다' })
  }
})

/**
 * POST /api/auth/sync-progress
 */
router.post('/sync-progress', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const { gameData } = req.body

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    // user_progress upsert (boolean -> integer 변환 필요)
    await query(`
      INSERT INTO user_progress (user_id, level, xp, xp_to_next_level, total_stamps, has_completed_onboarding, active_category, active_region, unlocked_spots)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE SET
        level = EXCLUDED.level,
        xp = EXCLUDED.xp,
        xp_to_next_level = EXCLUDED.xp_to_next_level,
        total_stamps = EXCLUDED.total_stamps,
        has_completed_onboarding = EXCLUDED.has_completed_onboarding,
        active_category = EXCLUDED.active_category,
        active_region = EXCLUDED.active_region,
        unlocked_spots = EXCLUDED.unlocked_spots,
        updated_at = datetime('now')
    `, [
      payload.userId,
      gameData.user?.level || 1,
      gameData.user?.xp || 0,
      gameData.user?.xpToNextLevel || 100,
      gameData.user?.totalStamps || 0,
      gameData.hasCompletedOnboarding ? 1 : 0,  // boolean -> integer
      gameData.activeCategory || 'ALL',
      gameData.activeRegion || 'ALL',
      JSON.stringify(gameData.unlockedSpots || [])
    ])

    // 방문 기록 동기화
    if (gameData.visitHistory?.length > 0) {
      for (const visit of gameData.visitHistory.slice(0, 100)) {
        try {
          await query(`
            INSERT INTO visit_history (user_id, spot_id, spot_name, category, visited_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
          `, [payload.userId, visit.spotId, visit.spotName, visit.category, visit.visitedAt])
        } catch (e) {
          // 중복 무시
        }
      }
    }

    console.log('[AUTH] Progress synced for user:', payload.userId)
    res.json({ success: true })
  } catch (error) {
    console.error('[AUTH] Sync progress error:', error.message)
    res.status(500).json({ error: 'Failed to sync progress' })
  }
})

/**
 * GET /api/auth/load-progress
 */
router.get('/load-progress', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    const progressResult = await query(
      'SELECT * FROM user_progress WHERE user_id = $1',
      [payload.userId]
    )

    const historyResult = await query(
      'SELECT spot_id, spot_name, category, visited_at FROM visit_history WHERE user_id = $1 ORDER BY visited_at DESC LIMIT 100',
      [payload.userId]
    )

    if (progressResult.rows.length === 0) {
      return res.json({ gameData: null, lastUpdated: null })
    }

    const progress = progressResult.rows[0]

    res.json({
      gameData: {
        user: {
          level: progress.level,
          xp: progress.xp,
          xpToNextLevel: progress.xp_to_next_level,
          totalStamps: progress.total_stamps
        },
        hasCompletedOnboarding: progress.has_completed_onboarding,
        activeCategory: progress.active_category,
        activeRegion: progress.active_region,
        unlockedSpots: progress.unlocked_spots || [],
        visitHistory: historyResult.rows.map(v => ({
          spotId: v.spot_id,
          spotName: v.spot_name,
          category: v.category,
          visitedAt: v.visited_at
        }))
      },
      lastUpdated: progress.updated_at
    })
  } catch (error) {
    console.error('[AUTH] Load progress error:', error.message)
    res.status(500).json({ error: 'Failed to load progress' })
  }
})

// ==================
// 헬퍼 함수
// ==================

async function upsertUser(googleUser) {
  const existing = await query('SELECT * FROM users WHERE google_id = $1', [googleUser.id])

  if (existing.rows.length > 0) {
    // 업데이트
    await query(`
      UPDATE users SET
        email = $1, name = $2, avatar_url = $3, last_login_at = NOW(), updated_at = NOW()
      WHERE google_id = $4
    `, [googleUser.email, googleUser.name, googleUser.picture, googleUser.id])

    return existing.rows[0]
  } else {
    // 새로 생성
    const result = await query(`
      INSERT INTO users (google_id, email, name, avatar_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [googleUser.id, googleUser.email, googleUser.name, googleUser.picture])

    const newUser = result.rows[0]

    // user_progress 초기화
    await query(`
      INSERT INTO user_progress (user_id)
      VALUES ($1)
    `, [newUser.id])

    return newUser
  }
}

async function saveSession(userId, accessToken, refreshToken) {
  const config = getConfig()
  const expiresAt = new Date(Date.now() + config.SESSION_EXPIRY_HOURS * 3600000).toISOString()

  await query(`
    INSERT INTO sessions (user_id, access_token, refresh_token, expires_at)
    VALUES ($1, $2, $3, $4)
  `, [userId, accessToken, refreshToken || null, expiresAt])
}

export default router
export { verifyToken }
