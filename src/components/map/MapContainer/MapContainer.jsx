import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { APIProvider, Map, Marker, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import { useThemeStore, useGameStore } from '../../../stores'
import { ecoSpots, CATEGORIES } from '../../../data/spots'
import Spinner from '../../common/Spinner'
import logger from '../../../utils/logger'
import {
  MapWrapper,
  InfoWindowContent,
  InfoHeader,
  InfoThumbnail,
  InfoTitle,
  InfoCategory,
  InfoDistrict,
  EcoScoreGrid,
  EcoScoreItem,
  EcoScoreValue,
  EcoScoreLabel,
  EcoBar,
  EcoBarFill,
  InfoSummary,
  InfoButton,
} from './MapContainer.styles'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID

// 경기도 중심
const INITIAL_CENTER = {
  lat: 37.4,
  lng: 127.1,
}

// 카메라 설정
const CAMERA_CONFIG = {
  zoom: 10,
  tilt: 45,
  heading: -10,
  minZoom: 8,
  maxZoom: 18,
}

// 경기도 영역 제한
const GYEONGGI_BOUNDS = {
  north: 38.3,
  south: 36.8,
  east: 127.9,
  west: 126.3,
}

// 줌 레벨에 따른 최대 마커 수
const getMaxMarkersByZoom = (zoom) => {
  if (zoom >= 14) return 800
  if (zoom >= 12) return 400
  if (zoom >= 10) return 200
  return 80
}

// SVG 마커 아이콘 생성
function buildMarkerSvg(emoji, color, strokeColor, opacity, radius) {
  const size = radius * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle cx="${radius}" cy="${radius}" r="${radius - 2}" fill="${color}" fill-opacity="${opacity}" stroke="${strokeColor}" stroke-width="2.5"/>` +
    `<text x="${radius}" y="${radius + 1}" text-anchor="middle" dominant-baseline="middle" font-size="${radius * 0.9}">${emoji}</text>` +
    `</svg>`
}

function buildClusterSvg(emoji, color, count, radius) {
  const w = radius * 2 + 14
  const h = radius * 2 + 4
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<circle cx="${radius}" cy="${radius + 2}" r="${radius - 1}" fill="${color}" fill-opacity="0.85" stroke="white" stroke-width="2"/>` +
    `<text x="${radius}" y="${radius + 3}" text-anchor="middle" dominant-baseline="middle" font-size="${radius * 0.8}">${emoji}</text>` +
    `<circle cx="${radius * 2 + 4}" cy="9" r="9" fill="#FF3B30" stroke="white" stroke-width="1.5"/>` +
    `<text x="${radius * 2 + 4}" y="10" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="bold" fill="white">${count > 99 ? '99+' : count}</text>` +
    `</svg>`
}

// 현위치 마커 컴포넌트
const CurrentLocationPin = ({ position }) => {
  if (!position) return null

  return (
    <Marker
      position={position}
      icon={{
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">` +
          `<circle cx="12" cy="12" r="8" fill="#4285F4" fill-opacity="0.3" stroke="#4285F4" stroke-width="2"/>` +
          `<circle cx="12" cy="12" r="5" fill="#4285F4"/>` +
          `</svg>`
        ),
        scaledSize: { width: 24, height: 24 },
        anchor: { x: 12, y: 12 },
      }}
      zIndex={999}
    />
  )
}

// 스팟 마커 컴포넌트
const SpotMarkers = ({ currentLocation }) => {
  const map = useMap()
  const [activeMarker, setActiveMarker] = useState(null)
  const [visibleSpots, setVisibleSpots] = useState([])
  const zoomRef = useRef(CAMERA_CONFIG.zoom)
  const {
    openSpotDetail,
    getFilteredSpots,
    isSpotUnlocked,
    closeSpotDetail,
    navigateToSpot,
    clearNavigateToSpot,
    activeCategory,
    activeRegion,
  } = useGameStore()

  // 검색 결과 스팟으로 이동
  useEffect(() => {
    if (!map || !navigateToSpot) return

    const location = navigateToSpot.location
    if (location?.lat && location?.lng) {
      map.panTo(location)
      map.setZoom(15)
      setActiveMarker(navigateToSpot.id)
      clearNavigateToSpot()
    }
  }, [map, navigateToSpot, clearNavigateToSpot])

  // 필터된 스팟을 useMemo로 캐싱
  const filteredSpots = useMemo(() => {
    return getFilteredSpots()
  }, [activeCategory, activeRegion])

  // 뷰포트 내 마커만 필터링
  useEffect(() => {
    if (!map) return

    const updateVisibleSpots = () => {
      const bounds = map.getBounds()
      const currentZoom = map.getZoom()
      zoomRef.current = currentZoom

      if (!bounds) {
        setVisibleSpots(filteredSpots.slice(0, 100))
        return
      }

      const inBounds = filteredSpots.filter(spot => {
        const lat = spot.location?.lat
        const lng = spot.location?.lng
        if (!lat || !lng) return false
        return bounds.contains({ lat, lng })
      })

      const maxMarkers = getMaxMarkersByZoom(currentZoom)

      const sorted = [...inBounds].sort((a, b) => {
        if (a.priority && !b.priority) return -1
        if (!a.priority && b.priority) return 1
        return (b.scores?.total || 0) - (a.scores?.total || 0)
      })

      setVisibleSpots(sorted.slice(0, maxMarkers))
    }

    updateVisibleSpots()

    const boundsListener = map.addListener('bounds_changed', updateVisibleSpots)
    const zoomListener = map.addListener('zoom_changed', updateVisibleSpots)

    return () => {
      google.maps.event.removeListener(boundsListener)
      google.maps.event.removeListener(zoomListener)
    }
  }, [map, filteredSpots])

  // 지도 클릭 시 선택 해제
  useEffect(() => {
    if (!map) return

    const handleMapClick = () => {
      setActiveMarker(null)
      closeSpotDetail()
    }

    map.addListener('click', handleMapClick)

    return () => {
      google.maps.event.clearListeners(map, 'click')
    }
  }, [map, closeSpotDetail])

  const handleMarkerClick = (spot) => {
    setActiveMarker(spot.id)
  }

  const handleNavigateToSpot = (spot) => {
    if (map) {
      map.panTo(spot.location)
      map.setZoom(15)
    }
  }

  // 줌 레벨에 따른 마커 크기
  const getMarkerRadius = () => {
    if (zoomRef.current >= 14) return 18
    if (zoomRef.current >= 11) return 14
    return 11
  }

  // 마커 아이콘 캐시 (useMemo로 rebuild 방지)
  const markerIcons = useMemo(() => {
    const radius = getMarkerRadius()
    const icons = {}
    for (const spot of visibleSpots) {
      const category = CATEGORIES[spot.category]
      const isUnlocked = isSpotUnlocked(spot.id)
      const emoji = category?.emoji || '📍'
      const color = category?.color || '#00FF94'
      const strokeColor = isUnlocked ? '#FFD700' : '#FFFFFF'
      const opacity = isUnlocked ? 1 : 0.7
      const count = spot.clusterCount || 0

      let svg
      if (count > 0) {
        svg = buildClusterSvg(emoji, color, count + 1, radius)
      } else {
        svg = buildMarkerSvg(emoji, color, strokeColor, opacity, radius)
      }

      const w = count > 0 ? radius * 2 + 14 : radius * 2
      const h = count > 0 ? radius * 2 + 4 : radius * 2

      icons[spot.id] = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: { width: w, height: h },
        anchor: { x: radius, y: count > 0 ? radius + 2 : radius },
      }
    }
    return icons
  }, [visibleSpots, zoomRef.current])

  return (
    <>
      {visibleSpots.map((spot) => (
        <Marker
          key={spot.id}
          position={spot.location}
          onClick={() => handleMarkerClick(spot)}
          icon={markerIcons[spot.id]}
        />
      ))}

      {/* InfoWindow - 생태 정보 팝업 */}
      {activeMarker && (
        <InfoWindow
          position={visibleSpots.find(s => s.id === activeMarker)?.location}
          onCloseClick={() => setActiveMarker(null)}
        >
          <InfoWindowContent>
            {(() => {
              const spot = visibleSpots.find(s => s.id === activeMarker)
              if (!spot) return null

              const category = CATEGORIES[spot?.category]
              const eco = spot?.ecoScores || {}

              const getScoreColor = (score) => {
                if (score >= 70) return '#00FF94'
                if (score >= 40) return '#FFD700'
                return '#FF6B6B'
              }

              const getSummary = () => {
                const total = eco.total_score || 0
                const uniqueness = eco.uniqueness || 0

                if (total >= 50 && uniqueness >= 70) {
                  return `이 지역은 높은 생태적 고유성과 보전 가치를 가진 주요 생태공간입니다.`
                }
                if (total >= 30) {
                  return `이 지역은 도시 생태계 보전과 시민 여가에 기여하는 공간입니다.`
                }
                return `이 지역은 생태계 서비스를 제공하는 도시 녹지공간입니다.`
              }

              return (
                <>
                  <InfoHeader>
                    <InfoThumbnail $color={category?.color}>
                      {category?.emoji || '🌿'}
                    </InfoThumbnail>
                    <div>
                      <InfoTitle>
                        {spot?.displayName || spot?.name}
                        {spot?.clusterCount > 0 && (
                          <span style={{ fontSize: '11px', color: '#00FF94', marginLeft: '6px' }}>
                            외 {spot.clusterCount}개
                          </span>
                        )}
                      </InfoTitle>
                      <InfoCategory>{spot?.type || category?.label}</InfoCategory>
                      <InfoDistrict>
                        📍 {spot?.district || spot?.region || '경기도'}
                      </InfoDistrict>
                    </div>
                  </InfoHeader>

                  <EcoScoreGrid>
                    <EcoScoreItem>
                      <EcoScoreValue $color={getScoreColor(eco.area || 0)}>
                        {(eco.area || 0).toFixed(0)}
                      </EcoScoreValue>
                      <EcoScoreLabel>📐 면적 규모</EcoScoreLabel>
                      <EcoBar>
                        <EcoBarFill $value={eco.area || 0} $color={getScoreColor(eco.area || 0)} />
                      </EcoBar>
                    </EcoScoreItem>
                    <EcoScoreItem>
                      <EcoScoreValue $color={getScoreColor(eco.accessibility || 0)}>
                        {(eco.accessibility || 0).toFixed(0)}
                      </EcoScoreValue>
                      <EcoScoreLabel>🚶 접근성</EcoScoreLabel>
                      <EcoBar>
                        <EcoBarFill $value={eco.accessibility || 0} $color={getScoreColor(eco.accessibility || 0)} />
                      </EcoBar>
                    </EcoScoreItem>
                    <EcoScoreItem>
                      <EcoScoreValue $color={getScoreColor(eco.uniqueness || 0)}>
                        {(eco.uniqueness || 0).toFixed(0)}
                      </EcoScoreValue>
                      <EcoScoreLabel>💎 고유성</EcoScoreLabel>
                      <EcoBar>
                        <EcoBarFill $value={eco.uniqueness || 0} $color={getScoreColor(eco.uniqueness || 0)} />
                      </EcoBar>
                    </EcoScoreItem>
                    <EcoScoreItem>
                      <EcoScoreValue $color={getScoreColor(eco.total_score || 0)}>
                        {(eco.total_score || 0).toFixed(0)}
                      </EcoScoreValue>
                      <EcoScoreLabel>⭐ 종합 점수</EcoScoreLabel>
                      <EcoBar>
                        <EcoBarFill $value={eco.total_score || 0} $color={getScoreColor(eco.total_score || 0)} />
                      </EcoBar>
                    </EcoScoreItem>
                  </EcoScoreGrid>

                  <InfoSummary>
                    {getSummary()}
                  </InfoSummary>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <InfoButton
                      onClick={() => handleNavigateToSpot(spot)}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      📍 이동
                    </InfoButton>
                    <InfoButton onClick={() => openSpotDetail(spot)} style={{ flex: 2 }}>
                      🔍 자세히 보기
                    </InfoButton>
                  </div>
                </>
              )
            })()}
          </InfoWindowContent>
        </InfoWindow>
      )}
    </>
  )
}

const MapContainer = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const { isDarkMode } = useThemeStore()
  const setStoreLocation = useGameStore((state) => state.setCurrentLocation)

  // 현위치 가져오기
  useEffect(() => {
    const getLocation = () => {
      if (!('geolocation' in navigator)) {
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          const isInGyeonggi =
            location.lat >= GYEONGGI_BOUNDS.south &&
            location.lat <= GYEONGGI_BOUNDS.north &&
            location.lng >= GYEONGGI_BOUNDS.west &&
            location.lng <= GYEONGGI_BOUNDS.east

          if (!isInGyeonggi) {
            logger.warning('현재 위치는 서비스 지역(경기도)이 아닙니다. 지도에서 경기도 지역을 탐색해보세요!', null, true)
          }

          setCurrentLocation(location)
          setStoreLocation(location)
        },
        () => {
          // 위치 권한 거부 시 조용히 처리 (지도는 경기도 중심으로 보여줌)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }

    getLocation()
  }, [])

  const handleTilesLoaded = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <MapWrapper $isDarkMode={isDarkMode}>
      {isLoading && <Spinner />}
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={INITIAL_CENTER}
          defaultZoom={CAMERA_CONFIG.zoom}
          defaultTilt={CAMERA_CONFIG.tilt}
          defaultHeading={CAMERA_CONFIG.heading}
          minZoom={CAMERA_CONFIG.minZoom}
          maxZoom={CAMERA_CONFIG.maxZoom}
          mapId={GOOGLE_MAPS_MAP_ID}
          restriction={{
            latLngBounds: GYEONGGI_BOUNDS,
            strictBounds: false,
          }}
          disableDefaultUI={true}
          mapTypeId="roadmap"
          gestureHandling="greedy"
          onTilesLoaded={handleTilesLoaded}
          style={{ width: '100%', height: '100%' }}
          clickableIcons={false}
        >
          <SpotMarkers currentLocation={currentLocation} />
          <CurrentLocationPin position={currentLocation} />
        </Map>
      </APIProvider>
    </MapWrapper>
  )
}

export default MapContainer
