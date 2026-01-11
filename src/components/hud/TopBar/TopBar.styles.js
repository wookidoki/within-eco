import styled from 'styled-components'

export const TopBarContainer = styled.header`
  position: absolute;
  top: 0;
  left: 320px;  /* 사이드 패널 너비만큼 띄움 */
  right: 0;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;

  > * {
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    left: 0;
    padding: 8px;
  }
`

export const LeftSection = styled.div`
  flex: 1;
  max-width: 500px;
`

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
`

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}20`};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

export const FilterLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
`

export const FilterCount = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => `${theme.colors.primary}20`};
  padding: 2px 8px;
  border-radius: 10px;
`

/* 필터 모달 */
export const FilterOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`

export const FilterModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 20px;
  padding: 20px;
  z-index: 1001;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  /* 스크롤바 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary}40;
    border-radius: 3px;
  }
`

export const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.glass};
`

export const FilterTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.glass};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`

export const FilterSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`

export const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const FilterChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  background: ${({ $active, $color, theme }) =>
    $active
      ? $color || theme.colors.primary
      : theme.colors.surface};

  color: ${({ $active, theme }) =>
    $active ? '#fff' : theme.colors.text};

  border: 2px solid ${({ $active, $color, theme }) =>
    $active
      ? $color || theme.colors.primary
      : 'transparent'};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ $color, theme }) => ($color || theme.colors.primary)}30;
  }
`

export const ChipEmoji = styled.span`
  font-size: 14px;
`

/* 로그인 버튼 */
export const LoginButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const GoogleIcon = styled.img`
  width: 18px;
  height: 18px;
`

export const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.primary};
`

export const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: 20px;
  background: ${({ theme }) => theme.glassmorphism.background};
  backdrop-filter: ${({ theme }) => theme.glassmorphism.backdropFilter};
  border: ${({ theme }) => theme.glassmorphism.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

export const UserName = styled.span`
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const UserMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 160px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 100;
`

export const UserMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: ${({ theme, $danger }) => $danger ? '#e74c3c' : theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`

export const UserMenuDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.glass};
  margin: 4px 0;
`
