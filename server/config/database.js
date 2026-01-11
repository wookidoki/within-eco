import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// SQLite 데이터베이스
const dbPath = join(__dirname, '..', 'data', 'within.db')

// data 폴더 생성
import { mkdirSync } from 'fs'
try {
  mkdirSync(join(__dirname, '..', 'data'), { recursive: true })
} catch (e) {}

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

console.log('[DB] SQLite initialized:', dbPath)

// 테이블 생성
db.exec(`
  -- 사용자 테이블
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    nickname TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'ko',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login_at TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1
  );

  -- 사용자 진행상황 테이블
  CREATE TABLE IF NOT EXISTS user_progress (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 100,
    total_stamps INTEGER DEFAULT 0,
    has_completed_onboarding INTEGER DEFAULT 0,
    active_category TEXT DEFAULT 'ALL',
    active_region TEXT DEFAULT 'ALL',
    unlocked_spots TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 방문 기록 테이블
  CREATE TABLE IF NOT EXISTS visit_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    spot_id TEXT NOT NULL,
    spot_name TEXT NOT NULL,
    category TEXT,
    region TEXT,
    visited_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 세션 테이블
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    is_valid INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 관리자 테이블
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'admin',
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- 관리자 세션 테이블
  CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    admin_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    is_valid INTEGER DEFAULT 1,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  );

  -- 스팟 테이블
  CREATE TABLE IF NOT EXISTS spots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    region TEXT,
    district TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    description TEXT,
    image_url TEXT,
    priority INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- 댓글 테이블
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    spot_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    is_deleted INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 사진 테이블
  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    spot_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    mime_type TEXT,
    file_size INTEGER,
    caption TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    is_deleted INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 좋아요 테이블
  CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, target_type, target_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 인덱스 생성
  CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_visit_history_user_id ON visit_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_access_token ON sessions(access_token);
  CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
  CREATE INDEX IF NOT EXISTS idx_comments_spot_id ON comments(spot_id);
  CREATE INDEX IF NOT EXISTS idx_photos_spot_id ON photos(spot_id);
  CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
`)

// 기본 관리자 계정 생성 (admin / admin123)
const adminHash = crypto.createHash('sha256').update('admin123').digest('hex')
try {
  db.prepare(`
    INSERT OR IGNORE INTO admins (id, username, password_hash, email, name, role)
    VALUES (?, 'admin', ?, 'admin@within.local', '관리자', 'superadmin')
  `).run(crypto.randomUUID(), adminHash)
} catch (e) {}

// 마이그레이션: nickname 컬럼 추가 (기존 테이블용)
try {
  const hasNickname = db.prepare("PRAGMA table_info(users)").all().some(col => col.name === 'nickname')
  if (!hasNickname) {
    db.exec("ALTER TABLE users ADD COLUMN nickname TEXT")
    console.log('[DB] Migration: Added nickname column to users table')
  }
} catch (e) {
  // 이미 있거나 에러 무시
}

console.log('[DB] Tables ready')

// PostgreSQL 호환 쿼리 함수 (async wrapper)
export const query = async (text, params = []) => {
  // $1, $2 형식을 ? 형식으로 변환
  let sqliteText = text
  let paramIndex = 1
  while (sqliteText.includes(`$${paramIndex}`)) {
    sqliteText = sqliteText.replace(`$${paramIndex}`, '?')
    paramIndex++
  }

  // PostgreSQL 문법을 SQLite로 변환
  sqliteText = sqliteText
    .replace(/NOW\(\)/gi, "datetime('now')")
    .replace(/ILIKE/gi, 'LIKE')
    .replace(/::jsonb/gi, '')
    .replace(/jsonb_array_length/gi, 'json_array_length')
    .replace(/COALESCE\(([^,]+),\s*'\[\]'::jsonb\)/gi, "COALESCE($1, '[]')")
    .replace(/INTERVAL\s+'(\d+)\s+days'/gi, "'$1 days'")
    .replace(/NOW\(\)\s*-\s*INTERVAL\s+'(\d+)\s+days'/gi, "datetime('now', '-$1 days')")
    .replace(/NOW\(\)\s*-\s*'(\d+)\s+days'/gi, "datetime('now', '-$1 days')")
    .replace(/RETURNING\s+\*/gi, '')
    .replace(/ON CONFLICT \((\w+)\) DO UPDATE SET/gi, 'ON CONFLICT($1) DO UPDATE SET')
    .replace(/ON CONFLICT DO NOTHING/gi, 'ON CONFLICT DO NOTHING')
    .replace(/EXCLUDED\./gi, 'excluded.')

  try {
    const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT')
    const isInsertReturning = text.toUpperCase().includes('RETURNING')

    if (isSelect) {
      const stmt = db.prepare(sqliteText)
      const rows = stmt.all(...params)
      return { rows, rowCount: rows.length }
    } else {
      const stmt = db.prepare(sqliteText)
      const result = stmt.run(...params)

      // INSERT RETURNING 에뮬레이션
      if (isInsertReturning && result.changes > 0) {
        const table = text.match(/INSERT\s+INTO\s+(\w+)/i)?.[1]
        if (table) {
          const lastRow = db.prepare(`SELECT * FROM ${table} WHERE rowid = ?`).get(result.lastInsertRowid)
          return { rows: lastRow ? [lastRow] : [], rowCount: result.changes }
        }
      }

      return { rows: [], rowCount: result.changes }
    }
  } catch (err) {
    console.error('[DB] Query error:', err.message)
    console.error('[DB] SQL:', sqliteText)
    throw err
  }
}

// DB 상태 확인
export const checkConnection = async () => {
  try {
    const result = db.prepare("SELECT datetime('now') as now").get()
    return { connected: true, timestamp: result.now }
  } catch (err) {
    return { connected: false, error: err.message }
  }
}

export default db
