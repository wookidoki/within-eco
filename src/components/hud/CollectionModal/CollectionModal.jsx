import { FiX, FiLock } from 'react-icons/fi'
import { useGameStore } from '../../../stores'
import { ecoSpots, CATEGORIES } from '../../../data/spots'
import {
  Overlay,
  ModalContainer,
  Header,
  Title,
  CloseButton,
  ProgressBar,
  ProgressFill,
  ProgressText,
  Grid,
  Card,
  CardInner,
  CardFront,
  CardBack,
  LockIcon,
  Silhouette,
  CardEmoji,
  CardName,
  CardCategory,
  CardScore,
  EmptyState,
  EmptyIcon,
  EmptyText,
} from './CollectionModal.styles'

const CollectionModal = () => {
  const { isCollectionOpen, toggleCollection, unlockedSpots, openSpotDetail } = useGameStore()

  if (!isCollectionOpen) return null

  const progress = (unlockedSpots.length / ecoSpots.length) * 100
  const hasNoData = unlockedSpots.length === 0

  return (
    <Overlay onClick={toggleCollection}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>💾 데이터 아카이브</Title>
          <CloseButton onClick={toggleCollection}>
            <FiX size={24} />
          </CloseButton>
        </Header>

        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>
        <ProgressText>
          {unlockedSpots.length} / {ecoSpots.length} 데이터 복구 완료
          {progress === 100 && ' - 지구 복원 성공!'}
        </ProgressText>

        {hasNoData ? (
          <EmptyState>
            <EmptyIcon>📡</EmptyIcon>
            <EmptyText>
              아직 복구된 데이터가 없습니다.<br />
              탐험을 시작하세요.
            </EmptyText>
          </EmptyState>
        ) : (
          <Grid>
            {ecoSpots.map((spot) => {
              const isUnlocked = unlockedSpots.includes(spot.id)
              const category = CATEGORIES[spot.category]

              return (
                <Card
                  key={spot.id}
                  $isUnlocked={isUnlocked}
                  onClick={() => isUnlocked && openSpotDetail(spot)}
                >
                  <CardInner $isUnlocked={isUnlocked}>
                    {/* 잠김 상태 (앞면) */}
                    <CardFront>
                      <LockIcon>
                        <FiLock size={32} />
                      </LockIcon>
                      <Silhouette>{spot.thumbnail}</Silhouette>
                      <CardName>???</CardName>
                    </CardFront>

                    {/* 해금 상태 (뒷면) */}
                    <CardBack $color={category.color}>
                      <CardEmoji>{spot.thumbnail}</CardEmoji>
                      <CardName>{spot.name}</CardName>
                      <CardCategory $color={category.color}>
                        {category.emoji} {category.label}
                      </CardCategory>
                      <CardScore>
                        💾 {spot.ecoStats.score}점
                      </CardScore>
                    </CardBack>
                  </CardInner>
                </Card>
              )
            })}
          </Grid>
        )}
      </ModalContainer>
    </Overlay>
  )
}

export default CollectionModal
