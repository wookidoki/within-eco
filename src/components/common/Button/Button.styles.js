import styled, { css } from 'styled-components'

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.glow};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.danger};
    color: white;
    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.glowDanger};
    }
  `,
  glass: css`
    background: ${({ theme }) => theme.glassmorphism.background};
    backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
    border: ${({ theme }) => theme.glassmorphism.border};
    color: ${({ theme }) => theme.colors.text};
  `,
}

export const StyledButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;

  ${({ variant }) => variants[variant]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
