import styled from 'styled-components'

export const PanelContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  width: 320px;
  height: 100vh;
  z-index: 20;

  display: flex;
  flex-direction: column;

  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  overflow-y: auto;
  overflow-x: hidden;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 320px;
    height: auto;
    max-height: 50vh;
    top: auto;
    bottom: 0;
    border-right: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 20px 20px 0 0;
    transform: translateY(${({ $isOpen }) => $isOpen ? '0' : 'calc(100% - 60px)' });
    transition: transform 0.3s ease;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 60vh;
  }
`

export const PanelHeader = styled.header`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
`

export const PanelTitle = styled.div`
  flex: 1;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.secondary};
  padding: 6px 10px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
`
