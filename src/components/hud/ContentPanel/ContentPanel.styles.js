import styled, { keyframes } from 'styled-components'

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

export const PanelOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
  display: flex;
  justify-content: flex-end;
`

export const PanelContainer = styled.div`
  width: 100%;
  max-width: 420px;
  height: 100%;
  background: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${slideIn} 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 480px) {
    max-width: 100%;
    border-left: none;
    border-radius: 0;
  }
`

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const PanelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
`

export const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
`

export const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`

export const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

export const Tab = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary + '20' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary + '40' : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.6)'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary + '25' : 'rgba(255, 255, 255, 0.1)'};
  }
`
