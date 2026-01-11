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
  z-index: 200;
  padding: 20px;
`

export const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;

  padding: 24px;
  border-radius: 24px;

  background: ${({ theme }) => theme.colors.surface || theme.colors.background};
  border: ${({ theme }) => theme.glassmorphism.border};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);

  animation: ${slideUp} 0.3s ease-out;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.glass};
    border-radius: 2px;
  }
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.glass};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: white;
  }
`

export const Section = styled.div`
  margin-bottom: 24px;
`

export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.glass};
`

export const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary}22;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  object-fit: cover;
`

export const UserDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const UserEmail = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const NicknameForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const NicknameInput = styled.input`
  padding: 10px 14px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.glass};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

export const NicknameActions = styled.div`
  display: flex;
  gap: 8px;
`

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  background: ${({ $primary, $danger, theme }) =>
    $primary
      ? theme.colors.primary
      : $danger
        ? theme.colors.danger
        : theme.colors.glass};
  color: ${({ $primary, $danger, theme }) =>
    $primary || $danger ? '#fff' : theme.colors.text};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.glass};
`

export const StatValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

export const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  text-align: center;
`

export const DangerSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.danger}15;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
`

export const DangerButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: white;
  }
`

export const ConfirmModal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 320px;
  padding: 24px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface || theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.danger};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 10;
`

export const ConfirmText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
`

export const ConfirmActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`
