import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://within:within@localhost:5432/within',
})

pool.on('connect', () => {
  console.log('[DB] PostgreSQL connected')
})

pool.on('error', (err) => {
  console.error('[DB] PostgreSQL pool error:', err.message)
})

// PostgreSQL 쿼리 함수
export const query = async (text, params = []) => {
  try {
    const result = await pool.query(text, params)
    return { rows: result.rows, rowCount: result.rowCount }
  } catch (err) {
    console.error('[DB] Query error:', err.message)
    console.error('[DB] SQL:', text)
    throw err
  }
}

// DB 상태 확인
export const checkConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as now')
    return { connected: true, timestamp: result.rows[0].now }
  } catch (err) {
    return { connected: false, error: err.message }
  }
}

export default pool
