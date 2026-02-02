import styled, { keyframes } from 'styled-components'

// 글리치 애니메이션
const glitch = keyframes`
  0% {
    text-shadow:
      0.05em 0 0 rgba(255, 0, 153, 0.75),
      -0.05em -0.025em 0 rgba(0, 255, 148, 0.75),
      -0.025em 0.05em 0 rgba(0, 212, 255, 0.75);
  }
  14% {
    text-shadow:
      0.05em 0 0 rgba(255, 0, 153, 0.75),
      -0.05em -0.025em 0 rgba(0, 255, 148, 0.75),
      -0.025em 0.05em 0 rgba(0, 212, 255, 0.75);
  }
  15% {
    text-shadow:
      -0.05em -0.025em 0 rgba(255, 0, 153, 0.75),
      0.025em 0.025em 0 rgba(0, 255, 148, 0.75),
      -0.05em -0.05em 0 rgba(0, 212, 255, 0.75);
  }
  49% {
    text-shadow:
      -0.05em -0.025em 0 rgba(255, 0, 153, 0.75),
      0.025em 0.025em 0 rgba(0, 255, 148, 0.75),
      -0.05em -0.05em 0 rgba(0, 212, 255, 0.75);
  }
  50% {
    text-shadow:
      0.025em 0.05em 0 rgba(255, 0, 153, 0.75),
      0.05em 0 0 rgba(0, 255, 148, 0.75),
      0 -0.05em 0 rgba(0, 212, 255, 0.75);
  }
  99% {
    text-shadow:
      0.025em 0.05em 0 rgba(255, 0, 153, 0.75),
      0.05em 0 0 rgba(0, 255, 148, 0.75),
      0 -0.05em 0 rgba(0, 212, 255, 0.75);
  }
  100% {
    text-shadow:
      -0.025em 0 0 rgba(255, 0, 153, 0.75),
      -0.025em -0.025em 0 rgba(0, 255, 148, 0.75),
      -0.025em -0.05em 0 rgba(0, 212, 255, 0.75);
  }
`

const glitchSkew = keyframes`
  0% { transform: skew(0deg); }
  20% { transform: skew(0deg); }
  21% { transform: skew(-1deg); }
  22% { transform: skew(1deg); }
  23% { transform: skew(0deg); }
  100% { transform: skew(0deg); }
`

const glow = keyframes`
  0%, 100% {
    text-shadow:
      0 0 10px rgba(0, 255, 148, 0.5),
      0 0 20px rgba(0, 255, 148, 0.3),
      0 0 40px rgba(0, 255, 148, 0.2);
  }
  50% {
    text-shadow:
      0 0 15px rgba(0, 255, 148, 0.7),
      0 0 30px rgba(0, 255, 148, 0.5),
      0 0 60px rgba(0, 255, 148, 0.3);
  }
`

export const LogoContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
  user-select: none;
`

export const LogoPrefix = styled.span`
  font-family: 'Courier New', Consolas, monospace;
  font-size: 24px;
  font-weight: 700;
  color: #FF0099;
  position: relative;
  animation: ${glitch} 3s infinite, ${glitchSkew} 3s infinite;

  &::before,
  &::after {
    content: 'Re:';
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.8;
  }

  &::before {
    color: #00D4FF;
    animation: ${glitch} 2s infinite reverse;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    transform: translateX(-2px);
  }

  &::after {
    color: #00FF94;
    animation: ${glitch} 2.5s infinite;
    clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
    transform: translateX(2px);
  }
`

export const LogoMain = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #00FF94;
  letter-spacing: -0.5px;
  animation: ${glow} 2s ease-in-out infinite;
`

export const LogoSubtitle = styled.span`
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-top: 4px;
  margin-left: 2px;
`
