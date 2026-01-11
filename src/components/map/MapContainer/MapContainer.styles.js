import styled, { css, keyframes } from 'styled-components'

// 다크모드 CSS 필터 - 메타버스/사이버펑크 느낌
const darkModeFilter = css`
  filter:
    invert(1)
    hue-rotate(180deg)
    saturate(1.2)
    brightness(0.95)
    contrast(1.1);
`

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`

export const MapWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;

  .gm-style {
    font-family: inherit;
    transition: filter 0.3s ease;
    ${({ $isDarkMode }) => $isDarkMode && darkModeFilter}
  }

  .gm-style-cc {
    opacity: 0.5;
  }

  /* InfoWindow 스타일 오버라이드 */
  .gm-style-iw {
    padding: 0 !important;
  }

  .gm-style-iw-d {
    overflow: hidden !important;
  }

  .gm-style-iw-tc {
    display: none;
  }

  .gm-ui-hover-effect {
    top: 4px !important;
    right: 4px !important;
  }
`

const getMarkerDimensions = (size) => {
  switch (size) {
    case 'large': return { width: '32px', height: '32px', fontSize: '16px' }
    case 'medium': return { width: '24px', height: '24px', fontSize: '12px' }
    case 'small': return { width: '16px', height: '16px', fontSize: '10px' }
    default: return { width: '24px', height: '24px', fontSize: '12px' }
  }
}

export const MarkerDot = styled.div`
  position: relative;
  width: ${({ $size }) => getMarkerDimensions($size).width};
  height: ${({ $size }) => getMarkerDimensions($size).height};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => getMarkerDimensions($size).fontSize};

  background: ${({ $color }) => $color}40;
  border: 2px solid ${({ $color }) => $color};
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);

  cursor: pointer;
  transition: transform 0.15s ease;
  will-change: transform;
  transform: translateZ(0); /* GPU 가속 */
  contain: layout style paint; /* 렌더링 격리 */

  opacity: ${({ $isUnlocked }) => ($isUnlocked ? 1 : 0.7)};

  &:hover {
    transform: scale(1.3) translateZ(0);
    z-index: 100;
  }

  /* 호버시에만 펄스 애니메이션 */
  &:hover > div {
    animation: ${pulseAnimation} 1.5s ease-out infinite;
  }

  /* 모바일 터치 피드백 */
  @media (hover: none) {
    &:active {
      transform: scale(1.2) translateZ(0);
    }
  }
`

export const MarkerPulse = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  opacity: 0;
  z-index: -1;
  will-change: transform, opacity;
  transform: translateZ(0);
`

export const InfoWindowContent = styled.div`
  padding: 16px;
  min-width: 280px;
  max-width: 320px;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  border-radius: 12px;
  color: #fff;
`

export const InfoHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`

export const InfoThumbnail = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: ${({ $color }) => $color}30;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`

export const InfoTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  line-height: 1.3;
`

export const InfoCategory = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  display: block;
`

export const InfoDistrict = styled.span`
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`

export const EcoScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`

export const EcoScoreItem = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
`

export const EcoScoreValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ $color }) => $color || '#00FF94'};
  margin-bottom: 2px;
`

export const EcoScoreLabel = styled.div`
  font-size: 10px;
  color: rgba(255,255,255,0.6);
`

export const EcoBar = styled.div`
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
`

export const EcoBarFill = styled.div`
  height: 100%;
  width: ${({ $value }) => Math.min($value, 100)}%;
  background: ${({ $color }) => $color || '#00FF94'};
  border-radius: 2px;
  transition: width 0.3s ease;
`

export const InfoSummary = styled.div`
  background: linear-gradient(135deg, rgba(0,255,148,0.1), rgba(0,212,255,0.1));
  border: 1px solid rgba(0,255,148,0.2);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
  font-size: 12px;
  color: rgba(255,255,255,0.9);
  line-height: 1.5;
  text-align: center;
`

export const InfoButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00FF94, #00D4FF);
  color: #0B101A;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0,255,148,0.3);
  }
`

const currentLocationPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`

export const CurrentLocationMarker = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  .dot {
    width: 14px;
    height: 14px;
    background: #4285F4;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    z-index: 2;
    transform: translateZ(0);
  }

  .pulse {
    position: absolute;
    width: 24px;
    height: 24px;
    background: rgba(66, 133, 244, 0.3);
    border-radius: 50%;
    animation: ${currentLocationPulse} 2s ease-out infinite;
    will-change: transform, opacity;
    transform: translateZ(0);
  }
`

export const ClusterMarker = styled.div`
  width: ${({ $size }) => Math.min(40 + $size * 2, 80)}px;
  height: ${({ $size }) => Math.min(40 + $size * 2, 80)}px;
  background: linear-gradient(135deg, #00FF94, #00D4FF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => Math.min(14 + $size * 0.5, 20)}px;
  font-weight: 700;
  color: #0B101A;
  box-shadow: 0 4px 12px rgba(0,255,148,0.4);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`
