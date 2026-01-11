import { useMemo } from 'react'
import { useGameStore } from '../../../stores'
import { ecoSpots } from '../../../data/spots'
import { BADGES, getCurrentTitle, getUnlockedBadges } from '../../../data/badges'
import {
  Container,
  WelcomeSection,
  WelcomeEmoji,
  WelcomeText,
  WelcomeSubtext,
  StatsGrid,
  StatCard,
  StatIcon,
  StatValue,
  StatLabel,
  ProgressSection,
  ProgressTitle,
  LevelBar,
  LevelProgress,
  LevelInfo,
  AchievementSection,
  AchievementTitle,
  AchievementList,
  AchievementItem,
  AchievementEmoji,
  AchievementText,
  TipBox,
  TipEmoji,
  TipText,
} from './UserStats.styles'

const UserStats = () => {
  const { user, unlockedSpots, setActivePanel } = useGameStore()

  // 통계 계산
  const totalDistance = unlockedSpots.length * 2.5 // 임시: 스팟당 2.5km
  const restoredData = unlockedSpots.length * 3 // 복구된 데이터
  const ranking = Math.max(1, 100 - user.level * 8) // 임시 랭킹

  // 해금된 뱃지 계산
  const gameState = useMemo(() => ({
    user,
    unlockedSpots,
    hasCompletedOnboarding: true,
  }), [user, unlockedSpots])

  const unlockedBadges = useMemo(
    () => getUnlockedBadges(gameState, ecoSpots),
    [gameState]
  )

  const currentTitle = useMemo(
    () => getCurrentTitle(unlockedBadges.length),
    [unlockedBadges.length]
  )

  // 표시할 뱃지 (해금된 것 먼저, 최대 6개)
  const displayBadges = useMemo(() => {
    const locked = BADGES.filter(b => !unlockedBadges.find(u => u.id === b.id))
    const sorted = [...unlockedBadges, ...locked.slice(0, 6 - unlockedBadges.length)]
    return sorted.slice(0, 6).map(badge => ({
      ...badge,
      unlocked: unlockedBadges.some(u => u.id === badge.id),
    }))
  }, [unlockedBadges])

  return (
    <Container>
      <WelcomeSection>
        <WelcomeEmoji>{currentTitle.emoji}</WelcomeEmoji>
        <div>
          <WelcomeText>{currentTitle.name}</WelcomeText>
          <WelcomeSubtext>🏅 뱃지 {unlockedBadges.length}개 획득</WelcomeSubtext>
        </div>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatIcon>🚶</StatIcon>
          <StatValue>{totalDistance.toFixed(1)}km</StatValue>
          <StatLabel>탐사 거리</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>💾</StatIcon>
          <StatValue>{restoredData}개</StatValue>
          <StatLabel>복구된 데이터</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>🏆</StatIcon>
          <StatValue>#{ranking}</StatValue>
          <StatLabel>복원사 랭킹</StatLabel>
        </StatCard>
        <StatCard onClick={() => setActivePanel('regions')} style={{ cursor: 'pointer' }}>
          <StatIcon>📍</StatIcon>
          <StatValue>{unlockedSpots.length}/{ecoSpots.length}</StatValue>
          <StatLabel>스캔된 지역</StatLabel>
        </StatCard>
      </StatsGrid>

      <ProgressSection>
        <ProgressTitle>
          🌱 Lv.{user.level} 복원 레벨
        </ProgressTitle>
        <LevelBar>
          <LevelProgress $progress={(user.xp / user.xpToNextLevel) * 100} />
        </LevelBar>
        <LevelInfo>
          다음 레벨까지 {user.xpToNextLevel - user.xp} XP
        </LevelInfo>
      </ProgressSection>

      <AchievementSection>
        <AchievementTitle>🎖️ 뱃지 ({unlockedBadges.length}/{BADGES.length})</AchievementTitle>
        <AchievementList>
          {displayBadges.map((badge) => (
            <AchievementItem key={badge.id} $unlocked={badge.unlocked} title={badge.description}>
              <AchievementEmoji>{badge.emoji}</AchievementEmoji>
              <AchievementText>{badge.name}</AchievementText>
            </AchievementItem>
          ))}
        </AchievementList>
      </AchievementSection>

      <TipBox onClick={() => setActivePanel('log')} style={{ cursor: 'pointer' }}>
        <TipEmoji>📖</TipEmoji>
        <TipText>
          <strong>탐험 일지</strong>를 클릭하여 방문 기록을 확인하세요!
        </TipText>
      </TipBox>
    </Container>
  )
}

export default UserStats
