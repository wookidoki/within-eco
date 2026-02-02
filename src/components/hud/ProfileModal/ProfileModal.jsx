import { useState, useEffect } from 'react'
import { FiX, FiEdit2, FiRefreshCw, FiTrash2, FiUser, FiMail, FiAward, FiMap } from 'react-icons/fi'
import { useAuthStore, useGameStore } from '../../../stores'
import { validateNickname } from '../../../utils/nickname'
import {
  Overlay,
  ModalContainer,
  Header,
  Title,
  CloseButton,
  Section,
  SectionTitle,
  UserInfo,
  Avatar,
  UserDetails,
  UserEmail,
  NicknameForm,
  NicknameInput,
  NicknameActions,
  ActionButton,
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
  DangerSection,
  DangerButton,
  ConfirmModal,
  ConfirmText,
  ConfirmActions,
} from './ProfileModal.styles'

const ProfileModal = ({ isOpen, onClose }) => {
  const {
    user,
    updateNickname,
    regenerateNickname,
    getDisplayName,
  } = useAuthStore()

  const {
    resetProgress,
    getStatsSummary,
  } = useGameStore()

  const [nickname, setNickname] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const stats = getStatsSummary()

  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname)
    } else {
      setNickname(getDisplayName())
    }
  }, [user, getDisplayName])

  if (!isOpen) return null

  const handleSaveNickname = async () => {
    const validation = validateNickname(nickname)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await updateNickname(nickname)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerateNickname = () => {
    const newNickname = regenerateNickname()
    if (newNickname) {
      setNickname(newNickname)
      setError('')
    }
  }

  const handleResetProgress = () => {
    resetProgress()
    setShowResetConfirm(false)
    onClose()
  }

  const handleCancel = () => {
    setNickname(user?.nickname || getDisplayName())
    setIsEditing(false)
    setError('')
  }

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>내 정보</Title>
          <CloseButton onClick={onClose}>
            <FiX size={24} />
          </CloseButton>
        </Header>

        {/* 사용자 정보 */}
        <Section>
          <UserInfo>
            {user?.avatar ? (
              <Avatar src={user.avatar} alt={user.name} />
            ) : (
              <Avatar as="div">
                <FiUser size={32} />
              </Avatar>
            )}
            <UserDetails>
              {isEditing ? (
                <NicknameForm>
                  <NicknameInput
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value)
                      setError('')
                    }}
                    placeholder="닉네임 입력"
                    maxLength={20}
                    autoFocus
                  />
                  <NicknameActions>
                    <ActionButton
                      onClick={handleRegenerateNickname}
                      title="랜덤 닉네임 생성"
                      type="button"
                    >
                      <FiRefreshCw size={16} />
                    </ActionButton>
                    <ActionButton
                      onClick={handleSaveNickname}
                      disabled={isSaving}
                      $primary
                    >
                      {isSaving ? '저장 중...' : '저장'}
                    </ActionButton>
                    <ActionButton onClick={handleCancel}>
                      취소
                    </ActionButton>
                  </NicknameActions>
                  {error && <span style={{ color: '#FF6B6B', fontSize: '12px' }}>{error}</span>}
                </NicknameForm>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>
                      {user?.nickname || getDisplayName()}
                    </span>
                    <ActionButton onClick={() => setIsEditing(true)} title="닉네임 변경">
                      <FiEdit2 size={14} />
                    </ActionButton>
                  </div>
                  <UserEmail>
                    <FiMail size={14} />
                    {user?.email}
                  </UserEmail>
                </>
              )}
            </UserDetails>
          </UserInfo>
        </Section>

        {/* 탐험 통계 */}
        <Section>
          <SectionTitle>
            <FiAward size={18} />
            탐험 현황
          </SectionTitle>
          <StatGrid>
            <StatItem>
              <StatValue>{stats.level}</StatValue>
              <StatLabel>레벨</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.unlockedCount}</StatValue>
              <StatLabel>방문 스팟</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.badgeCount}</StatValue>
              <StatLabel>획득 배지</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.currentStreak}</StatValue>
              <StatLabel>연속 방문</StatLabel>
            </StatItem>
          </StatGrid>
        </Section>

        <Section>
          <SectionTitle>
            <FiMap size={18} />
            상세 통계
          </SectionTitle>
          <StatGrid>
            <StatItem>
              <StatValue>{stats.totalXp}</StatValue>
              <StatLabel>총 XP</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.uniqueRegions}</StatValue>
              <StatLabel>탐험 지역</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.completionRate}%</StatValue>
              <StatLabel>완료율</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.totalEcoScore}</StatValue>
              <StatLabel>생태 점수</StatLabel>
            </StatItem>
          </StatGrid>
        </Section>

        {/* 위험 구역 */}
        <DangerSection>
          <SectionTitle style={{ color: '#FF6B6B' }}>
            <FiTrash2 size={18} />
            데이터 관리
          </SectionTitle>
          <DangerButton onClick={() => setShowResetConfirm(true)}>
            진행상황 초기화
          </DangerButton>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            모든 방문 기록, 배지, 레벨이 초기화됩니다.
          </p>
        </DangerSection>

        {/* 초기화 확인 모달 */}
        {showResetConfirm && (
          <ConfirmModal onClick={(e) => e.stopPropagation()}>
            <ConfirmText>
              정말 모든 진행상황을 초기화하시겠습니까?<br />
              이 작업은 되돌릴 수 없습니다.
            </ConfirmText>
            <ConfirmActions>
              <ActionButton onClick={() => setShowResetConfirm(false)}>
                취소
              </ActionButton>
              <ActionButton $danger onClick={handleResetProgress}>
                초기화
              </ActionButton>
            </ConfirmActions>
          </ConfirmModal>
        )}
      </ModalContainer>
    </Overlay>
  )
}

export default ProfileModal
