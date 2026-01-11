import { useState, useEffect } from 'react'
import { FiX, FiMapPin, FiNavigation, FiCamera, FiMessageCircle } from 'react-icons/fi'
import { useGameStore } from '../../../stores'
import { CATEGORIES } from '../../../data/spots'
import { getSpotStats } from '../../../api/spotApi'
import {
  PreviewContainer,
  PreviewHeader,
  CategoryBadge,
  CloseBtn,
  PreviewBody,
  SpotName,
  SpotType,
  SpotMeta,
  MetaTag,
  QuickStats,
  StatItem,
  StatValue,
  StatLabel,
  PreviewActions,
  ActionBtn,
} from './SpotPreview.styles'

const SpotPreview = () => {
  const { selectedSpot, clearSelectedSpot, openSpotDetail } = useGameStore()
  const [stats, setStats] = useState({ photos: 0, comments: 0, visits: 0 })
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // 스팟 통계 로드
  useEffect(() => {
    if (!selectedSpot?.id) return

    const fetchStats = async () => {
      setIsLoadingStats(true)
      try {
        const data = await getSpotStats(selectedSpot.id)
        setStats({
          photos: data.photos || 0,
          comments: data.comments || 0,
          visits: data.visits || 0,
        })
      } catch (err) {
        console.error('Failed to load spot stats:', err)
        // 에러 시 0으로 유지
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchStats()
  }, [selectedSpot?.id])

  if (!selectedSpot) return null

  const category = CATEGORIES[selectedSpot.category] || CATEGORIES.nature

  const handleViewDetail = () => {
    openSpotDetail(selectedSpot)
  }

  const formatArea = (sqm) => {
    if (!sqm) return null
    if (sqm >= 1000000) return `${(sqm / 1000000).toFixed(1)}km²`
    if (sqm >= 10000) return `${(sqm / 10000).toFixed(1)}ha`
    return `${Math.round(sqm)}m²`
  }

  return (
    <PreviewContainer>
      <PreviewHeader>
        <CategoryBadge $color={category.color}>
          {category.emoji} {category.label}
        </CategoryBadge>
        <CloseBtn onClick={clearSelectedSpot}>
          <FiX size={18} />
        </CloseBtn>
      </PreviewHeader>

      <PreviewBody>
        <SpotName>{selectedSpot.name}</SpotName>
        <SpotType>{selectedSpot.type}</SpotType>

        <SpotMeta>
          {selectedSpot.district && (
            <MetaTag>
              <FiMapPin size={12} />
              {selectedSpot.district}
            </MetaTag>
          )}
          {selectedSpot.area_sqm && (
            <MetaTag>
              {formatArea(selectedSpot.area_sqm)}
            </MetaTag>
          )}
          {selectedSpot.designated_year && (
            <MetaTag>
              {selectedSpot.designated_year}년 지정
            </MetaTag>
          )}
        </SpotMeta>

        <QuickStats>
          <StatItem>
            <StatValue>{isLoadingStats ? '-' : stats.photos}</StatValue>
            <StatLabel>사진</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{isLoadingStats ? '-' : stats.comments}</StatValue>
            <StatLabel>댓글</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{isLoadingStats ? '-' : stats.visits}</StatValue>
            <StatLabel>방문</StatLabel>
          </StatItem>
        </QuickStats>

        <PreviewActions>
          <ActionBtn onClick={clearSelectedSpot}>
            <FiNavigation size={16} />
            길찾기
          </ActionBtn>
          <ActionBtn $primary onClick={handleViewDetail}>
            <FiCamera size={16} />
            자세히 보기
          </ActionBtn>
        </PreviewActions>
      </PreviewBody>
    </PreviewContainer>
  )
}

export default SpotPreview
