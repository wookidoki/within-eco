import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import Button from './Button'
import { darkTheme } from '../../../styles/theme'

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {component}
    </ThemeProvider>
  )
}

describe('Button', () => {
  it('children을 렌더링한다', () => {
    renderWithTheme(<Button>클릭하세요</Button>)
    expect(screen.getByText('클릭하세요')).toBeInTheDocument()
  })

  it('클릭 이벤트를 처리한다', () => {
    const handleClick = vi.fn()
    renderWithTheme(<Button onClick={handleClick}>클릭</Button>)

    fireEvent.click(screen.getByText('클릭'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태에서 클릭이 안된다', () => {
    const handleClick = vi.fn()
    renderWithTheme(<Button onClick={handleClick} disabled>클릭</Button>)

    const button = screen.getByText('클릭')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  it('variant prop을 적용한다', () => {
    renderWithTheme(<Button variant="secondary">버튼</Button>)
    expect(screen.getByText('버튼')).toBeInTheDocument()
  })
})
