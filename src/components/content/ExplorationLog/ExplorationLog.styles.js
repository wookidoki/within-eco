import styled from 'styled-components'

export const Container = styled.div`
  padding: 20px;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`

export const TotalCount = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
`

export const Timeline = styled.div`
  position: relative;
  padding-left: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
    );
    border-radius: 1px;
  }
`

export const LogEntry = styled.div`
  position: relative;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 14px;
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: 1px solid ${({ theme }) => theme.colors.border};

  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 22px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    border: 2px solid ${({ theme }) => theme.colors.background};
    box-shadow: 0 0 10px ${({ $color }) => $color}80;
  }
`

export const EntryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`

export const EntryEmoji = styled.span`
  font-size: 28px;
`

export const EntryInfo = styled.div`
  flex: 1;
`

export const EntryName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`

export const EntryDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const EntryMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const MetaTag = styled.span`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
`

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`

export const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`

export const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`

export const StartButton = styled.button`
  margin-top: 20px;
  padding: 14px 28px;
  border-radius: 14px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  color: ${({ theme }) => theme.colors.background};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`
