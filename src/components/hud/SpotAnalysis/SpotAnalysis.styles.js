import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`

export const Container = styled.div`
  padding: 20px 24px;
  animation: ${fadeIn} 0.3s ease;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
  }
`

export const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 600;
`

export const SpotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`

export const SpotEmoji = styled.div`
  font-size: 48px;
`

export const SpotDetails = styled.div`
  flex: 1;
`

export const SpotName = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`

export const SpotAddress = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Section = styled.div`
  margin-bottom: 20px;
`

export const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`

export const ScoreRing = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: conic-gradient(
    ${({ theme }) => theme.colors.primary} ${({ $score }) => $score * 3.6}deg,
    rgba(255, 255, 255, 0.1) 0deg
  );

  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(10, 20, 30, 0.9);
  }
`

export const ScoreValue = styled.span`
  position: relative;
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

export const ScoreLabel = styled.span`
  position: relative;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const AnalyzeButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 20px;

  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.secondary}30,
    ${({ theme }) => theme.colors.primary}30
  );
  border: 1px solid ${({ theme }) => theme.colors.secondary}50;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  animation: ${pulse} 2s ease-in-out infinite;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.background};
  }
`

export const MetricsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`

export const MetricCard = styled.div`
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: ${fadeIn} 0.5s ease;
`

export const MetricIcon = styled.span`
  font-size: 20px;
  display: block;
  margin-bottom: 8px;
`

export const MetricLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: block;
  margin-bottom: 8px;
`

export const MetricGauge = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
`

export const GaugeFill = styled.div`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background: ${({ $color }) => $color};
  border-radius: 3px;
  transition: width 1.5s ease-out;
`

export const MetricValue = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`

export const CountingNumber = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

export const ImpactMessage = styled.div`
  padding: 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.danger}15;
  border: 1px solid ${({ theme }) => theme.colors.danger}30;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: 16px;
`

export const MissionBox = styled.div`
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary}15,
    ${({ theme }) => theme.colors.secondary}15
  );
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  margin-bottom: 16px;
`

export const MissionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 6px;
`

export const MissionDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 6px;
`

export const MissionReward = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.warning};
`

export const StampButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;

  background: ${({ $isUnlocked, theme }) =>
    $isUnlocked
      ? 'rgba(255, 255, 255, 0.1)'
      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
  color: ${({ $isUnlocked, theme }) =>
    $isUnlocked ? theme.colors.textSecondary : theme.colors.background};

  font-size: 16px;
  font-weight: 700;
  cursor: ${({ $isUnlocked }) => ($isUnlocked ? 'default' : 'pointer')};
  transition: all 0.2s ease;

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`
