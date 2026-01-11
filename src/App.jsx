import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { ThemeProvider } from 'styled-components'
import { lightTheme, darkTheme, GlobalStyle } from './styles'
import { useThemeStore, useGameStore, useAuthStore } from './stores'
import { MapContainer } from './components/map'
import { HUDLayout } from './components/hud'
import { Onboarding, Toast, ErrorBoundary } from './components/common'
import { SpotDetailPage } from './components/content'
import { LoginModal, AuthCallback } from './components/auth'
import { authApi } from './api/auth'
import logger from './utils/logger'
import AdminPage from './pages/admin'

const AppContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`

function App() {
  const { isDarkMode } = useThemeStore()

  // 게임 스토어
  const {
    hasCompletedOnboarding,
    completeOnboarding,
    selectedSpot,
    isSpotDetailOpen,
    closeSpotDetail,
    unlockSpot,
    isSpotUnlocked,
    addVisit,
    user: gameUser,
    unlockedSpots,
    visitHistory,
    activeCategory,
    activeRegion,
    restoreFromCloud,
    getCloudSyncData,
  } = useGameStore()

  // 인증 스토어
  const {
    isAuthenticated,
    user: authUser,
    loginSuccess,
    logout,
  } = useAuthStore()

  // 로컬 상태
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isCallbackRoute, setIsCallbackRoute] = useState(false)
  const [isAdminRoute, setIsAdminRoute] = useState(false)
  const [hasSkippedLogin, setHasSkippedLogin] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // ===================
  // 라우팅 체크 및 초기화
  // ===================
  useEffect(() => {
    const init = async () => {
      // 관리자 라우트 체크
      if (window.location.pathname.startsWith('/admin')) {
        setIsAdminRoute(true)
        setIsInitialized(true)
        return
      }

      // OAuth 콜백 라우트 체크
      if (window.location.pathname === '/auth/callback') {
        setIsCallbackRoute(true)
        setIsInitialized(true)
        return
      }

      // URL에서 auth_error 체크 (홈으로 리다이렉트된 경우)
      const urlParams = new URLSearchParams(window.location.search)
      const authError = urlParams.get('auth_error')
      if (authError) {
        logger.auth.loginError({ message: authError })
        // URL에서 에러 파라미터 제거
        window.history.replaceState({}, '', '/')
      }

      // 로그인 스킵 상태 복원
      const skipped = localStorage.getItem('reearth-login-skipped')
      if (skipped === 'true') {
        setHasSkippedLogin(true)
      }

      // 저장된 인증 상태 복원
      try {
        const { isAuthenticated: isAuth, user } = await authApi.checkAuthStatus()

        if (isAuth && user) {
          loginSuccess(user, { access_token: authApi.getToken() })
          console.log('[App] Restored auth session:', user.email)
        }
      } catch (error) {
        console.log('[App] No saved auth session')
      }

      setIsInitialized(true)
    }

    init()
  }, [loginSuccess])

  // ===================
  // 온보딩 후 로그인 모달 표시
  // ===================
  useEffect(() => {
    if (
      isInitialized &&
      hasCompletedOnboarding &&
      !isAuthenticated &&
      !showLoginModal &&
      !hasSkippedLogin &&
      !isCallbackRoute
    ) {
      // 온보딩 애니메이션 완료 후 표시
      const timer = setTimeout(() => {
        setShowLoginModal(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, hasCompletedOnboarding, isAuthenticated, hasSkippedLogin, isCallbackRoute, showLoginModal])

  // ===================
  // 게임 진행상황 자동 동기화
  // ===================
  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated || isSyncing) return

    try {
      setIsSyncing(true)
      logger.auth.syncStart()

      await authApi.syncProgress({
        user: {
          level: gameUser?.level,
          xp: gameUser?.xp,
          xpToNextLevel: gameUser?.xpToNextLevel,
          totalStamps: gameUser?.totalStamps,
        },
        hasCompletedOnboarding,
        activeCategory,
        activeRegion,
        unlockedSpots,
        visitHistory,
      })

      logger.auth.syncSuccess()
    } catch (error) {
      console.error('[App] Sync error:', error)
      // 동기화 실패는 조용히 처리 (사용자 경험 방해 방지)
    } finally {
      setIsSyncing(false)
    }
  }, [isAuthenticated, isSyncing, gameUser, hasCompletedOnboarding, activeCategory, activeRegion, unlockedSpots, visitHistory])

  // 레벨이나 스탬프 변경 시 5초 후 동기화 (디바운스)
  useEffect(() => {
    if (!isAuthenticated) return

    const timer = setTimeout(syncToCloud, 5000)
    return () => clearTimeout(timer)
  }, [isAuthenticated, gameUser?.level, gameUser?.totalStamps, syncToCloud])

  // ===================
  // 이벤트 핸들러
  // ===================
  const handleDataRecovery = async () => {
    if (selectedSpot) {
      // 로컬 상태 업데이트
      unlockSpot(selectedSpot.id)
      addVisit(selectedSpot.id)
      logger.game.spotUnlocked(selectedSpot.name)

      // 로그인 상태면 즉시 동기화
      if (isAuthenticated) {
        try {
          await syncToCloud()
        } catch (error) {
          console.error('[App] Failed to sync spot unlock:', error)
        }
      }
    }
  }

  const handleSkipLogin = () => {
    setShowLoginModal(false)
    setHasSkippedLogin(true)
    localStorage.setItem('reearth-login-skipped', 'true')
    logger.info('로그인 없이 시작합니다. 진행상황은 이 기기에만 저장됩니다.', null, true)
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      logout()
      logger.auth.logoutSuccess()
    } catch (error) {
      console.error('[App] Logout error:', error)
      // 로그아웃 에러도 로컬 상태는 정리
      logout()
    }
  }

  // ===================
  // 관리자 페이지 라우트
  // ===================
  if (isAdminRoute) {
    return <AdminPage />
  }

  // ===================
  // OAuth 콜백 라우트
  // ===================
  if (isCallbackRoute) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <GlobalStyle />
        <AuthCallback />
        <Toast />
      </ThemeProvider>
    )
  }

  // ===================
  // 초기화 대기
  // ===================
  if (!isInitialized) {
    return (
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <GlobalStyle />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0B101A',
          color: 'rgba(255,255,255,0.6)',
        }}>
          로딩 중...
        </div>
      </ThemeProvider>
    )
  }

  // ===================
  // 메인 렌더
  // ===================
  return (
    <ErrorBoundary>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <GlobalStyle />
        <AppContainer>
          {/* 지도 레이어 (z-index: 0) */}
          <MapContainer />

          {/* HUD 레이어 (z-index: 10) */}
          <HUDLayout />

          {/* 온보딩 (최초 방문시) */}
          {!hasCompletedOnboarding && (
            <Onboarding onComplete={completeOnboarding} />
          )}

          {/* 로그인 모달 (온보딩 후, 미인증 시) */}
          {showLoginModal && !isAuthenticated && (
            <LoginModal onSkip={handleSkipLogin} />
          )}

          {/* 스팟 상세 페이지 */}
          {isSpotDetailOpen && selectedSpot && (
            <SpotDetailPage
              spot={selectedSpot}
              isUnlocked={isSpotUnlocked(selectedSpot.id)}
              onClose={closeSpotDetail}
              onDataRecovery={handleDataRecovery}
            />
          )}

          {/* Toast 알림 */}
          <Toast />
        </AppContainer>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
