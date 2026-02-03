import { useGameStore } from '../../../stores'
import { ecoSpots, CATEGORIES, REGIONS } from '../../../data/spots'
import {
  Container,
  Header,
  Title,
  TotalCount,
  Timeline,
  LogEntry,
  EntryHeader,
  EntryEmoji,
  EntryInfo,
  EntryName,
  EntryDate,
  EntryMeta,
  MetaTag,
  EmptyState,
  EmptyIcon,
  EmptyText,
  StartButton,
} from './ExplorationLog.styles'

const ExplorationLog = ({ onStartExploring }) => {
  const { unlockedSpots } = useGameStore()

  // 해금된 스팟들의 상세 정보 가져오기
  const exploredSpots = unlockedSpots
    .map(spotId => ecoSpots.find(s => s.id === spotId))
    .filter(Boolean)
    .reverse() // 최근 것부터 표시

  if (exploredSpots.length === 0) {
    return (
      <Container>
        <Header>
          <Title>📔 탐험 일지</Title>
        </Header>
        <EmptyState>
          <EmptyIcon>🧭</EmptyIcon>
          <EmptyText>
            아직 탐험 기록이 없어요.<br />
            첫 번째 에코 스팟을 방문해보세요!
          </EmptyText>
          <StartButton onClick={onStartExploring}>
            탐험 시작하기
          </StartButton>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>
          📔 탐험 일지
          <TotalCount>({exploredSpots.length}곳 방문)</TotalCount>
        </Title>
      </Header>

      <Timeline>
        {exploredSpots.map((spot, index) => {
          const category = CATEGORIES[spot.category]
          const region = REGIONS[spot.region]

          // 가상의 방문 날짜 생성 (실제로는 저장된 날짜 사용)
          const visitDate = new Date()
          visitDate.setDate(visitDate.getDate() - index)
          const dateStr = visitDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          return (
            <LogEntry key={spot.id} $color={category.color}>
              <EntryHeader>
                <EntryEmoji>{spot.thumbnail}</EntryEmoji>
                <EntryInfo>
                  <EntryName>{spot.displayName || spot.name}</EntryName>
                  <EntryDate>{dateStr} 방문</EntryDate>
                </EntryInfo>
              </EntryHeader>
              <EntryMeta>
                <MetaTag $color={category.color}>
                  {category.emoji} {category.label}
                </MetaTag>
                <MetaTag $color="#00D4FF">
                  {region?.emoji} {region?.name}
                </MetaTag>
                <MetaTag $color="#00FF94">
                  +{spot.mission?.reward || 0} XP
                </MetaTag>
              </EntryMeta>
            </LogEntry>
          )
        })}
      </Timeline>
    </Container>
  )
}

export default ExplorationLog
