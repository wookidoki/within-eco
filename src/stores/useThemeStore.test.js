import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import useThemeStore from './useThemeStore'

describe('useThemeStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    act(() => {
      useThemeStore.setState({ isDarkMode: false })
    })
  })

  it('초기 상태가 라이트 모드여야 한다', () => {
    const { isDarkMode } = useThemeStore.getState()
    expect(isDarkMode).toBe(false)
  })

  it('toggleTheme으로 다크 모드를 토글할 수 있다', () => {
    const { toggleTheme } = useThemeStore.getState()

    act(() => {
      toggleTheme()
    })

    expect(useThemeStore.getState().isDarkMode).toBe(true)

    act(() => {
      toggleTheme()
    })

    expect(useThemeStore.getState().isDarkMode).toBe(false)
  })

  it('setDarkMode로 다크 모드를 직접 설정할 수 있다', () => {
    const { setDarkMode } = useThemeStore.getState()

    act(() => {
      setDarkMode(true)
    })

    expect(useThemeStore.getState().isDarkMode).toBe(true)

    act(() => {
      setDarkMode(false)
    })

    expect(useThemeStore.getState().isDarkMode).toBe(false)
  })
})
