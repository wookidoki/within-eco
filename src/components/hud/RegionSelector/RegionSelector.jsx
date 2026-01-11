import { useMemo } from 'react'
import { useGameStore, GYEONGGI_REGIONS } from '../../../stores'
import {
  SelectorWrapper,
  AllRegionButton,
  AllRegionLeft,
  AllRegionEmoji,
  AllRegionText,
  AllRegionName,
  AllRegionDesc,
  AllRegionCount,
  SectionTitle,
  RegionGrid,
  RegionButton,
  RegionEmoji,
  RegionName,
  SpotCount,
} from './RegionSelector.styles'
import { ecoSpots, getPrioritySpots } from '../../../data/spots'

const RegionSelector = ({ onSelect }) => {
  const { activeRegion, setActiveRegion } = useGameStore()

  // 전체 스팟 개수 (memoized)
  const totalSpots = useMemo(() => ecoSpots.length, [])
  const prioritySpots = useMemo(() => getPrioritySpots().length, [])

  // ALL을 제외한 지역 목록 (스팟이 있는 지역만) - memoized
  const regionsWithSpots = useMemo(() => {
    const getSpotCount = (regionId) => {
      if (regionId === 'ALL') {
        return getPrioritySpots().length
      }
      return ecoSpots.filter(s => s.region === regionId).length
    }

    return [...GYEONGGI_REGIONS]
      .filter(r => r.id !== 'ALL')
      .map(r => ({ ...r, count: getSpotCount(r.id) }))
      .sort((a, b) => b.count - a.count) // 스팟 많은 순
  }, [])

  // 지역 선택 핸들러
  const handleSelect = (regionId) => {
    setActiveRegion(regionId)
    onSelect?.()
  }

  return (
    <SelectorWrapper>
      {/* 전체 보기 버튼 */}
      <AllRegionButton
        $isActive={activeRegion === 'ALL'}
        onClick={() => handleSelect('ALL')}
      >
        <AllRegionLeft>
          <AllRegionEmoji>🗺️</AllRegionEmoji>
          <AllRegionText>
            <AllRegionName>경기도 전체</AllRegionName>
            <AllRegionDesc>주요 스팟 {prioritySpots}개 표시</AllRegionDesc>
          </AllRegionText>
        </AllRegionLeft>
        <AllRegionCount>{totalSpots}개</AllRegionCount>
      </AllRegionButton>

      {/* 지역 선택 그리드 */}
      <SectionTitle>시/군 선택</SectionTitle>
      <RegionGrid>
        {regionsWithSpots.map((region) => (
          <RegionButton
            key={region.id}
            $isActive={activeRegion === region.id}
            onClick={() => handleSelect(region.id)}
            disabled={region.count === 0}
          >
            <RegionEmoji>{region.emoji}</RegionEmoji>
            <RegionName>{region.name}</RegionName>
            <SpotCount $hasSpots={region.count > 0}>
              {region.count > 0 ? `${region.count}개` : '없음'}
            </SpotCount>
          </RegionButton>
        ))}
      </RegionGrid>
    </SelectorWrapper>
  )
}

export default RegionSelector
