import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: ${({ $isActive }) =>
    $isActive
      ? 'linear-gradient(90deg, #00FF94, #00D4FF, #00FF94)'
      : 'rgba(255, 255, 255, 0.1)'};
  background-size: 200% 100%;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.background : theme.colors.textSecondary};
  border: 1px solid ${({ $isActive }) =>
    $isActive ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;

  ${({ $isActive }) =>
    $isActive &&
    `animation: ${shimmer} 3s linear infinite;`}
`

export const SeasonIcon = styled.span`
  font-size: 14px;
`
