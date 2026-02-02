import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import SpotCard from './SpotCard'
import { darkTheme } from '../../../styles/theme'

const mockSpot = {
  id: 'test-spot-1',
  name: '테스트 공원',
  thumbnail: '🌳',
  category: 'nature',
  region: 'SUWON',
  description: '테스트 공원 설명입니다.',
  duration: '2-3시간',
  bestSeason: ['SPRING', 'FALL'],
  ecoStats: {
    score: 85,
  },
}

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('SpotCard', () => {
  it('스팟 이름을 렌더링한다', () => {
    renderWithTheme(<SpotCard spot={mockSpot} isUnlocked={false} />)
    expect(screen.getByText('테스트 공원')).toBeInTheDocument()
  })

  it('스팟 설명을 렌더링한다', () => {
    renderWithTheme(<SpotCard spot={mockSpot} isUnlocked={false} />)
    expect(screen.getByText('테스트 공원 설명입니다.')).toBeInTheDocument()
  })

  it('썸네일 이모지를 렌더링한다', () => {
    renderWithTheme(<SpotCard spot={mockSpot} isUnlocked={false} />)
    expect(screen.getByText('🌳')).toBeInTheDocument()
  })

  it('에코 점수를 렌더링한다', () => {
    renderWithTheme(<SpotCard spot={mockSpot} isUnlocked={false} />)
    expect(screen.getByText(/85/)).toBeInTheDocument()
  })

  it('소요 시간을 렌더링한다', () => {
    renderWithTheme(<SpotCard spot={mockSpot} isUnlocked={false} />)
    expect(screen.getByText('2-3시간')).toBeInTheDocument()
  })

  it('해금된 상태에서 체크 배지를 표시한다', () => {
    renderWithTheme(<SpotCard spot={mockSpot} isUnlocked={true} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('해금되지 않은 상태에서 체크 배지가 없다', () => {
    renderWithTheme(<SpotCard spot={mockSpot} isUnlocked={false} />)
    expect(screen.queryByText('✓')).not.toBeInTheDocument()
  })

  it('클릭 시 onClick 콜백이 호출된다', () => {
    const handleClick = vi.fn()
    renderWithTheme(
      <SpotCard spot={mockSpot} isUnlocked={false} onClick={handleClick} />
    )

    fireEvent.click(screen.getByText('테스트 공원'))
    expect(handleClick).toHaveBeenCalledWith(mockSpot)
  })

  it('onClick이 없어도 에러가 발생하지 않는다', () => {
    renderWithTheme(<SpotCard spot={mockSpot} isUnlocked={false} />)
    expect(() => {
      fireEvent.click(screen.getByText('테스트 공원'))
    }).not.toThrow()
  })
})
