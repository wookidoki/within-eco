import styled from 'styled-components'

export const Card = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`

export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg,
    ${({ $color }) => $color}30,
    ${({ $color }) => $color}10
  );
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Thumbnail = styled.span`
  font-size: 48px;
`

export const SeasonTag = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  backdrop-filter: blur(4px);
`

export const UnlockedBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`

export const Content = styled.div`
  padding: 14px;
`

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`

export const Name = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`

export const Score = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`

export const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    width: 12px;
    height: 12px;
  }
`

export const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
`

export const Description = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`
