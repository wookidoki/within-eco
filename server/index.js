import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import googleAuthRoutes from './routes/google-auth.js'
import adminRoutes from './routes/admin.js'
import spotsRoutes from './routes/spots.js'
import pool, { checkConnection } from './config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 환경변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// ===================
// 미들웨어 설정
// ===================

// CORS 설정 - 개발/운영 환경 모두 지원
const allowedOrigins = [
  'http://localhost',
  'http://localhost:80',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // 서버 내부 요청(origin이 없음) 또는 허용된 origin인 경우
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log(`[CORS] Blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

// JSON 파싱
app.use(express.json())

// 요청 로깅
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ===================
// 라우트 설정
// ===================

// Health check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected'

  try {
    const dbCheck = await checkConnection()
    dbStatus = dbCheck.connected ? 'connected (SQLite)' : `error: ${dbCheck.error}`
  } catch (err) {
    dbStatus = `error: ${err.message}`
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    google_oauth: process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('your-') ? 'configured' : 'not configured',
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173'
  })
})

// 정적 파일 서빙 (업로드된 사진)
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// 인증 라우트 (Google OAuth)
app.use('/api/auth', googleAuthRoutes)

// 관리자 라우트
app.use('/api/admin', adminRoutes)

// 스팟 라우트 (댓글, 사진, 좋아요)
app.use('/api/spots', spotsRoutes)

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('[ERROR]', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ===================
// 서버 시작
// ===================

app.listen(PORT, () => {
  console.log('')
  console.log('='.repeat(50))
  console.log('  Within Backend Server')
  console.log('='.repeat(50))
  console.log(`  URL: http://localhost:${PORT}`)
  console.log(`  Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`  Database: SQLite (local)`)
  console.log(`  Google OAuth: ${process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('your-') ? 'Configured' : 'Not configured'}`)
  console.log('='.repeat(50))
  console.log('')
  console.log('Endpoints:')
  console.log('  GET  /api/health              - Health check')
  console.log('  GET  /api/auth/google         - Google OAuth URL')
  console.log('  GET  /api/auth/google/callback- OAuth callback')
  console.log('  POST /api/auth/logout         - Logout')
  console.log('  GET  /api/auth/user           - Current user')
  console.log('  POST /api/auth/sync-progress  - Save progress')
  console.log('  GET  /api/auth/load-progress  - Load progress')
  console.log('')
})
