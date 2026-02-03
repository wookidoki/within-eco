import allSpotsData from './spots/all_spots.json'

const rawSpots = Array.isArray(allSpotsData?.spots) ? allSpotsData.spots : Array.isArray(allSpotsData) ? allSpotsData : []

export const CATEGORIES = {
  ALL: { emoji: '🗺️', label: '전체', color: '#6B7280' },
  nature: { emoji: '🌳', label: '자연', color: '#22C55E' },
  water: { emoji: '💧', label: '수자원', color: '#3B82F6' },
  ecology: { emoji: '🦋', label: '생태', color: '#A855F7' },
  sports: { emoji: '⚽', label: '체육', color: '#F97316' },
  culture: { emoji: '🏛️', label: '문화', color: '#EF4444' },
}

export const REGIONS = {
  ALL: { name: '전체', emoji: '🗺️' },
  수원시: { name: '수원시', emoji: '🏰' },
  성남시: { name: '성남시', emoji: '🏙️' },
  용인시: { name: '용인시', emoji: '🎢' },
  화성시: { name: '화성시', emoji: '🚀' },
  고양시: { name: '고양시', emoji: '🌸' },
  안산시: { name: '안산시', emoji: '🌊' },
  남양주시: { name: '남양주시', emoji: '🏔️' },
  안양시: { name: '안양시', emoji: '🌳' },
  평택시: { name: '평택시', emoji: '⚓' },
  시흥시: { name: '시흥시', emoji: '🦢' },
  파주시: { name: '파주시', emoji: '📚' },
  김포시: { name: '김포시', emoji: '✈️' },
  광주시: { name: '광주시', emoji: '🏺' },
  광명시: { name: '광명시', emoji: '💎' },
  군포시: { name: '군포시', emoji: '🌲' },
  하남시: { name: '하남시', emoji: '🌅' },
  오산시: { name: '오산시', emoji: '🦅' },
  이천시: { name: '이천시', emoji: '🍚' },
  안성시: { name: '안성시', emoji: '🐂' },
  의왕시: { name: '의왕시', emoji: '🚂' },
  양평군: { name: '양평군', emoji: '🌾' },
  여주시: { name: '여주시', emoji: '👑' },
  과천시: { name: '과천시', emoji: '🦁' },
  포천시: { name: '포천시', emoji: '⛰️' },
  의정부시: { name: '의정부시', emoji: '🪖' },
  양주시: { name: '양주시', emoji: '🏯' },
  구리시: { name: '구리시', emoji: '🌉' },
  가평군: { name: '가평군', emoji: '🏝️' },
  연천군: { name: '연천군', emoji: '🦌' },
  동두천시: { name: '동두천시', emoji: '🎖️' },
}

export const SEASONS = {
  spring: { emoji: '🌸', label: '봄' },
  summer: { emoji: '☀️', label: '여름' },
  autumn: { emoji: '🍂', label: '가을' },
  winter: { emoji: '❄️', label: '겨울' },
}

// 일반명 목록 (고유명사가 아닌 시설유형명)
const GENERIC_NAMES = new Set([
  '문화체육시설', '문화시설', '근린 및 주제공원', '체육시설',
  '공공시설', '공공휴양녹지', '습지', '완충녹지', '경관녹지',
  '공공청사', '생태보호구역',
])

// 일반명을 의미 있는 표시명으로 변환
function resolveDisplayName(spot) {
  if (!GENERIC_NAMES.has(spot.name)) return spot.name
  const district = spot.district || ''
  if (district) return `${district} ${spot.type || spot.name}`
  const idNum = spot.id?.split('.').pop() || ''
  return `${spot.type || spot.name} #${idNum}`
}

// Haversine 거리 계산 (미터)
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Spatial hash 클러스터링: 500m 이내 같은 카테고리 스팟을 하나로 묶음
function clusterNearbySpots(spots, radiusMeters = 500) {
  const CELL_LAT = radiusMeters / 111000
  const CELL_LNG = radiusMeters / (111000 * Math.cos(37.4 * Math.PI / 180))

  // 카테고리+그리드셀 기준으로 분류
  const grid = new Map()
  for (const spot of spots) {
    if (!spot.location?.lat || !spot.location?.lng) continue
    const cellKey = `${Math.floor(spot.location.lat / CELL_LAT)}_${Math.floor(spot.location.lng / CELL_LNG)}_${spot.category}`
    if (!grid.has(cellKey)) grid.set(cellKey, [])
    grid.get(cellKey).push(spot)
  }

  const result = []
  const used = new Set()

  for (const [, cellSpots] of grid) {
    // 점수 높은 순 정렬
    cellSpots.sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0))

    for (const spot of cellSpots) {
      if (used.has(spot.id)) continue

      const nearby = []
      for (const other of cellSpots) {
        if (used.has(other.id) || other.id === spot.id) continue
        const dist = haversineMeters(
          spot.location.lat, spot.location.lng,
          other.location.lat, other.location.lng
        )
        if (dist <= radiusMeters) {
          nearby.push(other)
          used.add(other.id)
        }
      }

      used.add(spot.id)
      result.push({
        ...spot,
        clusterCount: nearby.length,
        clusterIds: nearby.map(n => n.id),
      })
    }
  }

  return result
}

// Step 1: 변환 (displayName, ecoScores, ecoStats 매핑)
const transformedSpots = rawSpots.map(spot => ({
  ...spot,
  displayName: resolveDisplayName(spot),
  region: spot.region || spot.district || '',
  address: spot.address || '',
  mission: spot.mission || { reward: Math.max(10, Math.round((spot.scores?.total || 30) * 0.8)), description: `${spot.name} 방문하기` },
  ecoScores: spot.ecoScores || {
    area: spot.scores?.area || 0,
    accessibility: spot.scores?.accessibility || 0,
    uniqueness: spot.scores?.uniqueness || 0,
    total_score: spot.scores?.total || 0,
  },
  ecoStats: spot.ecoStats || { score: spot.scores?.total || 0 },
  thumbnail: spot.thumbnail || CATEGORIES[spot.category]?.emoji || '📍',
  bestSeason: spot.bestSeason || ['ALL'],
}))

// Step 2: 근접 클러스터링
export const ecoSpots = clusterNearbySpots(transformedSpots, 500)

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function getPrioritySpots() {
  return ecoSpots.filter(spot => spot.priority === true)
}

export const travelCourses = [
  {
    name: '수리산 생태 탐방',
    description: '수리산 도립공원을 중심으로 한 자연 탐방 코스',
    region: '안양시',
    spots: ecoSpots.filter(s => s.name?.includes('수리산')).map(s => s.id).slice(0, 5),
    thumbnail: '🏔️',
    duration: '3-4시간',
    totalDistance: '약 8km',
    difficulty: 'medium',
  },
  {
    name: '남한산성 역사 생태길',
    description: '남한산성의 역사와 자연을 함께 즐기는 코스',
    region: '광주시',
    spots: ecoSpots.filter(s => s.name?.includes('남한산성')).map(s => s.id).slice(0, 5),
    thumbnail: '🏯',
    duration: '2-3시간',
    totalDistance: '약 5km',
    difficulty: 'easy',
  },
  {
    name: '안산 갈대습지 생태 투어',
    description: '안산 시화호 일대의 습지와 수자원을 탐방하는 코스',
    region: '안산시',
    spots: ecoSpots.filter(s => s.region === '안산시' && s.category === 'water').map(s => s.id).slice(0, 5),
    thumbnail: '🌊',
    duration: '2-3시간',
    totalDistance: '약 6km',
    difficulty: 'easy',
  },
]
