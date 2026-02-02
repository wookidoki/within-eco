import styled from 'styled-components'

export const Container = styled.div`
  padding: 20px;
`

export const Header = styled.div`
  margin-bottom: 20px;
`

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

export const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const OverallProgress = styled.div`
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary}15,
    ${({ theme }) => theme.colors.secondary}15
  );
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  margin-bottom: 24px;
`

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`

export const ProgressText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`

export const ProgressPercent = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
`

export const ProgressBar = styled.div`
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
`

export const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  border-radius: 6px;
  transition: width 0.5s ease;
`

export const RegionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`

export const RegionCard = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: 1px solid ${({ $hasProgress, theme }) =>
    $hasProgress ? theme.colors.primary + '40' : theme.colors.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

export const RegionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`

export const RegionEmoji = styled.span`
  font-size: 24px;
`

export const RegionName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const RegionStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const RegionCount = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const RegionProgressBar = styled.div`
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`

export const RegionProgressFill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 3px;
  transition: width 0.3s ease;
`

export const CompleteBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
`
