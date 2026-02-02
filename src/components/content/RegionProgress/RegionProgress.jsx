import { useMemo } from 'react'
import { useGameStore } from '../../../stores'
import { ecoSpots, REGIONS } from '../../../data/spots'
import {
  Container,
  Header,
  Title,
  Subtitle,
  OverallProgress,
  ProgressLabel,
  ProgressText,
  ProgressPercent,
  ProgressBar,
  ProgressFill,
  RegionGrid,
  RegionCard,
  RegionHeader,
  RegionEmoji,
  RegionName,
  RegionStats,
  RegionCount,
  RegionProgressBar,
  RegionProgressFill,
} from './RegionProgress.styles'

const RegionProgress = ({ onSelectRegion }) => {
  const { unlockedSpots } = useGameStore()

  // 전체 진행률 계산 (memoized)
  const totalSpots = ecoSpots.length
  const unlockedCount = unlockedSpots.length
  const overallProgress = useMemo(
    () => Math.round((unlockedCount / totalSpots) * 100),
    [unlockedCount, totalSpots]
  )

  // 지역별 통계 계산 (memoized)
  const regionStats = useMemo(() => {
    return Object.entries(REGIONS).map(([regionId, region]) => {
      const spotsInRegion = ecoSpots.filter(s => s.region === regionId)
      const unlockedInRegion = spotsInRegion.filter(s =>
        unlockedSpots.includes(s.id)
      )

      return {
        ...region,
        regionId,
        total: spotsInRegion.length,
        unlocked: unlockedInRegion.length,
        progress: spotsInRegion.length > 0
          ? Math.round((unlockedInRegion.length / spotsInRegion.length) * 100)
          : 0,
        isComplete: unlockedInRegion.length === spotsInRegion.length && spotsInRegion.length > 0,
      }
    }).filter(r => r.total > 0) // 스팟이 있는 지역만 표시
  }, [unlockedSpots])

  return (
    <Container>
      <Header>
        <Title>🗺️ 경기도 탐험 현황</Title>
        <Subtitle>지역별 에코 스팟 복구 진행률</Subtitle>
      </Header>

      <OverallProgress>
        <ProgressLabel>
          <ProgressText>전체 복구율</ProgressText>
          <ProgressPercent>{overallProgress}%</ProgressPercent>
        </ProgressLabel>
        <ProgressBar>
          <ProgressFill $progress={overallProgress} />
        </ProgressBar>
        <ProgressText style={{ marginTop: 8, fontSize: 13 }}>
          {unlockedCount} / {totalSpots} 지역 복구 완료
        </ProgressText>
      </OverallProgress>

      <RegionGrid>
        {regionStats.map((region) => (
          <RegionCard
            key={region.regionId}
            $hasProgress={region.unlocked > 0}
            onClick={() => onSelectRegion?.(region.regionId)}
          >
            <RegionHeader>
              <RegionEmoji>
                {region.isComplete ? '✅' : region.emoji}
              </RegionEmoji>
              <RegionName>{region.name}</RegionName>
            </RegionHeader>
            <RegionStats>
              <RegionCount>
                {region.unlocked} / {region.total}
              </RegionCount>
              <RegionProgressBar>
                <RegionProgressFill $progress={region.progress} />
              </RegionProgressBar>
            </RegionStats>
          </RegionCard>
        ))}
      </RegionGrid>
    </Container>
  )
}

export default RegionProgress
