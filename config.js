/**
 * Re:Earth 앱 설정
 */
const config = {
  // 백엔드 API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  },

  // Supabase 설정 (선택적 - 프론트엔드 직접 연결 시)
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // 앱 설정
  app: {
    name: 'Re:Earth',
    version: '1.0.0',
    description: '경기도 생태 탐험 게임',
  },
}

export default config
