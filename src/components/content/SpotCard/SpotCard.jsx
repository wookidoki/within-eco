import { FiMapPin, FiClock } from 'react-icons/fi'
import { CATEGORIES, SEASONS, REGIONS, getCurrentSeason } from '../../../data/spots'
import {
  Card,
  ImageContainer,
  Thumbnail,
  SeasonTag,
  UnlockedBadge,
  Content,
  Header,
  Name,
  Score,
  Meta,
  MetaItem,
  CategoryBadge,
  Description,
} from './SpotCard.styles'

const SpotCard = ({ spot, isUnlocked, onClick }) => {
  const category = CATEGORIES[spot.category]
  const region = REGIONS[spot.region]
  const currentSeason = getCurrentSeason()
  const isRecommended = spot.bestSeason.includes(currentSeason) || spot.bestSeason.includes('ALL')
  const seasonInfo = SEASONS[spot.bestSeason[0]] || SEASONS.ALL

  return (
    <Card onClick={() => onClick?.(spot)}>
      <ImageContainer $color={category.color}>
        <Thumbnail>{spot.thumbnail}</Thumbnail>
        {isRecommended && (
          <SeasonTag>
            {SEASONS[currentSeason].emoji} 지금 추천
          </SeasonTag>
        )}
        {isUnlocked && (
          <UnlockedBadge>✓</UnlockedBadge>
        )}
      </ImageContainer>

      <Content>
        <Header>
          <Name>{spot.name}</Name>
          <Score>
            💾 {spot.ecoStats.score}
          </Score>
        </Header>

        <Meta>
          <MetaItem>
            <FiMapPin />
            {region?.name}
          </MetaItem>
          <MetaItem>
            <FiClock />
            {spot.duration}
          </MetaItem>
          <CategoryBadge $color={category.color}>
            {category.emoji} {category.label}
          </CategoryBadge>
        </Meta>

        <Description>
          {spot.description}
        </Description>
      </Content>
    </Card>
  )
}

export default SpotCard
