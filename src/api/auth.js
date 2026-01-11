/**
 * 인증 API 클라이언트
 * Express 백엔드 (SQLite + Google OAuth) 연동
 */
import apiClient from './client'

// 토큰 저장 키
const TOKEN_KEY = 'reearth-auth-token'
const USER_KEY = 'reearth-auth-user'

export const authApi = {
  /**
   * 저장된 토큰 가져오기
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * 저장된 사용자 가져오기
   */
  getStoredUser() {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  /**
   * 토큰과 사용자 저장
   */
  saveAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  /**
   * 인증 정보 삭제
   */
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Google OAuth 로그인 시작
   */
  async startGoogleLogin() {
    console.log('[API] Starting Google OAuth...')

    try {
      const { data } = await apiClient.get('/api/auth/google')

      if (!data.url) {
        console.warn('[API] Google OAuth not configured:', data.message)
        throw new Error(data.message || 'Google OAuth가 설정되지 않았습니다')
      }

      window.location.href = data.url
      return data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google 로그인 시작 실패')
    }
  },

  /**
   * OAuth 콜백 처리
   */
  async handleCallback() {
    console.log('[API] Handling OAuth callback...')

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userBase64 = params.get('user')
    const authError = params.get('auth_error')

    if (authError) {
      throw new Error(`로그인 오류: ${authError}`)
    }

    if (!token || !userBase64) {
      throw new Error('인증 정보가 없습니다')
    }

    const user = JSON.parse(atob(userBase64.replace(/-/g, '+').replace(/_/g, '/')))
    this.saveAuth(token, user)

    console.log('[API] User authenticated:', user.email)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: 'google',
      },
      token,
    }
  },

  /**
   * 현재 사용자 정보 가져오기
   */
  async getCurrentUser() {
    console.log('[API] Getting current user...')

    const token = this.getToken()
    if (!token) return null

    try {
      const { data } = await apiClient.get('/api/auth/user')
      return data
    } catch (error) {
      if (error.response?.status === 401) {
        this.clearAuth()
      }
      console.error('[API] Get user error:', error)
      return null
    }
  },

  /**
   * 로그아웃
   */
  async logout() {
    console.log('[API] Logging out...')

    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('[API] Logout error:', error)
    }

    this.clearAuth()
    return { success: true }
  },

  /**
   * 게임 진행상황 저장
   */
  async syncProgress(gameData) {
    console.log('[API] Syncing progress...')

    const token = this.getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    try {
      await apiClient.post('/api/auth/sync-progress', { gameData })
      return { success: true }
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Sync failed')
    }
  },

  /**
   * 게임 진행상황 불러오기
   */
  async loadProgress() {
    console.log('[API] Loading progress...')

    const token = this.getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    try {
      const { data } = await apiClient.get('/api/auth/load-progress')
      return data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Load failed')
    }
  },

  /**
   * 전체 게임 데이터 불러오기
   */
  async loadAllData() {
    console.log('[API] Loading all game data...')
    return this.loadProgress()
  },

  /**
   * 서버 상태 확인
   */
  async healthCheck() {
    try {
      const { data } = await apiClient.get('/api/health')
      return data
    } catch (error) {
      throw new Error('Server health check failed')
    }
  },

  /**
   * 인증 상태 체크
   */
  async checkAuthStatus() {
    const token = this.getToken()
    const storedUser = this.getStoredUser()

    if (!token || !storedUser) {
      return { isAuthenticated: false, user: null }
    }

    const user = await this.getCurrentUser()

    if (!user) {
      return { isAuthenticated: false, user: null }
    }

    return { isAuthenticated: true, user }
  },
}

export default authApi
