/**
 * Logger 유틸리티
 * Console 로깅 + Toast 알림 통합
 */

// Toast 콜백 (Toast 컴포넌트에서 설정)
let toastCallback = null

/**
 * Toast 콜백 설정 (Toast 컴포넌트에서 호출)
 */
export const setToastCallback = (callback) => {
  toastCallback = callback
}

// 로그 레벨 정의
const LOG_LEVELS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
}

// 콘솔 스타일 정의
const CONSOLE_STYLES = {
  info: 'color: #00D4FF; font-weight: bold;',
  success: 'color: #00FF94; font-weight: bold;',
  warning: 'color: #FFB800; font-weight: bold;',
  error: 'color: #FF2A6D; font-weight: bold;',
}

// 이모지 정의
const EMOJIS = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

/**
 * 기본 로그 함수
 */
const log = (level, message, data = null, showToast = false) => {
  // 콘솔 출력
  const timestamp = new Date().toLocaleTimeString()
  const prefix = `[${timestamp}] ${EMOJIS[level]}`

  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(`%c${prefix} ${message}`, CONSOLE_STYLES[level], data || '')
      break
    case LOG_LEVELS.WARNING:
      console.warn(`%c${prefix} ${message}`, CONSOLE_STYLES[level], data || '')
      break
    default:
      console.log(`%c${prefix} ${message}`, CONSOLE_STYLES[level], data || '')
  }

  // Toast 표시
  if (showToast && toastCallback) {
    toastCallback({ type: level, message })
  }
}

/**
 * Logger 객체
 */
const logger = {
  /**
   * 정보 로그
   */
  info: (message, data = null, showToast = false) => {
    log(LOG_LEVELS.INFO, message, data, showToast)
  },

  /**
   * 성공 로그
   */
  success: (message, data = null, showToast = true) => {
    log(LOG_LEVELS.SUCCESS, message, data, showToast)
  },

  /**
   * 경고 로그
   */
  warning: (message, data = null, showToast = true) => {
    log(LOG_LEVELS.WARNING, message, data, showToast)
  },

  /**
   * 에러 로그
   */
  error: (message, data = null, showToast = true) => {
    log(LOG_LEVELS.ERROR, message, data, showToast)
  },

  /**
   * 인증 관련 로그 헬퍼
   */
  auth: {
    loginStart: () => {
      logger.info('Google 로그인 시작...', null, true)
    },
    loginSuccess: (user) => {
      logger.success(`환영합니다, ${user?.name || 'User'}님!`, user, true)
    },
    loginError: (error) => {
      logger.error('로그인 실패', error, true)
    },
    logoutSuccess: () => {
      logger.success('로그아웃 되었습니다', null, true)
    },
    syncStart: () => {
      logger.info('진행상황 저장 중...', null, false)
    },
    syncSuccess: () => {
      logger.success('클라우드에 저장되었습니다', null, false)
    },
    syncError: (error) => {
      logger.error('저장 실패', error, true)
    },
    loadSuccess: () => {
      logger.success('클라우드 데이터를 불러왔습니다', null, true)
    },
  },

  /**
   * 게임 관련 로그 헬퍼
   */
  game: {
    spotUnlocked: (spotName) => {
      logger.success(`${spotName} 스팟 해금!`, null, true)
    },
    levelUp: (level) => {
      logger.success(`레벨 업! Lv.${level}`, null, true)
    },
    xpGained: (xp) => {
      logger.info(`+${xp} XP`, null, false)
    },
  },

  /**
   * 지도 관련 로그 헬퍼
   */
  map: {
    locationFound: (location) => {
      logger.info('현재 위치를 찾았습니다', location, true)
    },
    locationError: () => {
      logger.warning('위치를 찾을 수 없습니다', null, true)
    },
    navigateTo: (spotName) => {
      logger.info(`${spotName}(으)로 이동`, null, false)
    },
  },
}

export default logger
