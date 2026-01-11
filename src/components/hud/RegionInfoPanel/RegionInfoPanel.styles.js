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

export const PanelContainer = styled.div`
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  max-width: 480px;
  max-height: 70vh;
  overflow-y: auto;

  padding: 24px;
  border-radius: ${({ theme }) => theme.glassmorphism.borderRadius};

  /* Glassmorphism */
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  box-shadow: ${({ theme }) => theme.shadows.card};

  animation: ${slideUp} 0.3s ease-out;

  /* 깜빡임 방지 */
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

export const RegionName = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;

  background: ${({ theme }) => theme.colors.glass};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: white;
  }
`

export const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`

export const StatItem = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.glass};
`

export const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;

  background: ${({ $highlight, theme }) =>
    $highlight ? theme.colors.primary : theme.colors.glass};
  color: ${({ $highlight, theme }) =>
    $highlight ? theme.colors.background : theme.colors.primary};
`

export const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`

export const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const StatValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  margin-top: 8px;
  border: none;

  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  color: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  /* 깜빡임 방지 */
  will-change: transform;
  backface-visibility: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }

  &:active {
    transform: translateY(0);
  }
`
