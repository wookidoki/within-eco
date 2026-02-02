import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

export const ModalContainer = styled.div`
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  border-radius: ${({ theme }) => theme.glassmorphism.borderRadius};
  padding: ${({ theme }) => theme.spacing.xl};
  min-width: 300px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.card};
`
