import styled, { keyframes, css } from 'styled-components'

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`

export const ToastContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;

  @media (max-width: 480px) {
    left: 20px;
    right: 20px;
  }
`

const typeStyles = {
  info: css`
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05));
    border-left: 4px solid #00D4FF;
  `,
  success: css`
    background: linear-gradient(135deg, rgba(0, 255, 148, 0.15), rgba(0, 255, 148, 0.05));
    border-left: 4px solid #00FF94;
  `,
  warning: css`
    background: linear-gradient(135deg, rgba(255, 184, 0, 0.15), rgba(255, 184, 0, 0.05));
    border-left: 4px solid #FFB800;
  `,
  error: css`
    background: linear-gradient(135deg, rgba(255, 42, 109, 0.15), rgba(255, 42, 109, 0.05));
    border-left: 4px solid #FF2A6D;
  `,
}

export const ToastItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  min-width: 280px;
  max-width: 400px;
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
  animation: ${({ $isExiting }) => $isExiting ? slideOut : slideIn} 0.3s ease forwards;

  ${({ $type }) => typeStyles[$type] || typeStyles.info}

  @media (max-width: 480px) {
    min-width: auto;
    max-width: none;
  }
`

export const ToastIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`

export const ToastMessage = styled.p`
  flex: 1;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
`

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  flex-shrink: 0;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`
