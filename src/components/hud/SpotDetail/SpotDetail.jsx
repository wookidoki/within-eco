import { useState, useEffect, useCallback, useRef } from 'react'
import { FiX, FiMapPin, FiAward, FiMessageCircle, FiCamera, FiSend, FiTrash2, FiHeart } from 'react-icons/fi'
import { useGameStore, useAuthStore } from '../../../stores'
import { CATEGORIES } from '../../../data/spots'
import { getEcosystemScoreByRegion, getScoreLevel, SCORE_DESCRIPTIONS } from '../../../api/climateApi'
import { getAirQuality, getAirQualityGrade, getVisitRecommendation } from '../../../api/airQualityApi'
import { getSpotComments, addSpotComment, deleteSpotComment, getSpotPhotos, uploadSpotPhoto, getSpotStats } from '../../../api/spotApi'
import logger from '../../../utils/logger'
import {
  Overlay,
  ModalContainer,
  Header,
  CloseButton,
  CategoryBadge,
  SpotEmoji,
  SpotName,
  SpotAddress,
  ScoreSection,
  ScoreCircle,
  ScoreLabel,
  ScoreValue,
  StatsGrid,
  StatCard,
  StatEmoji,
  StatLabel,
  StatValue,
  DescriptionBox,
  MissionSection,
  MissionTitle,
  MissionDesc,
  MissionReward,
  ActionButton,
  TabContainer,
  Tab,
  TabContent,
  CommentList,
  CommentItem,
  CommentHeader,
  CommentAuthor,
  CommentDate,
  CommentText,
  CommentInput,
  CommentForm,
  PhotoGrid,
  PhotoItem,
  PhotoUploadButton,
  EmptyState,
  LoadingSpinner,
  ApiScoreGrid,
  ApiScoreItem,
  ApiScoreBar,
  ApiScoreBarFill,
} from './SpotDetail.styles'

const SpotDetail = () => {
  const { selectedSpot, closeSpotDetail, unlockSpot, isSpotUnlocked, currentLocation } = useGameStore()
  const { user, isAuthenticated, getAuthHeader } = useAuthStore()

  // API 데이터 상태
  const [ecoData, setEcoData] = useState(null)
  const [airData, setAirData] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState(null)

  // 탭 상태
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'comments' | 'photos'

  // 댓글 상태
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // 사진 상태
  const [photos, setPhotos] = useState([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  // 통계
  const [stats, setStats] = useState({ comments: 0, photos: 0, likes: 0, visits: 0 })

  // 환경 데이터 로드
  useEffect(() => {
    if (!selectedSpot?.region) return

    const fetchEcoData = async () => {
      setIsLoadingData(true)
      setDataError(null)

      try {
        const results = await Promise.allSettled([
          getEcosystemScoreByRegion(selectedSpot.region),
          getAirQuality(selectedSpot.region),
        ])

        // 각 결과를 개별 처리 (하나 실패해도 다른 것은 표시)
        const [ecoResult, airResult] = results
        const errors = []

        if (ecoResult.status === 'fulfilled') {
          setEcoData(ecoResult.value)
        } else {
          console.error('Failed to fetch eco data:', ecoResult.reason)
          errors.push('생태계 데이터')
        }

        if (airResult.status === 'fulfilled') {
          setAirData(airResult.value)
        } else {
          console.error('Failed to fetch air data:', airResult.reason)
          errors.push('대기질 데이터')
        }

        if (errors.length > 0) {
          setDataError(`${errors.join(', ')} 로딩 실패`)
        }
      } catch (err) {
        console.error('Failed to fetch eco data:', err)
        setDataError('환경 데이터를 불러오는데 실패했습니다')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchEcoData()
  }, [selectedSpot?.region])

  // 통계 로드
  useEffect(() => {
    if (!selectedSpot?.id) return

    const fetchStats = async () => {
      const data = await getSpotStats(selectedSpot.id)
      setStats(data)
    }
    fetchStats()
  }, [selectedSpot?.id])

  // 댓글 로드
  const loadComments = useCallback(async () => {
    if (!selectedSpot?.id) return

    setIsLoadingComments(true)
    try {
      const data = await getSpotComments(selectedSpot.id)
      setComments(data.comments || [])
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setIsLoadingComments(false)
    }
  }, [selectedSpot?.id])

  // 사진 로드
  const loadPhotos = useCallback(async () => {
    if (!selectedSpot?.id) return

    setIsLoadingPhotos(true)
    try {
      const data = await getSpotPhotos(selectedSpot.id)
      setPhotos(data || [])
    } catch (err) {
      console.error('Failed to load photos:', err)
    } finally {
      setIsLoadingPhotos(false)
    }
  }, [selectedSpot?.id])

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'comments') {
      loadComments()
    } else if (activeTab === 'photos') {
      loadPhotos()
    }
  }, [activeTab, loadComments, loadPhotos])

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated) return

    setIsSubmittingComment(true)
    try {
      await addSpotComment(selectedSpot.id, newComment.trim())
      setNewComment('')
      loadComments()
      setStats(prev => ({ ...prev, comments: prev.comments + 1 }))
      logger.success('댓글이 등록되었습니다', null, true)
    } catch (err) {
      logger.error(err.message, null, true)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return

    try {
      await deleteSpotComment(selectedSpot.id, commentId)
      loadComments()
      setStats(prev => ({ ...prev, comments: Math.max(0, prev.comments - 1) }))
      logger.success('댓글이 삭제되었습니다', null, true)
    } catch (err) {
      logger.error(err.message, null, true)
    }
  }

  // 사진 업로드
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !isAuthenticated) return

    if (!file.type.startsWith('image/')) {
      logger.error('이미지 파일만 업로드 가능합니다', null, true)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      logger.error('파일 크기는 5MB 이하여야 합니다', null, true)
      return
    }

    setIsUploadingPhoto(true)
    try {
      await uploadSpotPhoto(selectedSpot.id, file)
      loadPhotos()
      setStats(prev => ({ ...prev, photos: prev.photos + 1 }))
      logger.success('사진이 업로드되었습니다', null, true)
    } catch (err) {
      logger.error(err.message, null, true)
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (!selectedSpot) return null

  const category = CATEGORIES[selectedSpot.category]
  const isUnlocked = isSpotUnlocked(selectedSpot.id)

  // API에서 가져온 점수 또는 스팟 데이터의 점수 사용
  const ecoScores = ecoData?.scores || selectedSpot.ecoScores || {}
  const totalScore = ecoScores.total || selectedSpot.ecoStats?.score || 50
  const scoreLevel = getScoreLevel(totalScore)

  // 대기질 정보
  const airGrade = airData ? getAirQualityGrade(airData.pm25?.grade) : null
  const visitRec = airData ? getVisitRecommendation(airData) : null

  const handleStamp = () => {
    const result = unlockSpot(selectedSpot.id, currentLocation)

    if (!result.success) {
      switch (result.reason) {
        case 'already_unlocked':
          logger.info('이미 스탬프를 찍은 장소입니다', null, true)
          break
        case 'too_far':
          logger.warning(`현재 위치에서 ${result.distance}m 떨어져 있습니다. 500m 이내에서만 스탬프를 찍을 수 있습니다.`, null, true)
          break
        case 'no_location':
          logger.warning('위치 정보를 확인할 수 없습니다. 위치 권한을 허용해주세요.', null, true)
          break
        default:
          logger.error('스탬프 찍기에 실패했습니다', null, true)
      }
      return
    }

    logger.success(`스탬프 획득! +${result.reward} XP`, null, true)
    if (result.levelUp) {
      logger.success('레벨 업!', null, true)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Overlay onClick={closeSpotDetail}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <CategoryBadge $color={category?.color || '#00FF94'}>
            {category?.emoji || '🌿'} {category?.label || '자연'}
          </CategoryBadge>
          <CloseButton onClick={closeSpotDetail}>
            <FiX size={24} />
          </CloseButton>
        </Header>

        <SpotEmoji>{selectedSpot.thumbnail || category?.emoji || '🌿'}</SpotEmoji>
        <SpotName>{selectedSpot.name}</SpotName>
        <SpotAddress>
          <FiMapPin size={14} />
          {selectedSpot.address || `${selectedSpot.region} ${selectedSpot.district || ''}`}
        </SpotAddress>

        {/* 탭 네비게이션 */}
        <TabContainer>
          <Tab $active={activeTab === 'info'} onClick={() => setActiveTab('info')}>
            정보
          </Tab>
          <Tab $active={activeTab === 'comments'} onClick={() => setActiveTab('comments')}>
            <FiMessageCircle size={14} />
            댓글 {stats.comments > 0 && `(${stats.comments})`}
          </Tab>
          <Tab $active={activeTab === 'photos'} onClick={() => setActiveTab('photos')}>
            <FiCamera size={14} />
            사진 {stats.photos > 0 && `(${stats.photos})`}
          </Tab>
        </TabContainer>

        <TabContent>
          {/* 정보 탭 */}
          {activeTab === 'info' && (
            <>
              {/* 에코 점수 원형 차트 */}
              <ScoreSection>
                <ScoreCircle $score={totalScore}>
                  <ScoreValue>{totalScore}</ScoreValue>
                  <ScoreLabel>{scoreLevel.emoji} {scoreLevel.level}</ScoreLabel>
                </ScoreCircle>
              </ScoreSection>

              {/* 실시간 대기질 */}
              {airGrade && (
                <StatsGrid>
                  <StatCard style={{ gridColumn: 'span 2', background: `${airGrade.color}22` }}>
                    <StatEmoji>{airGrade.emoji}</StatEmoji>
                    <StatLabel>현재 공기질</StatLabel>
                    <StatValue style={{ color: airGrade.color }}>{airGrade.level}</StatValue>
                    {visitRec && <span style={{ fontSize: '11px', color: '#999' }}>{visitRec.message}</span>}
                  </StatCard>
                </StatsGrid>
              )}

              {/* API 환경 점수 (실제 데이터) */}
              {isLoadingData ? (
                <LoadingSpinner>환경 데이터 로딩 중...</LoadingSpinner>
              ) : dataError ? (
                <EmptyState>{dataError}</EmptyState>
              ) : ecoData?.scores ? (
                <ApiScoreGrid>
                  {Object.entries(SCORE_DESCRIPTIONS).slice(0, 6).map(([key, desc]) => {
                    const score = ecoScores[key] || 0
                    const level = getScoreLevel(score)
                    return (
                      <ApiScoreItem key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{desc.emoji} {desc.label}</span>
                          <span style={{ color: level.color, fontWeight: 600 }}>{score}</span>
                        </div>
                        <ApiScoreBar>
                          <ApiScoreBarFill $value={score} $color={level.color} />
                        </ApiScoreBar>
                      </ApiScoreItem>
                    )
                  })}
                </ApiScoreGrid>
              ) : (
                /* 기존 스팟 데이터의 ecoStats 사용 */
                selectedSpot.ecoStats && (
                  <StatsGrid>
                    <StatCard>
                      <StatEmoji>🌱</StatEmoji>
                      <StatLabel>탄소 절감</StatLabel>
                      <StatValue>{selectedSpot.ecoStats.carbonOffset || '-'}</StatValue>
                    </StatCard>
                    <StatCard>
                      <StatEmoji>🌡️</StatEmoji>
                      <StatLabel>온도 효과</StatLabel>
                      <StatValue>{selectedSpot.ecoStats.temperatureGap || selectedSpot.ecoStats.recycleRate || '-'}</StatValue>
                    </StatCard>
                  </StatsGrid>
                )
              )}

              {/* 설명 */}
              {selectedSpot.description && (
                <DescriptionBox>
                  {selectedSpot.description}
                </DescriptionBox>
              )}

              {/* 미션 */}
              {selectedSpot.mission && (
                <MissionSection>
                  <MissionTitle>
                    <FiAward size={18} />
                    오늘의 미션
                  </MissionTitle>
                  <MissionDesc>{selectedSpot.mission.description}</MissionDesc>
                  <MissionReward>
                    완료하면 {selectedSpot.mission.reward} XP 획득!
                  </MissionReward>
                </MissionSection>
              )}

              {/* 스탬프 버튼 */}
              <ActionButton
                onClick={handleStamp}
                disabled={isUnlocked}
                $isUnlocked={isUnlocked}
              >
                {isUnlocked ? '스탬프 완료!' : '스탬프 찍기'}
              </ActionButton>
            </>
          )}

          {/* 댓글 탭 */}
          {activeTab === 'comments' && (
            <>
              {isAuthenticated ? (
                <CommentForm onSubmit={handleSubmitComment}>
                  <CommentInput
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="이 장소에 대한 경험을 공유해주세요..."
                    maxLength={500}
                  />
                  <ActionButton
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    style={{ marginTop: '8px' }}
                  >
                    <FiSend size={16} />
                    {isSubmittingComment ? '등록 중...' : '댓글 등록'}
                  </ActionButton>
                </CommentForm>
              ) : (
                <EmptyState>로그인하면 댓글을 작성할 수 있습니다</EmptyState>
              )}

              {isLoadingComments ? (
                <LoadingSpinner>댓글 로딩 중...</LoadingSpinner>
              ) : comments.length === 0 ? (
                <EmptyState>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</EmptyState>
              ) : (
                <CommentList>
                  {comments.map((comment) => (
                    <CommentItem key={comment.id}>
                      <CommentHeader>
                        <CommentAuthor>{comment.user?.name || '익명'}</CommentAuthor>
                        <CommentDate>{formatDate(comment.createdAt)}</CommentDate>
                        {user?.id === comment.user?.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{ marginLeft: 'auto', background: 'none', color: '#FF6B6B', cursor: 'pointer' }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </CommentHeader>
                      <CommentText>{comment.content}</CommentText>
                    </CommentItem>
                  ))}
                </CommentList>
              )}
            </>
          )}

          {/* 사진 탭 */}
          {activeTab === 'photos' && (
            <>
              {isAuthenticated && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <PhotoUploadButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                  >
                    <FiCamera size={20} />
                    {isUploadingPhoto ? '업로드 중...' : '사진 업로드'}
                  </PhotoUploadButton>
                </>
              )}

              {isLoadingPhotos ? (
                <LoadingSpinner>사진 로딩 중...</LoadingSpinner>
              ) : photos.length === 0 ? (
                <EmptyState>아직 사진이 없습니다. 첫 사진을 공유해보세요!</EmptyState>
              ) : (
                <PhotoGrid>
                  {photos.map((photo) => (
                    <PhotoItem key={photo.id}>
                      <img
                        src={`${import.meta.env.VITE_API_URL || ''}/uploads/${photo.filename}`}
                        alt={photo.caption || '스팟 사진'}
                      />
                      {photo.caption && <span>{photo.caption}</span>}
                    </PhotoItem>
                  ))}
                </PhotoGrid>
              )}
            </>
          )}
        </TabContent>
      </ModalContainer>
    </Overlay>
  )
}

export default SpotDetail
