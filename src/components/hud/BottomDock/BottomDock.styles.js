import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
`

export const DockContainer = styled.nav`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
`

export const ScanButton = styled.button`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 24px ${({ theme }) => theme.colors.primary}50;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 32px ${({ theme }) => theme.colors.primary}70;
  }

  &:active {
    transform: scale(0.95);
  }
`

export const ScanRipple = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  animation: ${pulse} 2s ease-out infinite;
`

export const ScanIcon = styled.span`
  position: relative;
  z-index: 1;
  font-size: 28px;
`

/* 더 이상 사용하지 않음 */
export const DockItem = styled.div``
export const DockLabel = styled.span``
export const DockEmoji = styled.span``
