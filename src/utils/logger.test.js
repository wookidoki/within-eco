import { describe, it, expect, beforeEach, vi } from 'vitest'
import logger, { setToastCallback } from './logger'

describe('logger', () => {
  let consoleSpy

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
  })

  describe('기본 로그 함수', () => {
    it('info 로그를 출력할 수 있다', () => {
      logger.info('테스트 메시지')
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('success 로그를 출력할 수 있다', () => {
      logger.success('성공 메시지')
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('warning 로그를 출력할 수 있다', () => {
      logger.warning('경고 메시지')
      expect(consoleSpy.warn).toHaveBeenCalled()
    })

    it('error 로그를 출력할 수 있다', () => {
      logger.error('에러 메시지')
      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('Toast 콜백', () => {
    it('setToastCallback으로 콜백을 설정할 수 있다', () => {
      const mockCallback = vi.fn()
      setToastCallback(mockCallback)

      logger.success('토스트 테스트', null, true)

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'success',
        message: '토스트 테스트',
      })
    })
  })

  describe('auth 헬퍼', () => {
    it('loginStart 로그를 출력한다', () => {
      logger.auth.loginStart()
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('loginSuccess 로그를 출력한다', () => {
      logger.auth.loginSuccess({ name: '테스트 유저' })
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('loginError 로그를 출력한다', () => {
      logger.auth.loginError(new Error('테스트 에러'))
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('logoutSuccess 로그를 출력한다', () => {
      logger.auth.logoutSuccess()
      expect(consoleSpy.log).toHaveBeenCalled()
    })
  })

  describe('game 헬퍼', () => {
    it('spotUnlocked 로그를 출력한다', () => {
      logger.game.spotUnlocked('테스트 공원')
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('levelUp 로그를 출력한다', () => {
      logger.game.levelUp(5)
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('xpGained 로그를 출력한다', () => {
      logger.game.xpGained(100)
      expect(consoleSpy.log).toHaveBeenCalled()
    })
  })

  describe('map 헬퍼', () => {
    it('locationFound 로그를 출력한다', () => {
      logger.map.locationFound({ lat: 37.5, lng: 127.0 })
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('locationError 로그를 출력한다', () => {
      logger.map.locationError()
      expect(consoleSpy.warn).toHaveBeenCalled()
    })

    it('navigateTo 로그를 출력한다', () => {
      logger.map.navigateTo('테스트 공원')
      expect(consoleSpy.log).toHaveBeenCalled()
    })
  })
})
