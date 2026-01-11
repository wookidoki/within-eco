import styled, { keyframes } from 'styled-components'

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

export const PreviewContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  z-index: 100;

  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  border-radius: 20px;
  overflow: hidden;

  animation: ${slideUp} 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    left: 16px;
    right: 16px;
    width: auto;
    bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  }

  @media (max-width: 480px) {
    left: 12px;
    right: 12px;
    bottom: calc(90px + env(safe-area-inset-bottom, 0px));
    border-radius: 16px;
  }
`

export const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
`

export const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.glass};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`

export const PreviewBody = styled.div`
  padding: 16px;
`

export const SpotName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px 0;
`

export const SpotType = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 12px 0;
`

export const SpotMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`

export const MetaTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`

export const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  margin-bottom: 16px;
`

export const StatItem = styled.div`
  text-align: center;
`

export const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

export const StatLabel = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const PreviewActions = styled.div`
  display: flex;
  gap: 10px;
`

export const ActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  background: ${({ $primary, theme }) =>
    $primary
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
      : theme.colors.surface};

  color: ${({ $primary, theme }) =>
    $primary ? '#0B101A' : theme.colors.text};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.colors.primary}40;
  }
`
