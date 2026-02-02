import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

export const Container = styled.div`
  padding: 20px 24px;
  animation: ${fadeIn} 0.3s ease;
`

export const WelcomeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
`

export const WelcomeEmoji = styled.span`
  font-size: 40px;
`

export const WelcomeText = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`

export const WelcomeSubtext = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`

export const StatCard = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
`

export const StatIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`

export const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

export const StatLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`

export const ProgressSection = styled.div`
  margin-bottom: 24px;
`

export const ProgressTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 10px;
`

export const LevelBar = styled.div`
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
`

export const LevelProgress = styled.div`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background: linear-gradient(90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  border-radius: 5px;
  transition: width 0.5s ease;
`

export const LevelInfo = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 8px;
  text-align: right;
`

export const AchievementSection = styled.div`
  margin-bottom: 24px;
`

export const AchievementTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`

export const AchievementList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  background: ${({ $unlocked }) =>
    $unlocked ? 'rgba(0, 255, 148, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ $unlocked }) =>
    $unlocked ? 'rgba(0, 255, 148, 0.3)' : 'rgba(255, 255, 255, 0.08)'};
  opacity: ${({ $unlocked }) => ($unlocked ? 1 : 0.5)};
`

export const AchievementEmoji = styled.span`
  font-size: 16px;
`

export const AchievementText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`

export const TipBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
`

export const TipEmoji = styled.span`
  font-size: 18px;
`

export const TipText = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};

  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`
