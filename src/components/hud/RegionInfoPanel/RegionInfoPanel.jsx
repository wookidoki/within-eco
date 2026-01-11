import { useState, useEffect } from 'react'
import { FiX, FiMapPin, FiWind, FiDroplet, FiSun } from 'react-icons/fi'
import { useMapStore, useGameStore } from '../../../stores'
import { getEcosystemScoreByRegion, getScoreLevel, SCORE_DESCRIPTIONS } from '../../../api/climateApi'
import { getAirQuality, getAirQualityGrade, getTimeBasedRecommendation } from '../../../api/airQualityApi'
import { ecoSpots } from '../../../data/spots'
import {
  PanelContainer,
  PanelHeader,
  RegionName,
  CloseButton,
  PanelContent,
  StatItem,
  StatIcon,
  StatInfo,
  StatLabel,
  StatValue,
  ActionButton,
} from './RegionInfoPanel.styles'
import styled from 'styled-components'

// 추가 스타일 컴포넌트
const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 16px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
`

const ScoreItem = styled.div`
  background: ${({ theme }) => theme.glassmorphism.background};
  border-radius: 12px;
  padding: 14px 10px;
  text-align: center;
  /* 깜빡임 방지 */
  will-change: auto;
  transform: translateZ(0);
`

const ScoreEmoji = styled.div`
  font-size: 20px;
  margin-bottom: 6px;
`

const ScoreValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${({ $color, theme }) => $color || theme.colors.primary};
`

const ScoreLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`

const AirQualityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ $color }) => $color}22;
  border: 1px solid ${({ $color }) => $color};
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
`

const AirQualityInfo = styled.div`
  flex: 1;
`

const AirQualityLevel = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${({ $color }) => $color};
`

const AirQualityMessage = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`

const TimeRecommendation = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 14px;
  padding: 12px 14px;
  background: ${({ theme }) => theme.glassmorphism.background};
  border-radius: 12px;
`

const LoadingText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 24px;
`

const ErrorText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.danger || '#FF6B6B'};
  text-align: center;
  padding: 14px;
  background: ${({ theme }) => theme.colors.danger || '#FF6B6B'}15;
  border-radius: 12px;
  margin-bottom: 14px;
`

const RegionInfoPanel = () => {
  const { selectedRegion, clearSelectedRegion } = useMapStore()
  const { unlockedSpots, setActiveRegion } = useGameStore()
  const [ecoScores, setEcoScores] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({ eco: false, air: false })

  useEffect(() => {
    if (!selectedRegion?.name) return

    const fetchData = async () => {
      setLoading(true)
      setErrors({ eco: false, air: false })

      try {
        const results = await Promise.allSettled([
          getEcosystemScoreByRegion(selectedRegion.name),
          getAirQuality(selectedRegion.name),
        ])

        // 각 결과를 개별 처리 (하나 실패해도 다른 것은 표시)
        const [ecoResult, airResult] = results
        const newErrors = { eco: false, air: false }

        if (ecoResult.status === 'fulfilled') {
          setEcoScores(ecoResult.value)
        } else {
          console.error('Failed to fetch eco data:', ecoResult.reason)
          setEcoScores(null)
          newErrors.eco = true
        }

        if (airResult.status === 'fulfilled') {
          setAirQuality(airResult.value)
        } else {
          console.error('Failed to fetch air data:', airResult.reason)
          setAirQuality(null)
          newErrors.air = true
        }

        setErrors(newErrors)
      } catch (error) {
        console.error('Failed to fetch region data:', error)
        setErrors({ eco: true, air: true })
      }
      setLoading(false)
    }

    fetchData()
  }, [selectedRegion?.name])

  if (!selectedRegion) return null

  // 지역 스팟 통계
  const regionSpots = ecoSpots.filter(s => s.region === selectedRegion.name || s.region === selectedRegion.id)
  const unlockedCount = regionSpots.filter(s => unlockedSpots.includes(s.id)).length
  const totalCount = regionSpots.length

  // 시간 추천
  const timeRec = getTimeBasedRecommendation()

  // 대기질 정보
  const airGrade = airQuality ? getAirQualityGrade(airQuality.pm25?.grade) : null

  // 탐험하기 버튼
  const handleExplore = () => {
    setActiveRegion(selectedRegion.id || selectedRegion.name)
    clearSelectedRegion()
  }

  return (
    <PanelContainer>
      <PanelHeader>
        <RegionName>{selectedRegion.emoji} {selectedRegion.name}</RegionName>
        <CloseButton onClick={clearSelectedRegion} aria-label="닫기">
          <FiX size={20} />
        </CloseButton>
      </PanelHeader>

      <PanelContent>
        {/* 에러 표시 */}
        {(errors.eco || errors.air) && (
          <ErrorText>
            ⚠️ {errors.eco && errors.air
              ? '환경 데이터를 불러올 수 없습니다'
              : errors.eco
                ? '생태계 데이터를 불러올 수 없습니다'
                : '대기질 데이터를 불러올 수 없습니다'}
          </ErrorText>
        )}

        {/* 실시간 대기질 */}
        {airGrade && (
          <AirQualityBadge $color={airGrade.color}>
            <div style={{ fontSize: '24px' }}>{airGrade.emoji}</div>
            <AirQualityInfo>
              <AirQualityLevel $color={airGrade.color}>
                공기질 {airGrade.level}
              </AirQualityLevel>
              <AirQualityMessage>
                PM2.5: {airQuality.pm25?.value}μg/m³ · {airGrade.message}
              </AirQualityMessage>
            </AirQualityInfo>
          </AirQualityBadge>
        )}

        {/* 시간대 추천 */}
        <TimeRecommendation>
          <span style={{ fontSize: '18px' }}>{timeRec.emoji}</span>
          <span>{timeRec.message}</span>
        </TimeRecommendation>

        {/* 생태계서비스 점수 */}
        <SectionTitle>📊 생태계서비스 점수</SectionTitle>
        {loading ? (
          <LoadingText>데이터 로딩 중...</LoadingText>
        ) : ecoScores ? (
          <ScoreGrid>
            <ScoreItem>
              <ScoreEmoji>🌳</ScoreEmoji>
              <ScoreValue $color={getScoreLevel(ecoScores.scores.carbon).color}>
                {ecoScores.scores.carbon}
              </ScoreValue>
              <ScoreLabel>탄소저장</ScoreLabel>
            </ScoreItem>
            <ScoreItem>
              <ScoreEmoji>💧</ScoreEmoji>
              <ScoreValue $color={getScoreLevel(ecoScores.scores.water).color}>
                {ecoScores.scores.water}
              </ScoreValue>
              <ScoreLabel>수질정화</ScoreLabel>
            </ScoreItem>
            <ScoreItem>
              <ScoreEmoji>💨</ScoreEmoji>
              <ScoreValue $color={getScoreLevel(ecoScores.scores.air).color}>
                {ecoScores.scores.air}
              </ScoreValue>
              <ScoreLabel>대기조절</ScoreLabel>
            </ScoreItem>
            <ScoreItem>
              <ScoreEmoji>🦋</ScoreEmoji>
              <ScoreValue $color={getScoreLevel(ecoScores.scores.biodiversity).color}>
                {ecoScores.scores.biodiversity}
              </ScoreValue>
              <ScoreLabel>생물다양성</ScoreLabel>
            </ScoreItem>
            <ScoreItem>
              <ScoreEmoji>🏞️</ScoreEmoji>
              <ScoreValue $color={getScoreLevel(ecoScores.scores.landscape).color}>
                {ecoScores.scores.landscape}
              </ScoreValue>
              <ScoreLabel>경관</ScoreLabel>
            </ScoreItem>
            <ScoreItem>
              <ScoreEmoji>📊</ScoreEmoji>
              <ScoreValue $color={getScoreLevel(ecoScores.scores.total).color}>
                {ecoScores.scores.total}
              </ScoreValue>
              <ScoreLabel>종합</ScoreLabel>
            </ScoreItem>
          </ScoreGrid>
        ) : (
          <LoadingText>데이터 없음</LoadingText>
        )}

        {/* 탐험 현황 */}
        <SectionTitle>🗺️ 탐험 현황</SectionTitle>
        <StatItem>
          <StatIcon>
            <FiMapPin size={18} />
          </StatIcon>
          <StatInfo>
            <StatLabel>발견한 스팟</StatLabel>
            <StatValue>{unlockedCount} / {totalCount}개</StatValue>
          </StatInfo>
        </StatItem>
      </PanelContent>

      <ActionButton onClick={handleExplore}>
        🚀 이 지역 탐험하기
      </ActionButton>
    </PanelContainer>
  )
}

export default RegionInfoPanel
