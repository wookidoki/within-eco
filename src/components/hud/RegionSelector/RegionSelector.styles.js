import styled from 'styled-components'

export const SelectorWrapper = styled.div`
  padding: 8px;
  max-height: 70vh;
  overflow-y: auto;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary}40;
    border-radius: 3px;
  }
`

export const AllRegionButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  border: 2px solid ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : 'transparent'};
  background: ${({ $isActive, theme }) =>
    $isActive
      ? `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.primary}10)`
      : theme.colors.surface};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}15`};
    transform: translateY(-1px);
  }
`

export const AllRegionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const AllRegionEmoji = styled.span`
  font-size: 24px;
`

export const AllRegionText = styled.div`
  text-align: left;
`

export const AllRegionName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const AllRegionDesc = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`

export const AllRegionCount = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary}15;
  padding: 4px 10px;
  border-radius: 20px;
`

export const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 10px;
  padding-left: 4px;
`

export const RegionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  @media (max-width: 400px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

export const RegionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  border-radius: 10px;
  border: 2px solid ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : 'transparent'};
  background: ${({ $isActive, theme }) =>
    $isActive ? `${theme.colors.primary}20` : theme.colors.surface};
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 70px;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`

export const RegionEmoji = styled.span`
  font-size: 20px;
  margin-bottom: 4px;
`

export const RegionName = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

export const SpotCount = styled.span`
  font-size: 10px;
  color: ${({ $hasSpots, theme }) =>
    $hasSpots ? theme.colors.primary : theme.colors.textSecondary};
  margin-top: 2px;
  font-weight: ${({ $hasSpots }) => $hasSpots ? '600' : '400'};
`
