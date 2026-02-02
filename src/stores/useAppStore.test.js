import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import useAppStore from './useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    act(() => {
      useAppStore.setState({
        userLocation: null,
        isLoading: false,
        modalOpen: false,
      })
    })
  })

  describe('userLocation', () => {
    it('초기 위치가 null이어야 한다', () => {
      const { userLocation } = useAppStore.getState()
      expect(userLocation).toBeNull()
    })

    it('setUserLocation으로 위치를 설정할 수 있다', () => {
      const { setUserLocation } = useAppStore.getState()
      const testLocation = { lat: 37.5665, lng: 126.9780 }

      act(() => {
        setUserLocation(testLocation)
      })

      expect(useAppStore.getState().userLocation).toEqual(testLocation)
    })
  })

  describe('isLoading', () => {
    it('초기 로딩 상태가 false여야 한다', () => {
      const { isLoading } = useAppStore.getState()
      expect(isLoading).toBe(false)
    })

    it('setIsLoading으로 로딩 상태를 변경할 수 있다', () => {
      const { setIsLoading } = useAppStore.getState()

      act(() => {
        setIsLoading(true)
      })

      expect(useAppStore.getState().isLoading).toBe(true)

      act(() => {
        setIsLoading(false)
      })

      expect(useAppStore.getState().isLoading).toBe(false)
    })
  })

  describe('modalOpen', () => {
    it('초기 모달 상태가 false여야 한다', () => {
      const { modalOpen } = useAppStore.getState()
      expect(modalOpen).toBe(false)
    })

    it('setModalOpen으로 모달 상태를 변경할 수 있다', () => {
      const { setModalOpen } = useAppStore.getState()

      act(() => {
        setModalOpen(true)
      })

      expect(useAppStore.getState().modalOpen).toBe(true)

      act(() => {
        setModalOpen(false)
      })

      expect(useAppStore.getState().modalOpen).toBe(false)
    })
  })
})
