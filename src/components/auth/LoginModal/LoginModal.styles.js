import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from {
    transform: translateY(30px);
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
  background: rgba(11, 16, 26, 0.95);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease;
`

export const ModalContainer = styled.div`
  width: 100%;
  max-width: 380px;
  background: ${({ theme }) => theme.glassmorphism?.background || 'rgba(21, 28, 40, 0.9)'};
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
  animation: ${slideUp} 0.4s ease;
`

export const LogoContainer = styled.div`
  margin-bottom: 24px;
`

export const Logo = styled.div`
  font-size: 56px;
  margin-bottom: 8px;
`

export const AppName = styled.h1`
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #00FF94, #00D4FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`

export const Tagline = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-top: 8px;
`

export const Description = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 28px;
`

export const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 32px;
  text-align: left;
`

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
`

export const FeatureIcon = styled.span`
  font-size: 18px;
  width: 28px;
  text-align: center;
`

export const FeatureText = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
`

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
`

export const DividerText = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`

export const SkipButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  padding: 12px;
  transition: color 0.2s;
  width: 100%;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`

export const PrivacyNote = styled.p`
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  margin-top: 16px;
  line-height: 1.5;
`
