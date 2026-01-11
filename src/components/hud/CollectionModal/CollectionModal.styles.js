import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideIn = keyframes`
  from {
    transform: translateY(50px);
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease;
`

export const ModalContainer = styled.div`
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;

  padding: 24px;
  border-radius: 24px;

  background: ${({ theme }) => theme.colors.surface || theme.colors.background};
  border: ${({ theme }) => theme.glassmorphism.border};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

  animation: ${slideIn} 0.3s ease-out;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

export const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: ${({ theme }) => theme.colors.glass};
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
`

export const ProgressFill = styled.div`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background: linear-gradient(90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  border-radius: 6px;
  transition: width 0.5s ease;
`

export const ProgressText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 20px;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`

export const Card = styled.div`
  perspective: 1000px;
  height: 180px;
  cursor: ${({ $isUnlocked }) => ($isUnlocked ? 'pointer' : 'default')};
`

export const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${({ $isUnlocked }) => ($isUnlocked ? 'rotateY(180deg)' : 'rotateY(0)')};
`

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

export const CardFront = styled(CardFace)`
  background: ${({ theme }) => theme.colors.glass};
  border: 2px dashed ${({ theme }) => theme.colors.border};
`

export const CardBack = styled(CardFace)`
  background: linear-gradient(135deg,
    ${({ $color }) => $color}20,
    ${({ $color }) => $color}05
  );
  border: 2px solid ${({ $color }) => $color}50;
  transform: rotateY(180deg);

  &:hover {
    box-shadow: 0 0 20px ${({ $color }) => $color}40;
  }
`

export const LockIcon = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 12px;
`

export const Silhouette = styled.div`
  font-size: 48px;
  filter: grayscale(1) brightness(0.3);
  margin-bottom: 8px;
`

export const CardEmoji = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`

export const CardName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`

export const CardCategory = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ $color }) => $color};
  margin-top: 8px;
`

export const CardScore = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  margin-top: 4px;
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`

export const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`

export const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`
