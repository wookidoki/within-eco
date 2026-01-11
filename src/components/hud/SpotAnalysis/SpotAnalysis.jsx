import { useState, useEffect } from 'react'
import { FiX, FiActivity, FiMapPin } from 'react-icons/fi'
import { useGameStore } from '../../../stores'
import { CATEGORIES } from '../../../data/spots'
import {
  Container,
  Header,
  BackButton,
  SpotInfo,
  SpotEmoji,
  SpotDetails,
  SpotName,
  SpotAddress,
  CategoryBadge,
  Section,
  SectionTitle,
  ScoreRing,
  ScoreValue,
  ScoreLabel,
  AnalyzeButton,
  MetricsGrid,
  MetricCard,
  MetricIcon,
  MetricGauge,
  GaugeFill,
  MetricValue,
  MetricLabel,
  CountingNumber,
  ImpactMessage,
  MissionBox,
  MissionTitle,
  MissionDesc,
  MissionReward,
  StampButton,
} from './SpotAnalysis.styles'

// 카운팅 애니메이션 훅
const useCountUp = (target, duration = 1500, trigger) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) {
      setCount(0)
      return
    }

    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration, trigger])

  return count
}

// ecoStats에서 실제 값 추출 헬퍼
const parseEcoStats = (ecoStats, area) => {
  // 온도 저감 효과 (temperatureGap에서 추출 또는 면적 기반 추정)
  let tempReduction = 25 // 기본값 2.5도
  if (ecoStats.temperatureGap) {
    const match = ecoStats.temperatureGap.match(/-?([\d.]+)/)
    if (match) tempReduction = parseFloat(match[1]) * 10
  } else if (ecoStats.area || area) {
    // 면적 기반 추정: 10만㎡당 약 1도 저감
    const areaStr = ecoStats.area || ''
    if (areaStr.includes('km')) {
      tempReduction = parseFloat(areaStr) * 30 || 25
    } else if (areaStr.includes('ha')) {
      tempReduction = parseFloat(areaStr) * 3 || 25
    } else if (areaStr.includes('만')) {
      tempReduction = parseFloat(areaStr) * 2.5 || 25
    }
  }

  // 탄소 흡수량 (trees 또는 carbonOffset에서 추출)
  let carbonTrees = 350 // 기본값
  if (ecoStats.trees) {
    const match = ecoStats.trees.match(/([\d,]+)/)
    if (match) carbonTrees = parseInt(match[1].replace(',', '')) / 40
  } else if (ecoStats.carbonOffset) {
    const match = ecoStats.carbonOffset.match(/([\d,]+)/)
    if (match) carbonTrees = parseInt(match[1].replace(',', '')) / 10
  } else if (ecoStats.area) {
    // 면적 기반 추정
    const areaStr = ecoStats.area
    if (areaStr.includes('km')) {
      carbonTrees = parseFloat(areaStr) * 500 || 350
    } else if (areaStr.includes('만')) {
      carbonTrees = parseFloat(areaStr) * 50 || 350
    }
  }

  // 공기 정화 등급 (점수 기반)
  const airQuality = Math.min(95, Math.max(60, ecoStats.score || 75))

  // 경제적 가치 (면적 기반 추정: 1ha당 약 500만원/년)
  let economicValue = 0
  if (ecoStats.area) {
    const areaStr = ecoStats.area
    if (areaStr.includes('km')) {
      economicValue = parseFloat(areaStr) * 5000 || 0
    } else if (areaStr.includes('ha')) {
      economicValue = parseFloat(areaStr) * 500 || 0
    } else if (areaStr.includes('만')) {
      economicValue = parseFloat(areaStr) * 50 || 0
    }
  }

  return {
    tempReduction: Math.min(50, Math.max(10, tempReduction)),
    carbonTrees: Math.min(1000, Math.max(50, Math.round(carbonTrees))),
    airQuality,
    economicValue: Math.round(economicValue),
  }
}

const SpotAnalysis = ({ spot }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { closeSpotDetail, unlockSpot, isSpotUnlocked } = useGameStore()

  const category = CATEGORIES[spot.category]
  const isUnlocked = isSpotUnlocked(spot.id)
  const { ecoStats } = spot

  // 실제 데이터에서 값 추출
  const metrics = parseEcoStats(ecoStats, spot.area_sqm)

  // 카운팅 애니메이션
  const treeCount = useCountUp(metrics.carbonTrees, 2000, isAnalyzing)
  const tempValue = useCountUp(metrics.tempReduction, 1500, isAnalyzing)
  const scoreValue = useCountUp(ecoStats.score, 1500, isAnalyzing)
  const airValue = useCountUp(metrics.airQuality, 1500, isAnalyzing)
  const economicValue = useCountUp(metrics.economicValue, 2000, isAnalyzing)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
  }

  const handleStamp = () => {
    unlockSpot(spot.id)
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={closeSpotDetail}>
          <FiX size={20} />
        </BackButton>
        <CategoryBadge $color={category.color}>
          {category.emoji} {category.label}
        </CategoryBadge>
      </Header>

      <SpotInfo>
        <SpotEmoji>{spot.thumbnail}</SpotEmoji>
        <SpotDetails>
          <SpotName>{spot.name}</SpotName>
          <SpotAddress>
            <FiMapPin size={12} />
            {spot.address}
          </SpotAddress>
        </SpotDetails>
      </SpotInfo>

      <Section>
        <SectionTitle>💾 복원 점수</SectionTitle>
        <ScoreRing $score={isAnalyzing ? scoreValue : ecoStats.score}>
          <ScoreValue>{isAnalyzing ? scoreValue : ecoStats.score}</ScoreValue>
          <ScoreLabel>/ 100</ScoreLabel>
        </ScoreRing>
      </Section>

      {!isAnalyzing ? (
        <AnalyzeButton onClick={handleAnalyze}>
          <FiActivity size={18} />
          데이터 스캔 시작
        </AnalyzeButton>
      ) : (
        <MetricsGrid>
          <MetricCard>
            <MetricIcon>🌡️</MetricIcon>
            <MetricLabel>열섬 완화 효과</MetricLabel>
            <MetricGauge>
              <GaugeFill $progress={(tempValue / 50) * 100} $color="#00D4FF" />
            </MetricGauge>
            <MetricValue>
              주변보다 <CountingNumber>-{(tempValue / 10).toFixed(1)}°C</CountingNumber> 시원함
            </MetricValue>
          </MetricCard>

          <MetricCard>
            <MetricIcon>🌳</MetricIcon>
            <MetricLabel>탄소 흡수량</MetricLabel>
            <MetricGauge>
              <GaugeFill $progress={(treeCount / 1000) * 100} $color="#00FF94" />
            </MetricGauge>
            <MetricValue>
              소나무 <CountingNumber>{treeCount.toLocaleString()}그루</CountingNumber> 효과
            </MetricValue>
          </MetricCard>

          <MetricCard>
            <MetricIcon>💨</MetricIcon>
            <MetricLabel>공기 정화 등급</MetricLabel>
            <MetricGauge>
              <GaugeFill $progress={airValue} $color="#00D4FF" />
            </MetricGauge>
            <MetricValue>
              미세먼지 저감 <CountingNumber>{airValue >= 85 ? '탁월' : airValue >= 70 ? '우수' : '양호'}</CountingNumber>
            </MetricValue>
          </MetricCard>

          <MetricCard>
            <MetricIcon>💰</MetricIcon>
            <MetricLabel>생태계 서비스 가치</MetricLabel>
            <MetricGauge>
              <GaugeFill $progress={Math.min(100, (economicValue / 5000) * 100)} $color="#FFB800" />
            </MetricGauge>
            <MetricValue>
              연간 <CountingNumber>{economicValue > 0 ? `${economicValue.toLocaleString()}만원` : '측정중'}</CountingNumber>
            </MetricValue>
          </MetricCard>
        </MetricsGrid>
      )}

      {spot.impact && (
        <ImpactMessage>
          ⚠️ {spot.impact}
        </ImpactMessage>
      )}

      {spot.mission ? (
        <MissionBox>
          <MissionTitle>🎯 복원 미션</MissionTitle>
          <MissionDesc>{spot.mission.description}</MissionDesc>
          <MissionReward>💾 {spot.mission.reward} XP</MissionReward>
        </MissionBox>
      ) : (
        <MissionBox>
          <MissionTitle>🎯 탐험 미션</MissionTitle>
          <MissionDesc>이 장소를 방문하고 사진을 찍어보세요!</MissionDesc>
          <MissionReward>💾 30 XP</MissionReward>
        </MissionBox>
      )}

      <StampButton
        onClick={handleStamp}
        disabled={isUnlocked}
        $isUnlocked={isUnlocked}
      >
        {isUnlocked ? '✅ 데이터 복구 완료!' : '📡 이 지역 데이터 복구하기'}
      </StampButton>
    </Container>
  )
}

export default SpotAnalysis
