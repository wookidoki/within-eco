import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { useThemeStore, useGameStore } from '../../../stores'
import { ecoSpots, CATEGORIES } from '../../../data/spots'
import Spinner from '../../common/Spinner'
import logger from '../../../utils/logger'
import {
  MapWrapper,
  MarkerDot,
  MarkerPulse,
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
  CurrentLocationMarker,
  ClusterMarker
} from './MapContainer.styles'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID

// 경기도 중심
const INITIAL_CENTER = {
  lat: 37.4,
  lng: 127.1,
}

// 3D 메타버스 뷰 설정
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
  if (zoom >= 14) return 500
  if (zoom >= 12) return 200
  if (zoom >= 10) return 100
  return 50
}

// 현위치 마커 컴포넌트
const CurrentLocationPin = ({ position }) => {
  if (!position) return null

  return (
    <AdvancedMarker position={position}>
      <CurrentLocationMarker>
        <div className="pulse" />
        <div className="dot" />
      </CurrentLocationMarker>
    </AdvancedMarker>
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

  // 필터된 스팟을 useMemo로 캐싱 (무한 루프 방지)
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

      // 뷰포트 내 스팟 필터링
      const inBounds = filteredSpots.filter(spot => {
        const lat = spot.location?.lat
        const lng = spot.location?.lng
        if (!lat || !lng) return false
        return bounds.contains({ lat, lng })
      })

      // 줌 레벨에 따라 마커 수 제한
      const maxMarkers = getMaxMarkersByZoom(currentZoom)

      // 우선순위: famous > 높은 생태점수 > 나머지
      const sorted = [...inBounds].sort((a, b) => {
        if (a.famous && !b.famous) return -1
        if (!a.famous && b.famous) return 1
        const scoreA = a.ecoScores?.total_score || 0
        const scoreB = b.ecoScores?.total_score || 0
        return scoreB - scoreA
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
  const getMarkerSize = () => {
    if (zoomRef.current >= 14) return 'large'
    if (zoomRef.current >= 11) return 'medium'
    return 'small'
  }

  const markerSize = getMarkerSize()

  return (
    <>
      {visibleSpots.map((spot) => {
        const category = CATEGORIES[spot.category]
        const isUnlocked = isSpotUnlocked(spot.id)

        return (
          <AdvancedMarker
            key={spot.id}
            position={spot.location}
            onClick={() => handleMarkerClick(spot)}
          >
            <MarkerDot
              $color={category?.color || '#00FF94'}
              $isUnlocked={isUnlocked}
              $size={markerSize}
            >
              {markerSize !== 'small' && <MarkerPulse $color={category?.color || '#00FF94'} />}
            </MarkerDot>
          </AdvancedMarker>
        )
      })}

      {/* InfoWindow - 환경 정보 팝업 */}
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
                const temp = eco.temp_reduction || 0
                const carbon = eco.carbon_storage || 0

                if (temp >= 50 || carbon >= 50) {
                  return `이 지역은 주변 온도를 약 ${temp.toFixed(0)}% 낮추고, 연간 탄소를 흡수하여 도시 환경 개선에 크게 기여합니다.`
                }
                return `이 지역은 생태계 보전과 도시 환경 개선에 기여하고 있습니다.`
              }

              return (
                <>
                  <InfoHeader>
                    <InfoThumbnail $color={category?.color}>
                      {category?.emoji || '🌿'}
                    </InfoThumbnail>
                    <div>
                      <InfoTitle>{spot?.name}</InfoTitle>
                      <InfoCategory>{spot?.type || category?.label}</InfoCategory>
                      <InfoDistrict>
                        📍 {spot?.district || '경기도'}
                      </InfoDistrict>
                    </div>
                  </InfoHeader>

                  <EcoScoreGrid>
                    <EcoScoreItem>
                      <EcoScoreValue $color={getScoreColor(eco.temp_reduction || 0)}>
                        {(eco.temp_reduction || 0).toFixed(0)}
                      </EcoScoreValue>
                      <EcoScoreLabel>🌡️ 온도 저감</EcoScoreLabel>
                      <EcoBar>
                        <EcoBarFill $value={eco.temp_reduction || 0} $color={getScoreColor(eco.temp_reduction || 0)} />
                      </EcoBar>
                    </EcoScoreItem>
                    <EcoScoreItem>
                      <EcoScoreValue $color={getScoreColor(eco.carbon_storage || 0)}>
                        {(eco.carbon_storage || 0).toFixed(0)}
                      </EcoScoreValue>
                      <EcoScoreLabel>🌳 탄소 저장</EcoScoreLabel>
                      <EcoBar>
                        <EcoBarFill $value={eco.carbon_storage || 0} $color={getScoreColor(eco.carbon_storage || 0)} />
                      </EcoBar>
                    </EcoScoreItem>
                    <EcoScoreItem>
                      <EcoScoreValue $color={getScoreColor(eco.biodiversity || 0)}>
                        {(eco.biodiversity || 0).toFixed(0)}
                      </EcoScoreValue>
                      <EcoScoreLabel>🦋 생물다양성</EcoScoreLabel>
                      <EcoBar>
                        <EcoBarFill $value={eco.biodiversity || 0} $color={getScoreColor(eco.biodiversity || 0)} />
                      </EcoBar>
                    </EcoScoreItem>
                    <EcoScoreItem>
                      <EcoScoreValue $color={getScoreColor(eco.total_score || 0)}>
                        {(eco.total_score || 0).toFixed(0)}
                      </EcoScoreValue>
                      <EcoScoreLabel>⭐ 생태 가치</EcoScoreLabel>
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
  const map = useMap()
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const { isDarkMode } = useThemeStore()
  const setStoreLocation = useGameStore((state) => state.setCurrentLocation)

  // 현위치 가져오기
  useEffect(() => {
    const getLocation = () => {
      if (!('geolocation' in navigator)) {
        logger.warning('이 브라우저는 위치 서비스를 지원하지 않습니다', null, true)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          // 경기도 영역 체크
          const isInGyeonggi =
            location.lat >= GYEONGGI_BOUNDS.south &&
            location.lat <= GYEONGGI_BOUNDS.north &&
            location.lng >= GYEONGGI_BOUNDS.west &&
            location.lng <= GYEONGGI_BOUNDS.east

          if (!isInGyeonggi) {
            logger.warning('현재 위치는 서비스 지역(경기도)이 아닙니다. 지도에서 경기도 지역을 탐색해보세요!', null, true)
          }

          setCurrentLocation(location)
          setStoreLocation(location)  // store에도 저장
          console.log('[Map] Location found:', location, 'In Gyeonggi:', isInGyeonggi)
        },
        (error) => {
          console.log('[Map] Geolocation error:', error.code, error.message)

          // 에러 코드별 메시지
          const errorMessages = {
            1: '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.',
            2: '위치를 찾을 수 없습니다. GPS 신호를 확인해주세요.',
            3: '위치 요청 시간이 초과되었습니다.',
          }

          logger.warning(errorMessages[error.code] || '위치를 찾을 수 없습니다', null, true)
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
