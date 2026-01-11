import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

export const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px 24px;
  background: #ffffff;
  border: 1px solid #dadce0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #c6c6c6;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

export const GoogleIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const GoogleLogo = styled.svg`
  width: 20px;
  height: 20px;
`

export const ButtonText = styled.span`
  font-weight: 600;
`

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: #4285f4;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`
