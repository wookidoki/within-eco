import { SEASONS, getCurrentSeason } from '../../../data/spots'
import { Badge, SeasonIcon } from './SeasonBadge.styles'

const SeasonBadge = ({ season, showLabel = true }) => {
  const currentSeason = getCurrentSeason()
  const seasonData = SEASONS[season] || SEASONS.ALL
  const isActive = season === currentSeason || season === 'ALL'

  return (
    <Badge $isActive={isActive}>
      <SeasonIcon>{seasonData.emoji}</SeasonIcon>
      {showLabel && seasonData.label}
      {isActive && season !== 'ALL' && ' 추천'}
    </Badge>
  )
}

export default SeasonBadge
