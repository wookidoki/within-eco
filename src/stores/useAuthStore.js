import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '../api/client'
import logger from '../utils/logger'
import { generateNickname } from '../utils/nickname'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * 인증 상태 관리 스토어
 * Google OAuth 인증 정보 및 세션 관리
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // ===================
      // 상태
      // ===================

      // 사용자 정보
      user: null, // { id, email, name, nickname, avatar, provider }

      // 인증 토큰
      accessToken: null,

      // 상태 플래그
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ===================
      // 액션
      // ===================

      /**
       * Google 로그인 시작
       */
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_URL}/api/auth/google`)
          const data = await response.json()

          if (data.url) {
            // Google OAuth 페이지로 리다이렉트
            logger.info('Google 로그인 페이지로 이동합니다...', null, true)
            window.location.href = data.url
          } else if (data.configured === false) {
            // OAuth 미설정
            const errorMsg = '서버에서 Google 로그인이 설정되지 않았습니다. 서버를 확인해주세요.'
            set({
              isLoading: false,
              error: errorMsg
            })
            logger.error(errorMsg, null, true)
          } else {
            // 기타 에러
            const errorMsg = data.message || '로그인 요청에 실패했습니다.'
            set({ isLoading: false, error: errorMsg })
            logger.error(errorMsg, null, true)
          }
        } catch (error) {
          console.error('[Auth] Login error:', error)
          const errorMsg = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          set({
            isLoading: false,
            error: errorMsg
          })
          logger.error(errorMsg, null, true)
        }
      },

      /**
       * 로그아웃
       */
      logout: async () => {
        try {
          await apiClient.post('/api/auth/logout')
        } catch (error) {
          console.error('[Auth] Logout error:', error)
        }

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })

        console.log('[Auth] Logged out')
      },

      /**
       * 게임 진행상황 동기화 (저장)
       */
      syncProgress: async (gameData) => {
        const { isAuthenticated } = get()

        if (!isAuthenticated) {
          console.log('[Auth] Not authenticated, skipping sync')
          return false
        }

        try {
          await apiClient.post('/api/auth/sync-progress', { gameData })
          console.log('[Auth] Progress synced to cloud')
          return true
        } catch (error) {
          console.error('[Auth] Sync error:', error)
          return false
        }
      },

      /**
       * 게임 진행상황 불러오기
       */
      loadProgress: async () => {
        const { isAuthenticated } = get()

        if (!isAuthenticated) {
          return null
        }

        try {
          const { data } = await apiClient.get('/api/auth/load-progress')
          console.log('[Auth] Progress loaded from cloud')
          return data.gameData || null
        } catch (error) {
          console.error('[Auth] Load progress error:', error)
          return null
        }
      },

      /**
       * 현재 사용자 정보 새로고침
       */
      refreshUser: async () => {
        const { isAuthenticated } = get()

        if (!isAuthenticated) return

        try {
          const { data: user } = await apiClient.get('/api/auth/user')
          set({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              nickname: user.nickname,
              avatar: user.avatar,
              provider: user.provider
            },
            isAuthenticated: true
          })
        } catch (error) {
          // 401 에러는 apiClient 인터셉터에서 처리
          if (error.response?.status === 401) {
            get().logout()
          }
          console.error('[Auth] Refresh user error:', error)
        }
      },

      /**
       * Authorization 헤더 생성
       */
      getAuthHeader: () => {
        const { accessToken } = get()
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      },

      /**
       * 에러 초기화
       */
      clearError: () => set({ error: null }),

      /**
       * 로딩 상태 설정
       */
      setLoading: (isLoading) => set({ isLoading }),

      /**
       * 에러 설정
       */
      setError: (error) => set({ error, isLoading: false }),

      /**
       * 로그인 성공 처리 (외부에서 호출용)
       */
      loginSuccess: (user, tokens) => {
        // 닉네임이 없으면 자동 생성
        const nickname = user.nickname || generateNickname()

        set({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            nickname: nickname,
            avatar: user.avatar,
            provider: user.provider || 'google'
          },
          accessToken: tokens?.access_token || null,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
        console.log('[Auth] Login success:', nickname)
      },

      /**
       * 닉네임 변경
       */
      updateNickname: async (newNickname) => {
        const { isAuthenticated, user } = get()

        if (!isAuthenticated) {
          throw new Error('로그인이 필요합니다')
        }

        try {
          await apiClient.patch('/api/auth/nickname', { nickname: newNickname })
          set({
            user: { ...user, nickname: newNickname }
          })
          logger.success('닉네임이 변경되었습니다', null, true)
          return true
        } catch (error) {
          console.error('[Auth] Update nickname error:', error)
          const errorMsg = error.response?.data?.error || '닉네임 변경에 실패했습니다'
          logger.error(errorMsg, null, true)
          throw new Error(errorMsg)
        }
      },

      /**
       * 닉네임 재생성 (랜덤)
       */
      regenerateNickname: () => {
        const { user } = get()
        if (!user) return null

        const newNickname = generateNickname()
        return newNickname
      },

      /**
       * 표시할 이름 가져오기 (닉네임 우선)
       */
      getDisplayName: () => {
        const { user } = get()
        if (!user) return '탐험가'
        return user.nickname || user.name || user.email?.split('@')[0] || '탐험가'
      },
    }),
    {
      name: 'within-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
