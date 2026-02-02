export function calculateUserContribution(unlockedSpots, ecoSpots) {
  if (!unlockedSpots || !ecoSpots) {
    return {
      totalScore: 0,
      visitedCount: 0,
      categoryBreakdown: {},
      regionBreakdown: {},
      impactLevel: 'beginner',
    }
  }

  const visited = ecoSpots.filter(s => unlockedSpots.includes(s.id))
  const totalScore = visited.reduce((sum, s) => sum + (s.scores?.total || 0), 0)

  const categoryBreakdown = {}
  const regionBreakdown = {}

  visited.forEach(spot => {
    if (spot.category) {
      categoryBreakdown[spot.category] = (categoryBreakdown[spot.category] || 0) + 1
    }
    if (spot.region) {
      regionBreakdown[spot.region] = (regionBreakdown[spot.region] || 0) + 1
    }
  })

  let impactLevel = 'beginner'
  if (visited.length >= 50) impactLevel = 'master'
  else if (visited.length >= 20) impactLevel = 'advanced'
  else if (visited.length >= 5) impactLevel = 'intermediate'

  return {
    totalScore,
    visitedCount: visited.length,
    categoryBreakdown,
    regionBreakdown,
    impactLevel,
  }
}

export function calculateEnvironmentalImpact(spot) {
  if (!spot) return null

  const scores = spot.scores || {}

  return {
    spotName: spot.name,
    category: spot.category,
    totalScore: scores.total || 0,
    areaScore: scores.area || 0,
    ecoValueScore: scores.eco_value || 0,
    accessibilityScore: scores.accessibility || 0,
    uniquenessScore: scores.uniqueness || 0,
    carbonOffset: (scores.total || 0) * 0.5,
    description: spot.description || '',
  }
}
