import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(11, 16, 26, 0.98);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease;
`

export const Container = styled.div`
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: ${slideUp} 0.5s ease;
`

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
`

export const StepDot = styled.div`
  width: ${({ $active }) => $active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s ease;
`

export const IconContainer = styled.div`
  font-size: 100px;
  margin-bottom: 32px;
  animation: ${float} 3s ease-in-out infinite;
`

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  line-height: 1.3;
`

export const GradientText = styled.span`
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

export const Description = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
`

export const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
  text-align: left;
`

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
`

export const FeatureIcon = styled.span`
  font-size: 24px;
`

export const FeatureText = styled.span`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
`

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`

export const SkipButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`

export const NextButton = styled.button`
  flex: 2;
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  color: ${({ theme }) => theme.colors.background};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 20px ${({ theme }) => theme.colors.primary}40;
  }
`
