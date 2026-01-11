/**
 * 경기기후플랫폼 API 서비스
 * 생태계서비스 점수, 비오톱, 탄소흡수량 등 환경 데이터 제공
 */

const CLIMATE_API = {
  BASE_URL: 'https://climate.gg.go.kr/ols/api/geoserver/wfs',
  API_KEY: import.meta.env.VITE_CLIMATE_API_KEY || '4c58df36-82b2-40b2-b360-6450cca44b1e',
}

// 캐시 저장소 (메모리)
const cache = {
  ecosystemService: null,
  ecosystemServiceByRegion: {},
  lastFetch: null,
}

// 캐시 유효 시간 (1시간)
const CACHE_TTL = 60 * 60 * 1000

/**
 * WFS API 호출 헬퍼
 */
const fetchWFS = async (typeName, options = {}) => {
  const { maxFeatures = 1000, propertyName = '' } = options

  const params = new URLSearchParams({
    apiKey: CLIMATE_API.API_KEY,
    service: 'WFS',
    version: '1.1.0',
    request: 'GetFeature',
    typeName,
    outputFormat: 'application/json',
  })

  if (maxFeatures) params.append('maxFeatures', maxFeatures)
  if (propertyName) params.append('propertyName', propertyName)

  try {
    const url = `${CLIMATE_API.BASE_URL}?${params.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Climate API fetch failed for ${typeName}:`, error)
    return null
  }
}

/**
 * 생태계서비스 점수 전체 조회 (747개 지역)
 */
export const fetchEcosystemServiceScores = async () => {
  // 캐시 확인
  if (cache.ecosystemService && cache.lastFetch && (Date.now() - cache.lastFetch < CACHE_TTL)) {
    return cache.ecosystemService
  }

  const data = await fetchWFS('spggcee:ecosys_srvc_scr', {
    maxFeatures: 1000,
    propertyName: 'stdg_nm,sgg_nm,sigun_nm,cbn_strg_scr,wtqy_purn_scr,air_ajst_scr,scvl_scr,cult_srvc_scr,bird_dvsty_scr,ecosys_srvc_scr',
  })

  if (data?.features && Array.isArray(data.features)) {
    cache.ecosystemService = data.features.map(f => {
      const props = f.properties || {}
      return {
        id: f.id || null,
        region: props.sgg_nm || props.sigun_nm || '알 수 없음',
        district: props.stdg_nm || '',
        scores: {
          carbon: Number(props.cbn_strg_scr) || 0,        // 탄소저장
          water: Number(props.wtqy_purn_scr) || 0,        // 수질정화
          air: Number(props.air_ajst_scr) || 0,           // 대기조절
          landscape: Number(props.scvl_scr) || 0,         // 경관
          culture: Number(props.cult_srvc_scr) || 0,      // 문화서비스
          biodiversity: Number(props.bird_dvsty_scr) || 0, // 생물다양성
          total: Number(props.ecosys_srvc_scr) || 0,      // 종합 (38~63)
        },
      }
    })
    cache.lastFetch = Date.now()
  }

  return cache.ecosystemService || []
}

/**
 * 지역별 생태계서비스 점수 조회
 */
export const getEcosystemScoreByRegion = async (regionName) => {
  // 캐시 확인
  if (cache.ecosystemServiceByRegion[regionName]) {
    return cache.ecosystemServiceByRegion[regionName]
  }

  const allScores = await fetchEcosystemServiceScores()

  // 지역명 매칭 (수원시, 성남시 등)
  // 1. 정확한 매칭 먼저 시도
  let regionScores = allScores.filter(s => s.region === regionName)

  // 2. 부분 매칭 시도 (정확한 매칭 없을 때)
  if (regionScores.length === 0) {
    regionScores = allScores.filter(s =>
      s.region?.includes(regionName) || regionName?.includes(s.region)
    )
  }

  if (regionScores.length === 0) {
    console.warn(`[ClimateAPI] No data found for region: ${regionName}`)
    return null
  }

  // 평균 계산
  const avgScores = {
    region: regionName,
    sampleCount: regionScores.length,
    scores: {
      carbon: Math.round(regionScores.reduce((sum, s) => sum + (s.scores.carbon || 0), 0) / regionScores.length),
      water: Math.round(regionScores.reduce((sum, s) => sum + (s.scores.water || 0), 0) / regionScores.length),
      air: Math.round(regionScores.reduce((sum, s) => sum + (s.scores.air || 0), 0) / regionScores.length),
      landscape: Math.round(regionScores.reduce((sum, s) => sum + (s.scores.landscape || 0), 0) / regionScores.length),
      culture: Math.round(regionScores.reduce((sum, s) => sum + (s.scores.culture || 0), 0) / regionScores.length),
      biodiversity: Math.round(regionScores.reduce((sum, s) => sum + (s.scores.biodiversity || 0), 0) / regionScores.length),
      total: Math.round(regionScores.reduce((sum, s) => sum + (s.scores.total || 0), 0) / regionScores.length),
    },
  }

  cache.ecosystemServiceByRegion[regionName] = avgScores
  return avgScores
}

/**
 * 좌표 기반 근처 생태계서비스 점수 조회
 */
export const getEcosystemScoreByLocation = async (lat, lng, regionName) => {
  // 일단 지역명 기반으로 조회 (좌표 기반은 추후 개선)
  if (regionName) {
    return getEcosystemScoreByRegion(regionName)
  }
  return null
}

/**
 * 경기도 전체 평균 점수
 */
export const getGyeonggiAverageScore = async () => {
  const allScores = await fetchEcosystemServiceScores()

  if (allScores.length === 0) {
    return {
      carbon: 50, water: 50, air: 50, landscape: 50,
      culture: 50, biodiversity: 50, total: 50,
    }
  }

  return {
    carbon: Math.round(allScores.reduce((sum, s) => sum + (s.scores.carbon || 0), 0) / allScores.length),
    water: Math.round(allScores.reduce((sum, s) => sum + (s.scores.water || 0), 0) / allScores.length),
    air: Math.round(allScores.reduce((sum, s) => sum + (s.scores.air || 0), 0) / allScores.length),
    landscape: Math.round(allScores.reduce((sum, s) => sum + (s.scores.landscape || 0), 0) / allScores.length),
    culture: Math.round(allScores.reduce((sum, s) => sum + (s.scores.culture || 0), 0) / allScores.length),
    biodiversity: Math.round(allScores.reduce((sum, s) => sum + (s.scores.biodiversity || 0), 0) / allScores.length),
    total: Math.round(allScores.reduce((sum, s) => sum + (s.scores.total || 0), 0) / allScores.length),
  }
}

/**
 * 점수 레벨 및 설명 반환
 */
export const getScoreLevel = (score) => {
  if (score >= 60) return { level: '최우수', emoji: '🌟', color: '#00FF94' }
  if (score >= 55) return { level: '우수', emoji: '⭐', color: '#00D4FF' }
  if (score >= 50) return { level: '양호', emoji: '✅', color: '#FFB800' }
  if (score >= 45) return { level: '보통', emoji: '📊', color: '#FF6B9D' }
  return { level: '관리필요', emoji: '⚠️', color: '#FF2A6D' }
}

/**
 * 점수 항목별 설명
 */
export const SCORE_DESCRIPTIONS = {
  carbon: { label: '탄소저장', emoji: '🌳', description: '산림의 탄소 저장 능력' },
  water: { label: '수질정화', emoji: '💧', description: '수계의 정화 능력' },
  air: { label: '대기조절', emoji: '💨', description: '대기질 조절 능력' },
  landscape: { label: '경관', emoji: '🏞️', description: '자연경관 가치' },
  culture: { label: '문화서비스', emoji: '🏛️', description: '문화적 가치' },
  biodiversity: { label: '생물다양성', emoji: '🦋', description: '생태계 다양성' },
  total: { label: '종합점수', emoji: '📊', description: '생태계서비스 종합 평가' },
}

export default {
  fetchEcosystemServiceScores,
  getEcosystemScoreByRegion,
  getEcosystemScoreByLocation,
  getGyeonggiAverageScore,
  getScoreLevel,
  SCORE_DESCRIPTIONS,
}
