export const BADGES = {
  first_visit: {
    id: 'first_visit',
    name: '첫 발걸음',
    emoji: '👣',
    description: '첫 번째 스팟을 방문했습니다',
    requirement: { type: 'visits', count: 1 },
  },
  explorer_5: {
    id: 'explorer_5',
    name: '초보 탐험가',
    emoji: '🔍',
    description: '5개의 스팟을 방문했습니다',
    requirement: { type: 'visits', count: 5 },
  },
  explorer_20: {
    id: 'explorer_20',
    name: '숙련 탐험가',
    emoji: '🧭',
    description: '20개의 스팟을 방문했습니다',
    requirement: { type: 'visits', count: 20 },
  },
  explorer_50: {
    id: 'explorer_50',
    name: '전문 탐험가',
    emoji: '🏆',
    description: '50개의 스팟을 방문했습니다',
    requirement: { type: 'visits', count: 50 },
  },
  nature_lover: {
    id: 'nature_lover',
    name: '자연 애호가',
    emoji: '🌳',
    description: '자연 카테고리 스팟 10곳 방문',
    requirement: { type: 'category', category: 'nature', count: 10 },
  },
  water_guardian: {
    id: 'water_guardian',
    name: '수자원 지킴이',
    emoji: '💧',
    description: '수자원 카테고리 스팟 5곳 방문',
    requirement: { type: 'category', category: 'water', count: 5 },
  },
  eco_warrior: {
    id: 'eco_warrior',
    name: '생태 전사',
    emoji: '🦋',
    description: '생태 카테고리 스팟 5곳 방문',
    requirement: { type: 'category', category: 'ecology', count: 5 },
  },
  culture_master: {
    id: 'culture_master',
    name: '문화 달인',
    emoji: '🏛️',
    description: '문화 카테고리 스팟 10곳 방문',
    requirement: { type: 'category', category: 'culture', count: 10 },
  },
  region_explorer: {
    id: 'region_explorer',
    name: '경기도 탐험가',
    emoji: '🗺️',
    description: '5개 이상 지역 방문',
    requirement: { type: 'regions', count: 5 },
  },
  region_master: {
    id: 'region_master',
    name: '경기도 마스터',
    emoji: '👑',
    description: '15개 이상 지역 방문',
    requirement: { type: 'regions', count: 15 },
  },
  streak_3: {
    id: 'streak_3',
    name: '꾸준한 발걸음',
    emoji: '🔥',
    description: '3일 연속 방문',
    requirement: { type: 'streak', days: 3 },
  },
  streak_7: {
    id: 'streak_7',
    name: '일주일 챌린지',
    emoji: '⚡',
    description: '7일 연속 방문',
    requirement: { type: 'streak', days: 7 },
  },
  eco_score_100: {
    id: 'eco_score_100',
    name: '환경 기여자',
    emoji: '🌍',
    description: '환경 점수 100점 달성',
    requirement: { type: 'ecoScore', score: 100 },
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    name: '주말 탐험가',
    emoji: '🎉',
    description: '주말 방문 10회 달성',
    requirement: { type: 'weekendVisits', count: 10 },
  },
}

const LEVEL_THRESHOLDS = [
  { level: 1, title: '새싹 탐험가', minXp: 0 },
  { level: 2, title: '풀잎 탐험가', minXp: 100 },
  { level: 3, title: '나무 탐험가', minXp: 250 },
  { level: 4, title: '숲 탐험가', minXp: 500 },
  { level: 5, title: '산 탐험가', minXp: 800 },
  { level: 6, title: '하늘 탐험가', minXp: 1200 },
  { level: 7, title: '별 탐험가', minXp: 1800 },
  { level: 8, title: '은하 탐험가', minXp: 2500 },
  { level: 9, title: '우주 탐험가', minXp: 3500 },
  { level: 10, title: '전설의 탐험가', minXp: 5000 },
]

export function getUnlockedBadges(gameState, ecoSpots) {
  if (!gameState) return []
  const { unlockedBadges = [] } = gameState
  return unlockedBadges.map(id => BADGES[id]).filter(Boolean)
}

export function getNextBadges(badgeStats, limit = 3) {
  const allBadges = Object.values(BADGES)
  const locked = allBadges.filter(badge => {
    const req = badge.requirement
    switch (req.type) {
      case 'visits': return badgeStats.totalVisits < req.count
      case 'category': return (badgeStats.categoryVisits?.[req.category] || 0) < req.count
      case 'regions': return badgeStats.uniqueRegions < req.count
      case 'streak': return badgeStats.currentStreak < req.days
      case 'ecoScore': return badgeStats.totalEcoScore < req.score
      case 'weekendVisits': return badgeStats.weekendVisits < req.count
      default: return true
    }
  })
  return locked.slice(0, limit)
}

export function getLevelInfo(totalXp = 0) {
  let current = LEVEL_THRESHOLDS[0]
  let next = LEVEL_THRESHOLDS[1]

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].minXp) {
      current = LEVEL_THRESHOLDS[i]
      next = LEVEL_THRESHOLDS[i + 1] || null
      break
    }
  }

  return {
    level: current.level,
    title: current.title,
    currentXp: totalXp,
    nextLevelXp: next ? next.minXp : null,
    progress: next ? (totalXp - current.minXp) / (next.minXp - current.minXp) : 1,
  }
}

export function getCurrentTitle(totalXp = 0) {
  return getLevelInfo(totalXp).title
}
