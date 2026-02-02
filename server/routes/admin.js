import { Router } from 'express'
import crypto from 'crypto'
import { query } from '../config/database.js'

const router = Router()

if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET 환경변수가 설정되지 않았습니다')
}
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET
const ADMIN_SESSION_HOURS = 24

// SHA256 해시
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// JWT 생성
function generateAdminToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ADMIN_SESSION_HOURS * 3600000 })).toString('base64url')
  const signature = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

// JWT 검증
function verifyAdminToken(token) {
  try {
    const [header, body, signature] = token.split('.')
    const expectedSig = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(`${header}.${body}`).digest('base64url')
    if (signature !== expectedSig) return null

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp < Date.now()) return null

    return payload
  } catch {
    return null
  }
}

// 관리자 인증 미들웨어
async function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다' })
  }

  const payload = verifyAdminToken(token)
  if (!payload) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' })
  }

  try {
    const result = await query(
      'SELECT id, username, name, role FROM admins WHERE id = $1 AND is_active = 1',
      [payload.adminId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '관리자를 찾을 수 없습니다' })
    }

    req.admin = result.rows[0]
    next()
  } catch (error) {
    console.error('[ADMIN] Auth error:', error.message)
    res.status(500).json({ error: '인증 오류' })
  }
}

/**
 * POST /api/admin/login
 * 관리자 로그인
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요' })
  }

  try {
    const passwordHash = hashPassword(password)

    const result = await query(
      'SELECT id, username, name, role FROM admins WHERE username = $1 AND password_hash = $2 AND is_active = 1',
      [username, passwordHash]
    )

    if (result.rows.length === 0) {
      console.log('[ADMIN] Login failed:', username)
      return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다' })
    }

    const admin = result.rows[0]

    // 토큰 생성
    const token = generateAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role
    })

    // 세션 저장
    const expiresAt = new Date(Date.now() + ADMIN_SESSION_HOURS * 3600000).toISOString()
    await query(`
      INSERT INTO admin_sessions (admin_id, token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `, [admin.id, token, expiresAt, req.ip, req.headers['user-agent']])

    // 마지막 로그인 시간 업데이트
    await query('UPDATE admins SET last_login_at = NOW() WHERE id = $1', [admin.id])

    console.log('[ADMIN] Login success:', admin.username)

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('[ADMIN] Login error:', error.message)
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다' })
  }
})

/**
 * POST /api/admin/logout
 */
router.post('/logout', adminAuth, async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  try {
    await query('UPDATE admin_sessions SET is_valid = 0 WHERE token = $1', [token])
    res.json({ success: true })
  } catch (error) {
    res.json({ success: true })
  }
})

/**
 * GET /api/admin/me
 * 현재 관리자 정보
 */
router.get('/me', adminAuth, (req, res) => {
  res.json({
    id: req.admin.id,
    username: req.admin.username,
    name: req.admin.name,
    role: req.admin.role
  })
})

/**
 * GET /api/admin/dashboard
 * 대시보드 통계
 */
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [usersCount, activeUsers, totalVisits, spotsCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM users WHERE last_login_at > NOW() - INTERVAL \'7 days\''),
      query('SELECT COUNT(*) as count FROM visit_history'),
      query('SELECT COUNT(*) as count FROM spots')
    ])

    // 일별 가입자 (최근 7일)
    const dailySignups = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)

    // 인기 스팟 (방문 많은 순)
    const popularSpots = await query(`
      SELECT spot_id, spot_name, COUNT(*) as visits
      FROM visit_history
      GROUP BY spot_id, spot_name
      ORDER BY visits DESC
      LIMIT 10
    `)

    res.json({
      stats: {
        totalUsers: parseInt(usersCount.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        totalVisits: parseInt(totalVisits.rows[0].count),
        totalSpots: parseInt(spotsCount.rows[0].count)
      },
      dailySignups: dailySignups.rows,
      popularSpots: popularSpots.rows
    })
  } catch (error) {
    console.error('[ADMIN] Dashboard error:', error.message)
    res.status(500).json({ error: '데이터 조회 실패' })
  }
})

/**
 * GET /api/admin/users
 * 사용자 목록
 */
router.get('/users', adminAuth, async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query
  const offset = (page - 1) * limit

  try {
    let whereClause = ''
    let params = [limit, offset]

    if (search) {
      whereClause = 'WHERE name ILIKE $3 OR email ILIKE $3'
      params.push(`%${search}%`)
    }

    const users = await query(`
      SELECT u.id, u.email, u.name, u.avatar_url, u.created_at, u.last_login_at, u.is_active,
             p.level, p.xp, p.total_stamps,
             jsonb_array_length(COALESCE(p.unlocked_spots, '[]'::jsonb)) as unlocked_count
      FROM users u
      LEFT JOIN user_progress p ON u.id = p.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, params)

    const total = await query(`SELECT COUNT(*) as count FROM users ${whereClause}`, search ? [`%${search}%`] : [])

    res.json({
      users: users.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.rows[0].count),
        totalPages: Math.ceil(total.rows[0].count / limit)
      }
    })
  } catch (error) {
    console.error('[ADMIN] Users list error:', error.message)
    res.status(500).json({ error: '사용자 목록 조회 실패' })
  }
})

/**
 * GET /api/admin/users/:id
 * 사용자 상세
 */
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await query(`
      SELECT u.*, p.*
      FROM users u
      LEFT JOIN user_progress p ON u.id = p.user_id
      WHERE u.id = $1
    `, [req.params.id])

    if (user.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' })
    }

    const visits = await query(`
      SELECT * FROM visit_history
      WHERE user_id = $1
      ORDER BY visited_at DESC
      LIMIT 50
    `, [req.params.id])

    res.json({
      user: user.rows[0],
      visits: visits.rows
    })
  } catch (error) {
    console.error('[ADMIN] User detail error:', error.message)
    res.status(500).json({ error: '사용자 정보 조회 실패' })
  }
})

/**
 * PATCH /api/admin/users/:id
 * 사용자 수정 (활성화/비활성화)
 */
router.patch('/users/:id', adminAuth, async (req, res) => {
  const { is_active } = req.body

  try {
    await query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2', [is_active, req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error('[ADMIN] User update error:', error.message)
    res.status(500).json({ error: '사용자 수정 실패' })
  }
})

/**
 * GET /api/admin/visits
 * 방문 기록 목록
 */
router.get('/visits', adminAuth, async (req, res) => {
  const { page = 1, limit = 50 } = req.query
  const offset = (page - 1) * limit

  try {
    const visits = await query(`
      SELECT v.*, u.name as user_name, u.email as user_email
      FROM visit_history v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.visited_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    const total = await query('SELECT COUNT(*) as count FROM visit_history')

    res.json({
      visits: visits.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.rows[0].count)
      }
    })
  } catch (error) {
    console.error('[ADMIN] Visits list error:', error.message)
    res.status(500).json({ error: '방문 기록 조회 실패' })
  }
})

/**
 * POST /api/admin/change-password
 * 비밀번호 변경
 */
router.post('/change-password', adminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '새 비밀번호는 6자 이상이어야 합니다' })
  }

  try {
    const currentHash = hashPassword(currentPassword)
    const check = await query(
      'SELECT id FROM admins WHERE id = $1 AND password_hash = $2',
      [req.admin.id, currentHash]
    )

    if (check.rows.length === 0) {
      return res.status(400).json({ error: '현재 비밀번호가 올바르지 않습니다' })
    }

    const newHash = hashPassword(newPassword)
    await query('UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.admin.id])

    res.json({ success: true, message: '비밀번호가 변경되었습니다' })
  } catch (error) {
    console.error('[ADMIN] Change password error:', error.message)
    res.status(500).json({ error: '비밀번호 변경 실패' })
  }
})

export default router
export { adminAuth, verifyAdminToken }
