import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100;
  overflow-y: auto;
  animation: ${fadeIn} 0.2s ease;
`

export const Container = styled.div`
  min-height: 100vh;
  padding-bottom: 100px;
  animation: ${slideUp} 0.3s ease;
`

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(rgba(0,0,0,0.8), transparent);
`

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`

export const ShareButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`

export const Content = styled.main`
  padding: 0 20px;
  max-width: 600px;
  margin: 0 auto;
`

export const TitleSection = styled.section`
  margin-bottom: 24px;
`

export const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: ${({ $color }) => $color}25;
  color: ${({ $color }) => $color};
  margin-bottom: 12px;
`

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin-bottom: 8px;
  line-height: 1.3;
`

export const Address = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`

export const MetaTag = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
`

export const Section = styled.section`
  margin-bottom: 28px;
`

export const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin-bottom: 14px;
`

export const Description = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
`

export const FunFactBox = styled.div`
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary}15,
    ${({ theme }) => theme.colors.secondary}15
  );
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
`

export const FunFactText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
`

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`

export const StatCard = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
`

export const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 4px;
`

export const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`

export const TipsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

export const TipItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &:last-child {
    border-bottom: none;
  }
`

export const TipIcon = styled.span`
  font-size: 16px;
`

export const TipText = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
`

export const ImpactBox = styled.div`
  padding: 18px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.danger}15;
  border: 1px solid ${({ theme }) => theme.colors.danger}30;
`

export const ImpactText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.danger};
`

export const ActionButton = styled.button`
  position: fixed;
  bottom: 24px;
  left: 20px;
  right: 20px;
  max-width: 560px;
  margin: 0 auto;
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  color: ${({ theme }) => theme.colors.background};
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  box-shadow: 0 4px 20px ${({ theme }) => theme.colors.primary}40;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px ${({ theme }) => theme.colors.primary}50;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.5);
    box-shadow: none;
    cursor: not-allowed;
  }
`

/* ==================== 피드 섹션 ==================== */

export const FeedTabs = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
`

export const FeedTab = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active }) =>
    $active ? '#0B101A' : 'rgba(255, 255, 255, 0.7)'};

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  }
`

export const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  border-radius: 12px;
  overflow: hidden;
`

export const PhotoItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`

export const PhotoOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.2s;

  ${PhotoItem}:hover & {
    opacity: 1;
  }
`

export const PhotoStat = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 14px;
  font-weight: 600;
`

export const UploadButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}10;
  }
`

/* ==================== 댓글 섹션 ==================== */

export const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const CommentItem = styled.div`
  display: flex;
  gap: 12px;
`

export const CommentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`

export const CommentContent = styled.div`
  flex: 1;
`

export const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`

export const CommentAuthor = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: white;
`

export const CommentTime = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`

export const CommentText = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin: 0;
`

export const CommentActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`

export const CommentAction = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

export const CommentInput = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-top: 16px;
`

export const CommentTextarea = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 14px;
  resize: none;
  min-height: 40px;
  font-family: inherit;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
  }
`

export const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: #0B101A;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
`

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`

export const EmptyText = styled.p`
  font-size: 14px;
`
