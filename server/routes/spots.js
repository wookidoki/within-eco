import { Router } from 'express'
import { query } from '../config/database.js'
import { verifyToken } from './google-auth.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = Router()

// 업로드 폴더 생성
const uploadDir = path.join(__dirname, '..', 'uploads')
try { mkdirSync(uploadDir, { recursive: true }) } catch (e) {}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'))
    }
  }
})

// 인증 미들웨어
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: '로그인이 필요합니다' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' })
  }

  req.userId = payload.userId
  next()
}

// ===================
// 댓글 API
// ===================

/**
 * GET /api/spots/:spotId/comments
 * 스팟 댓글 목록 조회
 */
router.get('/:spotId/comments', async (req, res) => {
  const { spotId } = req.params
  const { page = 1, limit = 20 } = req.query

  try {
    const offset = (page - 1) * limit
    const result = await query(`
      SELECT c.id, c.content, c.created_at,
             u.id as user_id, u.name as user_name, u.avatar_url as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.spot_id = $1 AND c.is_deleted = 0
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [spotId, limit, offset])

    const countResult = await query(
      'SELECT COUNT(*) as total FROM comments WHERE spot_id = $1 AND is_deleted = 0',
      [spotId]
    )

    res.json({
      comments: result.rows.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        user: {
          id: c.user_id,
          name: c.user_name,
          avatar: c.user_avatar
        }
      })),
      total: countResult.rows[0]?.total || 0,
      page: parseInt(page),
      totalPages: Math.ceil((countResult.rows[0]?.total || 0) / limit)
    })
  } catch (error) {
    console.error('[Spots] Get comments error:', error)
    res.status(500).json({ error: '댓글을 불러올 수 없습니다' })
  }
})

/**
 * POST /api/spots/:spotId/comments
 * 댓글 작성
 */
router.post('/:spotId/comments', authMiddleware, async (req, res) => {
  const { spotId } = req.params
  const { content } = req.body
  const userId = req.userId

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: '댓글 내용을 입력해주세요' })
  }

  if (content.length > 500) {
    return res.status(400).json({ error: '댓글은 500자 이내로 작성해주세요' })
  }

  try {
    const result = await query(`
      INSERT INTO comments (user_id, spot_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, spotId, content.trim()])

    const userResult = await query(
      'SELECT name, avatar_url FROM users WHERE id = $1',
      [userId]
    )

    res.status(201).json({
      id: result.rows[0]?.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      user: {
        id: userId,
        name: userResult.rows[0]?.name,
        avatar: userResult.rows[0]?.avatar_url
      }
    })
  } catch (error) {
    console.error('[Spots] Add comment error:', error)
    res.status(500).json({ error: '댓글 작성에 실패했습니다' })
  }
})

/**
 * DELETE /api/spots/:spotId/comments/:commentId
 * 댓글 삭제
 */
router.delete('/:spotId/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params
  const userId = req.userId

  try {
    const result = await query(
      'UPDATE comments SET is_deleted = 1 WHERE id = $1 AND user_id = $2',
      [commentId, userId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('[Spots] Delete comment error:', error)
    res.status(500).json({ error: '댓글 삭제에 실패했습니다' })
  }
})

// ===================
// 사진 API
// ===================

/**
 * GET /api/spots/:spotId/photos
 * 스팟 사진 목록 조회
 */
router.get('/:spotId/photos', async (req, res) => {
  const { spotId } = req.params

  try {
    const result = await query(`
      SELECT p.id, p.filename, p.caption, p.created_at,
             u.id as user_id, u.name as user_name, u.avatar_url as user_avatar
      FROM photos p
      JOIN users u ON p.user_id = u.id
      WHERE p.spot_id = $1 AND p.is_deleted = 0
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [spotId])

    res.json({
      photos: result.rows.map(p => ({
        id: p.id,
        url: `/uploads/${p.filename}`,
        caption: p.caption,
        createdAt: p.created_at,
        user: {
          id: p.user_id,
          name: p.user_name,
          avatar: p.user_avatar
        }
      }))
    })
  } catch (error) {
    console.error('[Spots] Get photos error:', error)
    res.status(500).json({ error: '사진을 불러올 수 없습니다' })
  }
})

/**
 * POST /api/spots/:spotId/photos
 * 사진 업로드
 */
router.post('/:spotId/photos', authMiddleware, upload.single('photo'), async (req, res) => {
  const { spotId } = req.params
  const { caption = '' } = req.body
  const userId = req.userId

  if (!req.file) {
    return res.status(400).json({ error: '사진 파일이 필요합니다' })
  }

  try {
    const result = await query(`
      INSERT INTO photos (user_id, spot_id, filename, original_name, mime_type, file_size, caption)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      userId,
      spotId,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      caption
    ])

    res.status(201).json({
      id: result.rows[0]?.id,
      url: `/uploads/${req.file.filename}`,
      caption
    })
  } catch (error) {
    console.error('[Spots] Upload photo error:', error)
    res.status(500).json({ error: '사진 업로드에 실패했습니다' })
  }
})

// ===================
// 좋아요 API
// ===================

/**
 * POST /api/spots/:spotId/like
 * 스팟 좋아요 토글
 */
router.post('/:spotId/like', authMiddleware, async (req, res) => {
  const { spotId } = req.params
  const userId = req.userId

  try {
    // 이미 좋아요 했는지 확인
    const existing = await query(
      'SELECT id FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
      [userId, 'spot', spotId]
    )

    if (existing.rows.length > 0) {
      // 좋아요 취소
      await query(
        'DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
        [userId, 'spot', spotId]
      )
      res.json({ liked: false })
    } else {
      // 좋아요 추가
      await query(
        'INSERT INTO likes (user_id, target_type, target_id) VALUES ($1, $2, $3)',
        [userId, 'spot', spotId]
      )
      res.json({ liked: true })
    }
  } catch (error) {
    console.error('[Spots] Toggle like error:', error)
    res.status(500).json({ error: '좋아요 처리에 실패했습니다' })
  }
})

/**
 * GET /api/spots/:spotId/stats
 * 스팟 통계 조회
 */
router.get('/:spotId/stats', async (req, res) => {
  const { spotId } = req.params

  try {
    const [comments, photos, likes, visits] = await Promise.all([
      query('SELECT COUNT(*) as count FROM comments WHERE spot_id = $1 AND is_deleted = 0', [spotId]),
      query('SELECT COUNT(*) as count FROM photos WHERE spot_id = $1 AND is_deleted = 0', [spotId]),
      query('SELECT COUNT(*) as count FROM likes WHERE target_type = $1 AND target_id = $2', ['spot', spotId]),
      query('SELECT COUNT(*) as count FROM visit_history WHERE spot_id = $1', [spotId])
    ])

    res.json({
      comments: comments.rows[0]?.count || 0,
      photos: photos.rows[0]?.count || 0,
      likes: likes.rows[0]?.count || 0,
      visits: visits.rows[0]?.count || 0
    })
  } catch (error) {
    console.error('[Spots] Get stats error:', error)
    res.status(500).json({ error: '통계를 불러올 수 없습니다' })
  }
})

export default router
