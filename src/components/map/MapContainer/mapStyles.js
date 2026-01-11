// Re:Earth 맞춤 지도 스타일
// 불필요한 요소(지하철, POI, 비즈니스 등)를 숨기고 깔끔한 뷰 제공

// 공통: 불필요한 요소 숨기기
const hideUnnecessaryElements = [
  // 전체 POI (관심 지점) 숨기기
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  // 공원만 geometry는 표시 (Re:Earth 컨셉)
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
  // 대중교통 전체 숨기기 (지하철, 버스 노선 등)
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  // 도로 아이콘 숨기기
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
]

// 다크 모드 스타일 (메타버스/사이버펑크)
export const darkMapStyle = [
  ...hideUnnecessaryElements,
  // 배경 색상
  {
    elementType: 'geometry',
    stylers: [{ color: '#0B101A' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0B101A' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5a6a7a' }],
  },
  // 행정구역 (시/군/구) 라벨 - 네온 그린
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00FF94' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a8a6a' }],
  },
  // 공원/자연 - 어두운 녹색
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0d2818' }],
  },
  // 도로 스타일
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a2634' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d1821' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6a7a8a' }],
  },
  // 고속도로
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1f3a2f' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f1f17' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00CC76' }],
  },
  // 물 (강, 호수)
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0a1929' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00D4FF' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0B101A' }],
  },
  // 건물/인공 구조물
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#151C28' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#00FF9440' }, { weight: 0.3 }],
  },
  // 자연 지형
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#0f1a14' }],
  },
]

// 라이트 모드 스타일
export const lightMapStyle = [
  ...hideUnnecessaryElements,
  // 공원 강조
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#c8e6c9' }],
  },
  // 물 강조
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#b3e5fc' }],
  },
  // 행정구역 라벨
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00AA66' }],
  },
]
