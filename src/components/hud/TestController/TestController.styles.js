import styled from 'styled-components'

export const ControllerButton = styled.button`
  position: fixed;
  bottom: 100px;
  left: 20px;
  z-index: 50;

  width: 44px;
  height: 44px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;

  &:hover {
    opacity: 1;
    transform: rotate(90deg);
  }
`

export const Panel = styled.div`
  position: fixed;
  bottom: 100px;
  left: 20px;
  z-index: 50;

  width: 240px;
  padding: 16px;
  border-radius: 16px;

  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
`

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

export const PanelTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`

export const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.glass};
  }
`

export const ButtonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const TestButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;

  background: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger + '20' : theme.colors.glass};
  color: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger : theme.colors.text};

  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger : theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
`
