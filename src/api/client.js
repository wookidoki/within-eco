/**
 * Axios API 클라이언트
 * 모든 API 요청의 기본 설정
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 토큰 가져오기 헬퍼 (useAuthStore의 persist 저장소와 통일)
const getStoredToken = () => {
  try {
    const stored = localStorage.getItem('within-auth-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.state?.accessToken || null
    }
  } catch (e) {
    console.error('[API] Failed to parse auth storage:', e)
  }
  return null
}

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // FormData인 경우 Content-Type을 제거하여 axios가 자동 설정하도록 함
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러 시 인증 정보 초기화
    if (error.response?.status === 401) {
      try {
        const stored = localStorage.getItem('within-auth-storage')
        if (stored) {
          const parsed = JSON.parse(stored)
          parsed.state = {
            ...parsed.state,
            user: null,
            accessToken: null,
            isAuthenticated: false
          }
          localStorage.setItem('within-auth-storage', JSON.stringify(parsed))
        }
      } catch (e) {
        console.error('[API] Failed to clear auth on 401:', e)
      }
    }

    // 네트워크 에러
    if (!error.response) {
      console.error('[API] Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
