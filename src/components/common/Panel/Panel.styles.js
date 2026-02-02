import styled from 'styled-components'

export const StyledPanel = styled.div`
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  border-radius: ${({ theme }) => theme.glassmorphism.borderRadius};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`
