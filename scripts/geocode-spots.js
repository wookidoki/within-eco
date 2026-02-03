#!/usr/bin/env node
/**
 * 역지오코딩 스크립트: 좌표 → 동/읍/면 주소 추출
 * all_spots.json의 일반명 스팟에 neighborhood 필드를 추가
 *
 * 사용법: GOOGLE_MAPS_API_KEY=xxx node scripts/geocode-spots.js
 * EC2에서 실행: node scripts/geocode-spots.js (자동으로 .env에서 키 로드)
 */

const fs = require('fs')
const path = require('path')

// .env에서 API 키 로드 (dotenv 없이 직접 파싱)
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) process.env[match[1].trim()] = match[2].trim()
    }
  } catch (e) { /* .env 없으면 환경변수 사용 */ }
}

loadEnv()

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY 또는 VITE_GOOGLE_MAPS_API_KEY 필요')
  process.exit(1)
}

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'spots', 'all_spots.json')

// 일반명 목록
const GENERIC_NAMES = new Set([
  '문화체육시설', '문화시설', '근린 및 주제공원', '체육시설',
  '공공시설', '공공휴양녹지', '습지', '완충녹지', '경관녹지',
  '공공청사', '생태보호구역', '벼논 습지', '벼논 습지 보호지역',
  '다른 나 녹지공간', '다른언어 나 숲속공간',
])

// rate limiter: 최대 40 QPS
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// 역지오코딩 API 호출
async function reverseGeocode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ko&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK' || !data.results?.length) return null

  const components = data.results[0].address_components || []

  // 가장 구체적인 주소 추출 (동/읍/면 > 구/군 > 시)
  let neighborhood = null  // 동/읍/면
  let sublocality = null    // 구/군
  let locality = null        // 시
  let fullAddress = data.results[0].formatted_address || ''

  for (const c of components) {
    const types = c.types || []
    if (types.includes('sublocality_level_2') || types.includes('administrative_area_level_4')) {
      neighborhood = c.long_name
    }
    if (types.includes('sublocality_level_1') || types.includes('administrative_area_level_3')) {
      sublocality = c.long_name
    }
    if (types.includes('locality') || types.includes('administrative_area_level_2')) {
      locality = c.long_name
    }
  }

  return {
    neighborhood: neighborhood || sublocality || null,
    sublocality: sublocality || null,
    locality: locality || null,
    address: fullAddress,
  }
}

async function main() {
  console.log('=== 역지오코딩 시작 ===')
  console.log(`JSON: ${JSON_PATH}`)

  const raw = fs.readFileSync(JSON_PATH, 'utf-8')
  const data = JSON.parse(raw)
  const spots = data.spots || data

  // 역지오코딩 대상 필터링: 일반명 + neighborhood 없는 스팟
  const targets = spots.filter(s =>
    GENERIC_NAMES.has(s.name) && !s.neighborhood && s.location?.lat && s.location?.lng
  )

  console.log(`전체: ${spots.length}개 | 대상: ${targets.length}개`)

  let success = 0
  let fail = 0
  let skipped = 0
  const BATCH_SIZE = 40  // 40 QPS

  for (let i = 0; i < targets.length; i++) {
    const spot = targets[i]

    try {
      const result = await reverseGeocode(spot.location.lat, spot.location.lng)

      if (result?.neighborhood) {
        spot.neighborhood = result.neighborhood
        spot.address = result.address
        success++
      } else if (result?.locality) {
        // 동/읍/면이 없으면 시/군 이름이라도 저장
        spot.neighborhood = result.sublocality || null
        spot.address = result.address
        success++
      } else {
        fail++
      }
    } catch (err) {
      console.error(`  Error [${spot.id}]: ${err.message}`)
      fail++
    }

    // 진행률 출력
    if ((i + 1) % 100 === 0) {
      console.log(`  진행: ${i + 1}/${targets.length} (성공: ${success}, 실패: ${fail})`)
    }

    // rate limit: 40개마다 1.1초 대기
    if ((i + 1) % BATCH_SIZE === 0) {
      await sleep(1100)
    }
  }

  console.log(`\n=== 완료 ===`)
  console.log(`성공: ${success} | 실패: ${fail} | 전체 대상: ${targets.length}`)

  // JSON 저장
  const output = Array.isArray(data) ? spots : { ...data, spots }
  fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`저장 완료: ${JSON_PATH}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
