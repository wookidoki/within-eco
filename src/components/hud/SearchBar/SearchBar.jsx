import { useState, useRef, useEffect } from 'react'
import { FiMapPin, FiNavigation, FiSearch, FiX } from 'react-icons/fi'
import { useGameStore } from '../../../stores'
import { CATEGORIES } from '../../../data/spots'
import {
  SearchBarContainer,
  LocationButton,
  LocationText,
  CategoryList,
  CategoryChip,
  ChipEmoji,
  ChipLabel,
  SearchInputWrapper,
  SearchInput,
  SearchIconButton,
  SearchResults,
  SearchResultItem,
  ResultName,
  ResultMeta,
  NoResults,
} from './SearchBar.styles'

const SearchBar = () => {
  const [locationName, setLocationName] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const inputRef = useRef(null)

  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    searchResults,
    setSearchQuery,
    clearSearch,
    setNavigateToSpot,
  } = useGameStore()

  const handleGetLocation = () => {
    setIsLocating(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Google Maps Geocoding API로 역지오코딩
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=ko&key=${apiKey}`
            )
            const data = await response.json()

            if (data.status === 'OK' && data.results.length > 0) {
              // 구/군 단위 주소 찾기
              const addressComponents = data.results[0].address_components
              const city = addressComponents.find(c =>
                c.types.includes('locality') || c.types.includes('administrative_area_level_2')
              )?.long_name || ''
              const district = addressComponents.find(c =>
                c.types.includes('sublocality_level_1') || c.types.includes('administrative_area_level_3')
              )?.long_name || ''

              setLocationName(district ? `${city} ${district}` : city || '현재 위치')
            } else {
              setLocationName('현재 위치')
            }
          } catch (error) {
            console.error('Geocoding error:', error)
            setLocationName('현재 위치')
          }

          setIsLocating(false)
        },
        (error) => {
          console.error('Location error:', error)
          setLocationName('위치 확인 실패')
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setLocationName('GPS 미지원')
      setIsLocating(false)
    }
  }

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      clearSearch()
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleResultClick = (spot) => {
    setNavigateToSpot(spot)
    setIsSearchOpen(false)
    clearSearch()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false)
      clearSearch()
    }
  }

  useEffect(() => {
    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  return (
    <SearchBarContainer>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {isSearchOpen ? (
          <SearchInputWrapper>
            <FiSearch size={18} />
            <SearchInput
              ref={inputRef}
              type="text"
              placeholder="장소 검색 (예: 두물머리, 수원)"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <SearchIconButton onClick={handleSearchToggle}>
              <FiX size={18} />
            </SearchIconButton>
          </SearchInputWrapper>
        ) : (
          <>
            <LocationButton onClick={handleGetLocation} disabled={isLocating}>
              {isLocating ? (
                <FiNavigation size={18} className="spin" />
              ) : (
                <FiMapPin size={18} />
              )}
              <LocationText>
                {locationName || '내 위치 찾기'}
              </LocationText>
            </LocationButton>
            <SearchIconButton onClick={handleSearchToggle} style={{ padding: '14px' }}>
              <FiSearch size={18} />
            </SearchIconButton>
          </>
        )}
      </div>

      {/* 검색 결과 */}
      {isSearchOpen && searchQuery && (
        <SearchResults>
          {searchResults.length > 0 ? (
            searchResults.map((spot) => {
              const category = CATEGORIES[spot.category]
              return (
                <SearchResultItem
                  key={spot.id}
                  onClick={() => handleResultClick(spot)}
                >
                  <span style={{ fontSize: '20px' }}>{category?.emoji || '📍'}</span>
                  <div>
                    <ResultName>{spot.displayName || spot.name}</ResultName>
                    <ResultMeta>
                      {spot.district} · {spot.type || category?.label}
                    </ResultMeta>
                  </div>
                </SearchResultItem>
              )
            })
          ) : (
            <NoResults>
              "{searchQuery}" 검색 결과가 없습니다
            </NoResults>
          )}
        </SearchResults>
      )}

      <CategoryList>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <CategoryChip
            key={key}
            $active={activeCategory === key}
            $color={cat.color}
            onClick={() => setActiveCategory(key)}
          >
            <ChipEmoji>{cat.emoji}</ChipEmoji>
            <ChipLabel>{cat.label}</ChipLabel>
          </CategoryChip>
        ))}
      </CategoryList>
    </SearchBarContainer>
  )
}

export default SearchBar
