import { useState, useRef, useEffect } from 'react'
import { FiArrowLeft, FiShare2, FiMapPin, FiCamera, FiMessageCircle, FiHeart, FiSend, FiUpload } from 'react-icons/fi'
import { useGameStore, useAuthStore } from '../../../stores'
import { CATEGORIES, REGIONS } from '../../../data/spots'
import { getEcosystemScoreByRegion, getScoreLevel } from '../../../api/climateApi'
import { getAirQuality, getAirQualityGrade, getTimeBasedRecommendation } from '../../../api/airQualityApi'
import { getSpotPhotos, getSpotComments, addSpotComment, uploadSpotPhoto, getSpotStats } from '../../../api/spotApi'
import PhotoGallery from '../PhotoGallery'
import styled from 'styled-components'
import {
  Overlay,
  Container,
  Header,
  BackButton,
  ShareButton,
  Content,
  TitleSection,
  CategoryBadge,
  Title,
  Address,
  MetaRow,
  MetaTag,
  Section,
  SectionTitle,
  Description,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  ActionButton,
  FeedTabs,
  FeedTab,
  PhotoGrid,
  PhotoItem,
  PhotoOverlay,
  PhotoStat,
  UploadButton,
  CommentList,
  CommentItem,
  CommentAvatar,
  CommentContent,
  CommentHeader,
  CommentAuthor,
  CommentTime,
  CommentText,
  CommentActions,
  CommentAction,
  CommentInput,
  CommentTextarea,
  SendButton,
  EmptyState,
  EmptyIcon,
  EmptyText,
} from './SpotDetailPage.styles'

// 기본 사진 (데이터가 없을 때 표시)
const DEFAULT_PHOTOS = [
  { id: 'default-1', url: 'https://picsum.photos/400/400?random=1', likes: 0, comments: 0, author: '아직 사진이 없어요' },
]

// 기본 댓글 안내
const EMPTY_COMMENTS_MESSAGE = '아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요!'

// 추가 스타일 컴포넌트
const AirQualityBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ $color }) => `${$color}22`};
  border: 1px solid ${({ $color }) => $color};
  border-radius: 12px;
  margin-bottom: 16px;
`

const AirQualityEmoji = styled.div`
  font-size: 28px;
`

const AirQualityContent = styled.div`
  flex: 1;
`

const AirQualityLevel = styled.div`
  font-weight: bold;
  color: ${({ $color }) => $color};
`

const AirQualityDesc = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const TimeRecBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.glassmorphism?.background || 'rgba(255,255,255,0.1)'};
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const EcoScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
`

const EcoScoreItem = styled.div`
  text-align: center;
  padding: 10px 6px;
  background: ${({ theme }) => theme.glassmorphism?.background || 'rgba(255,255,255,0.1)'};
  border-radius: 10px;
`

const EcoScoreValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${({ $color }) => $color};
`

const EcoScoreLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`

const SpotDetailPage = ({ spot, onClose }) => {
  const { unlockSpot, isSpotUnlocked } = useGameStore()
  const { isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState('photos')
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [photos, setPhotos] = useState([])
  const [spotStats, setSpotStats] = useState({ photos: 0, comments: 0, visits: 0 })
  const [regionEcoData, setRegionEcoData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  // 환경 데이터 로드
  useEffect(() => {
    if (!spot?.region) return

    const fetchEnvData = async () => {
      try {
        const [eco, air] = await Promise.all([
          getEcosystemScoreByRegion(spot.region),
          getAirQuality(spot.region),
        ])
        setRegionEcoData(eco)
        setAirQualityData(air)
      } catch (err) {
        console.error('Failed to fetch env data:', err)
      }
    }
    fetchEnvData()
  }, [spot?.region])

  // 사진, 댓글, 통계 로드
  useEffect(() => {
    if (!spot?.id) return

    const fetchSpotData = async () => {
      setIsLoading(true)
      try {
        const [photosData, commentsData, statsData] = await Promise.all([
          getSpotPhotos(spot.id),
          getSpotComments(spot.id),
          getSpotStats(spot.id),
        ])
        setPhotos(photosData.length > 0 ? photosData : DEFAULT_PHOTOS)
        setComments(commentsData)
        setSpotStats(statsData)
      } catch (err) {
        console.error('Failed to fetch spot data:', err)
        setPhotos(DEFAULT_PHOTOS)
        setComments([])
      }
      setIsLoading(false)
    }
    fetchSpotData()
  }, [spot?.id])

  if (!spot) return null

  const category = CATEGORIES[spot.category]
  const region = REGIONS[spot.region]
  const isUnlocked = isSpotUnlocked(spot.id)
  const airGrade = airQualityData ? getAirQualityGrade(airQualityData.pm25?.grade) : null
  const timeRec = getTimeBasedRecommendation()

  const handleUnlock = () => {
    unlockSpot(spot.id)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: spot.name,
          text: spot.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  const handleSendComment = async () => {
    if (!commentText.trim()) return

    if (!isAuthenticated) {
      alert('댓글을 작성하려면 로그인이 필요합니다.')
      return
    }

    setIsSubmitting(true)
    try {
      const newComment = await addSpotComment(spot.id, commentText)
      setComments([newComment, ...comments])
      setCommentText('')
    } catch (err) {
      console.error('Failed to add comment:', err)
      alert('댓글 작성에 실패했습니다.')
    }
    setIsSubmitting(false)
  }

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      alert('사진을 업로드하려면 로그인이 필요합니다.')
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isAuthenticated) {
      alert('사진을 업로드하려면 로그인이 필요합니다.')
      return
    }

    setIsSubmitting(true)
    try {
      const newPhoto = await uploadSpotPhoto(spot.id, file)
      setPhotos([{ ...newPhoto, likes: 0, comments: 0, author: '나' }, ...photos])
      alert('사진이 업로드되었습니다!')
    } catch (err) {
      console.error('Failed to upload photo:', err)
      alert('사진 업로드에 실패했습니다.')
    }
    setIsSubmitting(false)
  }

  // ecoStats 처리
  const ecoStats = spot.ecoStats || { score: 0 }

  return (
    <Overlay>
      <Container>
        <Header>
          <BackButton onClick={onClose}>
            <FiArrowLeft size={18} />
            돌아가기
          </BackButton>
          <ShareButton onClick={handleShare}>
            <FiShare2 size={20} />
          </ShareButton>
        </Header>

        <PhotoGallery
          photos={spot.photos}
          thumbnail={spot.thumbnail}
          alt={spot.name}
        />

        <Content>
          <TitleSection>
            <CategoryBadge $color={category.color}>
              {category.emoji} {category.label}
            </CategoryBadge>
            <Title>{spot.name}</Title>
            <Address>
              <FiMapPin size={14} />
              {spot.address || `${spot.district || ''} ${spot.type || ''}`}
            </Address>

            <MetaRow>
              {spot.district && (
                <MetaTag>
                  📍 {spot.district}
                </MetaTag>
              )}
              {spot.area_sqm && (
                <MetaTag>
                  📐 {spot.area_sqm >= 1000000
                    ? `${(spot.area_sqm / 1000000).toFixed(1)}km²`
                    : spot.area_sqm >= 10000
                      ? `${(spot.area_sqm / 10000).toFixed(1)}ha`
                      : `${Math.round(spot.area_sqm)}m²`}
                </MetaTag>
              )}
              {spot.designated_year && (
                <MetaTag>
                  📅 {spot.designated_year}년 지정
                </MetaTag>
              )}
            </MetaRow>
          </TitleSection>

          {/* 실시간 대기질 */}
          {airGrade && (
            <AirQualityBanner $color={airGrade.color}>
              <AirQualityEmoji>{airGrade.emoji}</AirQualityEmoji>
              <AirQualityContent>
                <AirQualityLevel $color={airGrade.color}>
                  현재 공기질: {airGrade.level}
                </AirQualityLevel>
                <AirQualityDesc>
                  PM2.5: {airQualityData.pm25?.value}μg/m³ · {airGrade.message}
                </AirQualityDesc>
              </AirQualityContent>
            </AirQualityBanner>
          )}

          {/* 시간대 추천 */}
          <TimeRecBanner>
            <span style={{ fontSize: '20px' }}>{timeRec.emoji}</span>
            <span>{timeRec.message}</span>
          </TimeRecBanner>

          {/* 환경 데이터 (실제 API 데이터) */}
          <Section>
            <SectionTitle>📊 환경 데이터</SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatValue>{ecoStats.score || 70}</StatValue>
                <StatLabel>생태점수</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{ecoStats.temperatureGap || '-'}</StatValue>
                <StatLabel>온도 저감</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{ecoStats.carbonStorage || ecoStats.carbonOffset || '-'}</StatValue>
                <StatLabel>탄소 저장</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{ecoStats.airQuality || '-'}</StatValue>
                <StatLabel>대기질</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{ecoStats.waterQuality || '-'}</StatValue>
                <StatLabel>수질</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{ecoStats.biodiversity || '-'}</StatValue>
                <StatLabel>생물다양성</StatLabel>
              </StatCard>
            </StatsGrid>

            {/* 생태계서비스 점수 (Climate API) */}
            {regionEcoData?.scores && (
              <>
                <SectionTitle style={{ marginTop: 16 }}>🌿 지역 생태계 점수</SectionTitle>
                <EcoScoreGrid>
                  <EcoScoreItem>
                    <EcoScoreValue $color={getScoreLevel(regionEcoData.scores.carbon).color}>
                      {regionEcoData.scores.carbon}
                    </EcoScoreValue>
                    <EcoScoreLabel>탄소저장</EcoScoreLabel>
                  </EcoScoreItem>
                  <EcoScoreItem>
                    <EcoScoreValue $color={getScoreLevel(regionEcoData.scores.water).color}>
                      {regionEcoData.scores.water}
                    </EcoScoreValue>
                    <EcoScoreLabel>수질정화</EcoScoreLabel>
                  </EcoScoreItem>
                  <EcoScoreItem>
                    <EcoScoreValue $color={getScoreLevel(regionEcoData.scores.air).color}>
                      {regionEcoData.scores.air}
                    </EcoScoreValue>
                    <EcoScoreLabel>대기조절</EcoScoreLabel>
                  </EcoScoreItem>
                  <EcoScoreItem>
                    <EcoScoreValue $color={getScoreLevel(regionEcoData.scores.biodiversity).color}>
                      {regionEcoData.scores.biodiversity}
                    </EcoScoreValue>
                    <EcoScoreLabel>생물다양성</EcoScoreLabel>
                  </EcoScoreItem>
                  <EcoScoreItem>
                    <EcoScoreValue $color={getScoreLevel(regionEcoData.scores.landscape).color}>
                      {regionEcoData.scores.landscape}
                    </EcoScoreValue>
                    <EcoScoreLabel>경관</EcoScoreLabel>
                  </EcoScoreItem>
                  <EcoScoreItem>
                    <EcoScoreValue $color={getScoreLevel(regionEcoData.scores.total).color}>
                      {regionEcoData.scores.total}
                    </EcoScoreValue>
                    <EcoScoreLabel>종합</EcoScoreLabel>
                  </EcoScoreItem>
                </EcoScoreGrid>
              </>
            )}
          </Section>

          {/* 피드 섹션 */}
          <Section>
            <SectionTitle>🌟 커뮤니티</SectionTitle>

            <FeedTabs>
              <FeedTab
                $active={activeTab === 'photos'}
                onClick={() => setActiveTab('photos')}
              >
                <FiCamera size={16} />
                사진 {spotStats.photos || photos.length}
              </FeedTab>
              <FeedTab
                $active={activeTab === 'comments'}
                onClick={() => setActiveTab('comments')}
              >
                <FiMessageCircle size={16} />
                리뷰 {spotStats.comments || comments.length}
              </FeedTab>
            </FeedTabs>

            {activeTab === 'photos' && (
              <>
                <PhotoGrid>
                  {photos.map((photo) => (
                    <PhotoItem key={photo.id}>
                      <img src={photo.url} alt={`${spot.name} 사진`} />
                      <PhotoOverlay>
                        <PhotoStat>
                          <FiHeart size={14} />
                          {photo.likes}
                        </PhotoStat>
                        <PhotoStat>
                          <FiMessageCircle size={14} />
                          {photo.comments}
                        </PhotoStat>
                      </PhotoOverlay>
                    </PhotoItem>
                  ))}
                </PhotoGrid>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <UploadButton onClick={handleUploadClick}>
                  <FiUpload size={18} />
                  사진 업로드하기
                </UploadButton>
              </>
            )}

            {activeTab === 'comments' && (
              <>
                <CommentInput>
                  <CommentAvatar>😊</CommentAvatar>
                  <CommentTextarea
                    placeholder="이 장소에 대한 생각을 나눠주세요..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={1}
                  />
                  <SendButton
                    onClick={handleSendComment}
                    disabled={!commentText.trim()}
                  >
                    <FiSend size={16} />
                  </SendButton>
                </CommentInput>

                {comments.comments?.length > 0 || comments.length > 0 ? (
                  <CommentList style={{ marginTop: 20 }}>
                    {(comments.comments || comments).map((comment) => (
                      <CommentItem key={comment.id}>
                        <CommentAvatar>
                          {comment.user?.avatar ? (
                            <img src={comment.user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                          ) : '😊'}
                        </CommentAvatar>
                        <CommentContent>
                          <CommentHeader>
                            <CommentAuthor>{comment.user?.name || comment.author || '익명'}</CommentAuthor>
                            <CommentTime>
                              {comment.createdAt
                                ? new Date(comment.createdAt).toLocaleDateString('ko-KR')
                                : comment.time || '방금 전'}
                            </CommentTime>
                          </CommentHeader>
                          <CommentText>{comment.content || comment.text}</CommentText>
                          <CommentActions>
                            <CommentAction>
                              <FiHeart size={14} />
                              {comment.likes || 0}
                            </CommentAction>
                            <CommentAction>
                              <FiMessageCircle size={14} />
                              답글
                            </CommentAction>
                          </CommentActions>
                        </CommentContent>
                      </CommentItem>
                    ))}
                  </CommentList>
                ) : (
                  <EmptyState>
                    <EmptyIcon>💬</EmptyIcon>
                    <EmptyText>아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요!</EmptyText>
                  </EmptyState>
                )}
              </>
            )}
          </Section>

          {/* 미션 */}
          <Section>
            <SectionTitle>🎯 미션: {spot.mission?.title || '탐험하기'}</SectionTitle>
            <Description>{spot.mission?.description || '이 장소를 방문하고 사진을 찍어보세요!'}</Description>
            <MetaTag style={{ marginTop: 12 }}>
              💾 보상: {spot.mission?.reward || 30} XP
            </MetaTag>
          </Section>
        </Content>

        <ActionButton onClick={handleUnlock} disabled={isUnlocked}>
          {isUnlocked ? (
            <>✅ 데이터 복구 완료!</>
          ) : (
            <>📡 이 지역 데이터 복구하기</>
          )}
        </ActionButton>
      </Container>
    </Overlay>
  )
}

export default SpotDetailPage
