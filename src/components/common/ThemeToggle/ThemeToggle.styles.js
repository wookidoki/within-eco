import styled from 'styled-components'

export const ToggleButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;

  width: 44px;
  height: 44px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};

  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`
