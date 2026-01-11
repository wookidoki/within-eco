import styled, { keyframes } from 'styled-components'

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: 20px;
`

export const ModalContainer = styled.div`
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;

  padding: 28px;
  border-radius: 24px 24px 0 0;

  background: ${({ theme }) => theme.colors.surface || theme.colors.background};
  border: ${({ theme }) => theme.glassmorphism.border};
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);

  animation: ${slideUp} 0.3s ease-out forwards;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.glass};
    border-radius: 3px;
  }
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.glass};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border: none;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: white;
  }
`

export const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  background: ${({ $color }) => $color}22;
  color: ${({ $color }) => $color};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
`

export const SpotEmoji = styled.div`
  font-size: 64px;
  text-align: center;
  margin: 8px 0;
`

export const SpotName = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`

export const SpotAddress = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 20px;
`

/* 탭 네비게이션 */
export const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  padding: 4px;
  background: ${({ theme }) => theme.colors.glass};
  border-radius: 12px;
`

export const Tab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border: none;

  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.background : theme.colors.text};

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.glass};
  }
`

export const TabContent = styled.div`
  min-height: 200px;
`

export const ScoreSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`

export const ScoreCircle = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: conic-gradient(
    ${({ theme }) => theme.colors.primary} ${({ $score }) => ($score || 0) * 3.6}deg,
    ${({ theme }) => theme.colors.glass} 0deg
  );

  &::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.surface || theme.colors.background};
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
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
`

export const StatCard = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.glass};
  text-align: center;
`

export const StatEmoji = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`

export const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`

export const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const DescriptionBox = styled.p`
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.glass};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  margin: 12px 0;
`

export const MissionSection = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary}15,
    ${({ theme }) => theme.colors.secondary}15
  );
  border: 1px solid ${({ theme }) => theme.colors.primary}40;
  margin: 16px 0;
`

export const MissionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`

export const MissionDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`

export const MissionReward = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.warning};
  font-weight: 600;
`

export const ActionButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  margin-top: 16px;
  border: none;

  background: ${({ $isUnlocked, theme }) =>
    $isUnlocked
      ? theme.colors.glass
      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
  color: ${({ $isUnlocked, theme }) =>
    $isUnlocked ? theme.colors.textSecondary : theme.colors.background};

  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  cursor: ${({ $isUnlocked, disabled }) => ($isUnlocked || disabled) ? 'default' : 'pointer'};
  transition: opacity 0.2s, transform 0.2s;

  &:not(:disabled):hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

/* API 점수 그리드 */
export const ApiScoreGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.glass};
`

export const ApiScoreItem = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`

export const ApiScoreBar = styled.div`
  height: 6px;
  background: ${({ theme }) => theme.colors.glass};
  border-radius: 3px;
  margin-top: 6px;
  overflow: hidden;
`

export const ApiScoreBarFill = styled.div`
  height: 100%;
  width: ${({ $value }) => Math.min(100, ($value || 0) * 1.5)}%;
  background: ${({ $color }) => $color || '#00FF94'};
  border-radius: 3px;
  transition: width 0.5s ease;
`

/* 댓글 섹션 */
export const CommentForm = styled.form`
  margin-bottom: 16px;
`

export const CommentInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.glass};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`

export const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`

export const CommentItem = styled.div`
  padding: 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.glass};
`

export const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

export const CommentAuthor = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const CommentDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const CommentText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
  white-space: pre-wrap;
`

/* 사진 섹션 */
export const PhotoUploadButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  border: 2px dashed ${({ theme }) => theme.colors.glass};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  margin-bottom: 16px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`

export const PhotoItem = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.glass};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white;
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`

/* 빈 상태 & 로딩 */
export const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

export const LoadingSpinner = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

/* Legacy styles (kept for backwards compatibility) */
export const ImpactWarning = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.danger}15;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
  margin: 12px 0;
`

export const WarningIcon = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  flex-shrink: 0;
  margin-top: 2px;
`

export const WarningText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.danger};
  line-height: 1.5;
`

export const FunFactBox = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.secondary}15;
  border: 1px solid ${({ theme }) => theme.colors.secondary}40;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  margin: 12px 0;
`
