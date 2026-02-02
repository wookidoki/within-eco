import allSpotsData from './spots/all_spots.json'

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

// district -> region 매핑, 누락 필드 기본값 추가
export const ecoSpots = allSpotsData.spots.map(spot => ({
  ...spot,
  region: spot.region || spot.district || '',
  address: spot.address || '',
  mission: spot.mission || { reward: Math.max(10, Math.round((spot.scores?.total || 30) * 0.8)), description: `${spot.name} 방문하기` },
  ecoScores: spot.ecoScores || { total_score: spot.scores?.total || 0 },
  thumbnail: spot.thumbnail || CATEGORIES[spot.category]?.emoji || '📍',
  bestSeason: spot.bestSeason || ['ALL'],
}))

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
