/**
 * 모바일 환경 감지 및 처리 훅
 */
import { useState, useEffect, useCallback } from 'react'

// 브레이크포인트
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1400,
}

/**
 * 화면 크기 감지 훅
 */
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    ...screenSize,
    isMobile: screenSize.width <= BREAKPOINTS.mobile,
    isTablet: screenSize.width > BREAKPOINTS.mobile && screenSize.width <= BREAKPOINTS.tablet,
    isDesktop: screenSize.width > BREAKPOINTS.tablet,
    isWide: screenSize.width > BREAKPOINTS.wide,
  }
}

/**
 * 터치 디바이스 감지 훅
 */
export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }

    checkTouch()
    window.addEventListener('touchstart', () => setIsTouch(true), { once: true })
  }, [])

  return isTouch
}

/**
 * 모바일 네이티브 기능 훅
 */
export const useMobileFeatures = () => {
  const { isMobile, isTablet } = useScreenSize()
  const isTouch = useIsTouchDevice()

  // 진동 피드백
  const vibrate = useCallback((pattern = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  // 화면 깨우기 방지
  const [wakeLock, setWakeLock] = useState(null)

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        const lock = await navigator.wakeLock.request('screen')
        setWakeLock(lock)
        return lock
      } catch (err) {
        console.log('Wake Lock error:', err)
      }
    }
    return null
  }, [])

  const releaseWakeLock = useCallback(() => {
    if (wakeLock) {
      wakeLock.release()
      setWakeLock(null)
    }
  }, [wakeLock])

  // 전체화면 모드
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  // PWA 설치 프롬프트
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = useCallback(async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const result = await installPrompt.userChoice
      setInstallPrompt(null)
      return result.outcome === 'accepted'
    }
    return false
  }, [installPrompt])

  return {
    isMobile,
    isTablet,
    isTouch,
    isMobileDevice: isMobile || isTablet || isTouch,
    vibrate,
    requestWakeLock,
    releaseWakeLock,
    toggleFullscreen,
    canInstallPWA: !!installPrompt,
    promptInstall,
  }
}

/**
 * 스와이프 제스처 훅
 */
export const useSwipe = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
  } = options

  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 })

  const onTouchStart = useCallback((e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }, [])

  const onTouchMove = useCallback((e) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }, [])

  const onTouchEnd = useCallback(() => {
    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > threshold || absY > threshold) {
      if (absX > absY) {
        // 수평 스와이프
        if (deltaX > 0) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
      } else {
        // 수직 스와이프
        if (deltaY > 0) {
          onSwipeUp?.()
        } else {
          onSwipeDown?.()
        }
      }
    }
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

/**
 * 안전 영역 인셋 훅 (노치, 홈 인디케이터)
 */
export const useSafeArea = () => {
  const [insets, setInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    setInsets({
      top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
      bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
      left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
      right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
    })

    // CSS 변수 설정
    root.style.setProperty('--sat', 'env(safe-area-inset-top)')
    root.style.setProperty('--sab', 'env(safe-area-inset-bottom)')
    root.style.setProperty('--sal', 'env(safe-area-inset-left)')
    root.style.setProperty('--sar', 'env(safe-area-inset-right)')
  }, [])

  return insets
}

export default {
  useScreenSize,
  useIsTouchDevice,
  useMobileFeatures,
  useSwipe,
  useSafeArea,
  BREAKPOINTS,
}
