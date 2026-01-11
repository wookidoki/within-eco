/**
 * 실시간 대기질 API 서비스
 * 한국환경공단 에어코리아 데이터 기반
 */

// 에어코리아 API (공공데이터포털)
const AIR_KOREA_API = {
  BASE_URL: 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc',
  // 공공데이터포털 인증키 (환경변수에서 로드)
  SERVICE_KEY: import.meta.env.VITE_AIR_KOREA_API_KEY || '',
}

// 경기도 측정소 목록 (주요 시군)
const GYEONGGI_STATIONS = {
  '수원시': '인계동',
  '성남시': '신흥동',
  '용인시': '신갈동',
  '화성시': '병점동',
  '고양시': '마두동',
  '안산시': '고잔동',
  '남양주시': '호평동',
  '안양시': '안양동',
  '평택시': '비전동',
  '시흥시': '대야동',
  '파주시': '금촌동',
  '김포시': '사우동',
  '광주시': '경안동',
  '광명시': '철산동',
  '군포시': '산본동',
  '하남시': '신장동',
  '의정부시': '의정부동',
  '부천시': '중동',
  '안성시': '봉산동',
  '이천시': '창전동',
}

// 대기질 등급 정의
const AQI_GRADES = {
  1: { level: '좋음', emoji: '😊', color: '#00FF94', message: '야외 활동 최적!' },
  2: { level: '보통', emoji: '🙂', color: '#00D4FF', message: '야외 활동 가능' },
  3: { level: '나쁨', emoji: '😷', color: '#FFB800', message: '민감군 주의' },
  4: { level: '매우나쁨', emoji: '🚫', color: '#FF2A6D', message: '야외 활동 자제' },
}

// 캐시 저장소
const cache = {
  airQuality: {},
  lastFetch: {},
}

// 캐시 유효 시간 (30분)
const CACHE_TTL = 30 * 60 * 1000

/**
 * 시뮬레이션 데이터 생성 (API 키 없을 때 사용)
 */
const generateSimulatedData = (regionName) => {
  // 시간대별 변화 시뮬레이션
  const hour = new Date().getHours()
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
  const isNight = hour >= 22 || hour <= 5

  // 기본 값 (지역별 약간의 차이)
  const regionSeed = regionName.charCodeAt(0) % 10
  const basePm25 = isRushHour ? 35 : isNight ? 15 : 25
  const basePm10 = basePm25 * 1.5

  const pm25 = Math.round(basePm25 + regionSeed + Math.random() * 10)
  const pm10 = Math.round(basePm10 + regionSeed + Math.random() * 15)
  const o3 = (0.03 + Math.random() * 0.03).toFixed(3)
  const no2 = (0.02 + Math.random() * 0.02).toFixed(3)

  // 등급 계산 (PM2.5 기준)
  let grade = 1
  if (pm25 > 75) grade = 4
  else if (pm25 > 35) grade = 3
  else if (pm25 > 15) grade = 2

  return {
    region: regionName,
    station: GYEONGGI_STATIONS[regionName] || '측정소',
    dataTime: new Date().toLocaleString('ko-KR'),
    pm25: { value: pm25, unit: 'μg/m³', grade },
    pm10: { value: pm10, unit: 'μg/m³', grade: pm10 > 80 ? 3 : pm10 > 30 ? 2 : 1 },
    o3: { value: parseFloat(o3), unit: 'ppm', grade: parseFloat(o3) > 0.09 ? 3 : 1 },
    no2: { value: parseFloat(no2), unit: 'ppm', grade: 1 },
    khaiGrade: grade,
    khaiValue: Math.round(pm25 * 2 + Math.random() * 20),
    isSimulated: true,
  }
}

/**
 * 실제 에어코리아 API 호출
 */
const fetchRealAirQuality = async (stationName) => {
  const params = new URLSearchParams({
    serviceKey: AIR_KOREA_API.SERVICE_KEY,
    returnType: 'json',
    numOfRows: '1',
    pageNo: '1',
    stationName: stationName,
    dataTerm: 'DAILY',
    ver: '1.0',
  })

  const url = `${AIR_KOREA_API.BASE_URL}/getMsrstnAcctoRltmMesureDnsty?${params.toString()}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  const result = await response.json()

  if (result.response?.header?.resultCode !== '00') {
    throw new Error(result.response?.header?.resultMsg || 'API Error')
  }

  const item = result.response?.body?.items?.[0]
  if (!item) {
    throw new Error('No data available')
  }

  return item
}

/**
 * 지역별 실시간 대기질 조회
 */
export const getAirQuality = async (regionName) => {
  // 캐시 확인
  const cacheKey = regionName
  if (cache.airQuality[cacheKey] && cache.lastFetch[cacheKey] &&
      (Date.now() - cache.lastFetch[cacheKey] < CACHE_TTL)) {
    return cache.airQuality[cacheKey]
  }

  // API 키가 없으면 시뮬레이션 데이터 사용
  if (!AIR_KOREA_API.SERVICE_KEY) {
    console.warn('[AirQuality] API key not set, using simulated data')
    const data = generateSimulatedData(regionName)
    cache.airQuality[cacheKey] = data
    cache.lastFetch[cacheKey] = Date.now()
    return data
  }

  // 실제 API 호출 시도
  try {
    const stationName = GYEONGGI_STATIONS[regionName]
    if (!stationName) {
      console.warn(`[AirQuality] No station for region: ${regionName}`)
      return generateSimulatedData(regionName)
    }

    const item = await fetchRealAirQuality(stationName)

    // API 응답을 내부 형식으로 변환
    const pm25Value = parseInt(item.pm25Value) || 0
    const pm10Value = parseInt(item.pm10Value) || 0
    const pm25Grade = parseInt(item.pm25Grade) || 2
    const pm10Grade = parseInt(item.pm10Grade) || 2

    const data = {
      region: regionName,
      station: stationName,
      dataTime: item.dataTime,
      pm25: { value: pm25Value, unit: 'μg/m³', grade: pm25Grade },
      pm10: { value: pm10Value, unit: 'μg/m³', grade: pm10Grade },
      o3: { value: parseFloat(item.o3Value) || 0, unit: 'ppm', grade: parseInt(item.o3Grade) || 1 },
      no2: { value: parseFloat(item.no2Value) || 0, unit: 'ppm', grade: parseInt(item.no2Grade) || 1 },
      co: { value: parseFloat(item.coValue) || 0, unit: 'ppm', grade: parseInt(item.coGrade) || 1 },
      so2: { value: parseFloat(item.so2Value) || 0, unit: 'ppm', grade: parseInt(item.so2Grade) || 1 },
      khaiGrade: parseInt(item.khaiGrade) || 2,
      khaiValue: parseInt(item.khaiValue) || 0,
      isSimulated: false,
    }

    cache.airQuality[cacheKey] = data
    cache.lastFetch[cacheKey] = Date.now()

    console.log(`[AirQuality] Real data loaded for ${regionName}:`, data.pm25.value)
    return data
  } catch (error) {
    console.error('[AirQuality] API error, using simulated data:', error.message)
    const data = generateSimulatedData(regionName)
    cache.airQuality[cacheKey] = data
    cache.lastFetch[cacheKey] = Date.now()
    return data
  }
}

/**
 * 대기질 등급 정보 반환
 */
export const getAirQualityGrade = (grade) => {
  return AQI_GRADES[grade] || AQI_GRADES[2]
}

/**
 * 방문 추천도 계산
 */
export const getVisitRecommendation = (airQuality) => {
  if (!airQuality) {
    return { score: 70, message: '대기질 정보 확인 중...', emoji: '🔍' }
  }

  const pm25Grade = airQuality.pm25?.grade || 2
  const gradeInfo = getAirQualityGrade(pm25Grade)

  const recommendations = {
    1: { score: 100, message: '지금 방문하면 최고의 경험!', emoji: '🌟' },
    2: { score: 80, message: '방문하기 좋은 시간입니다', emoji: '👍' },
    3: { score: 50, message: '마스크 착용을 권장합니다', emoji: '😷' },
    4: { score: 20, message: '실내 활동을 권장합니다', emoji: '🏠' },
  }

  return {
    ...recommendations[pm25Grade],
    gradeInfo,
    airQuality,
  }
}

/**
 * 현재 시간대 기반 방문 적합성
 */
export const getTimeBasedRecommendation = () => {
  const hour = new Date().getHours()

  if (hour >= 6 && hour <= 9) {
    return { time: '아침', emoji: '🌅', message: '상쾌한 아침 산책 시간!' }
  }
  if (hour >= 10 && hour <= 16) {
    return { time: '낮', emoji: '☀️', message: '야외 활동 최적 시간' }
  }
  if (hour >= 17 && hour <= 19) {
    return { time: '저녁', emoji: '🌇', message: '일몰 감상하기 좋은 시간' }
  }
  if (hour >= 20 && hour <= 22) {
    return { time: '밤', emoji: '🌙', message: '야간 산책 시간' }
  }
  return { time: '심야', emoji: '🌃', message: '내일 방문을 추천합니다' }
}

/**
 * 종합 방문 점수 계산
 */
export const getOverallVisitScore = async (regionName) => {
  const airQuality = await getAirQuality(regionName)
  const visitRec = getVisitRecommendation(airQuality)
  const timeRec = getTimeBasedRecommendation()

  // 종합 점수 (대기질 70%, 시간 30%)
  const airScore = visitRec.score
  const timeScore = ['아침', '낮', '저녁'].includes(timeRec.time) ? 100 : 60

  const overallScore = Math.round(airScore * 0.7 + timeScore * 0.3)

  return {
    score: overallScore,
    airQuality: visitRec,
    timeRecommendation: timeRec,
    summary: overallScore >= 80
      ? '지금 방문 추천!'
      : overallScore >= 60
        ? '방문 가능'
        : '다른 시간 권장',
    emoji: overallScore >= 80 ? '🌟' : overallScore >= 60 ? '👍' : '⏰',
  }
}

export default {
  getAirQuality,
  getAirQualityGrade,
  getVisitRecommendation,
  getTimeBasedRecommendation,
  getOverallVisitScore,
  AQI_GRADES,
}
