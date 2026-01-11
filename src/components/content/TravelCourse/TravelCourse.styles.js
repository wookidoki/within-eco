import styled from 'styled-components'

export const CourseCard = styled.div`
  padding: 20px;
  border-radius: 16px;
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`

export const CourseHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
`

export const CourseThumbnail = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary}30,
    ${({ theme }) => theme.colors.secondary}30
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
`

export const CourseInfo = styled.div`
  flex: 1;
`

export const CourseName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 6px;
`

export const CourseDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`

export const CourseMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const MetaTag = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    width: 14px;
    height: 14px;
  }
`

export const SpotPreview = styled.div`
  display: flex;
  align-items: center;
  gap: -8px;
  margin-top: 12px;
`

export const SpotDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $color }) => $color}30;
  border: 2px solid ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-left: -8px;

  &:first-child {
    margin-left: 0;
  }
`

export const MoreSpots = styled.span`
  margin-left: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

export const ListTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`

export const FilterButton = styled.button`
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`
