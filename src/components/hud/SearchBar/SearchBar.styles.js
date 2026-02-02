import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

export const SearchBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const LocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 25px;
  max-width: 280px;

  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};

  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  .spin {
    animation: ${spin} 1s linear infinite;
  }

  &:hover {
    transform: scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`

export const LocationText = styled.span`
  flex: 1;
  text-align: left;
`

export const CategoryList = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`

export const CategoryChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 20px;
  white-space: nowrap;

  background: ${({ $active, $color, theme }) =>
    $active ? $color : theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: 2px solid ${({ $active, $color }) =>
    $active ? $color : 'transparent'};

  color: ${({ $active, theme }) =>
    $active ? theme.colors.background : theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`

export const ChipEmoji = styled.span`
  font-size: 16px;
`

export const ChipLabel = styled.span``

export const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 25px;
  flex: 1;
  max-width: 400px;

  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  color: ${({ theme }) => theme.colors.text};

  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`

export const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`

export const SearchIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 50%;
  border: none;
  cursor: pointer;

  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`

export const SearchResults = styled.div`
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  border-radius: 16px;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`

export const SearchResultItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`

export const ResultName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const ResultMeta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`

export const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`
