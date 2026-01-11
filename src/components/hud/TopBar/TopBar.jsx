import { useState, useEffect, useRef } from 'react'
import { FiSun, FiMoon, FiFilter, FiX, FiLogOut, FiUser, FiCloud, FiSettings } from 'react-icons/fi'
import { useGameStore, useThemeStore, useAuthStore, GYEONGGI_REGIONS } from '../../../stores'
import { CATEGORIES, ecoSpots, getPrioritySpots } from '../../../data/spots'
import SearchBar from '../SearchBar'
import ProfileModal from '../ProfileModal'
import {
  TopBarContainer,
  LeftSection,
  RightSection,
  IconButton,
  FilterButton,
  FilterLabel,
  FilterCount,
  FilterModal,
  FilterOverlay,
  FilterHeader,
  FilterTitle,
  CloseButton,
  FilterSection,
  SectionLabel,
  ChipGroup,
  FilterChip,
  ChipEmoji,
  LoginButton,
  UserButton,
  UserAvatar,
  UserName,
  UserMenu,
  UserMenuItem,
  UserMenuDivider,
} from './TopBar.styles'

const TopBar = () => {
  const {
    activeRegion, setActiveRegion,
    activeCategory, setActiveCategory,
    getFilteredSpots,
    getCloudSyncData
  } = useGameStore()
  const { isDarkMode, toggleTheme } = useThemeStore()
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithGoogle,
    logout,
    syncProgress,
    loadProgress,
    getDisplayName
  } = useAuthStore()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null) // 'syncing' | 'synced' | 'error'
  const userMenuRef = useRef(null)

  // 유저 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])

  const filteredSpots = getFilteredSpots()
  const regionInfo = GYEONGGI_REGIONS.find(r => r.id === activeRegion) || GYEONGGI_REGIONS[0]

  // 지역별 스팟 개수
  const getRegionCount = (regionId) => {
    if (regionId === 'ALL') return getPrioritySpots().length
    return ecoSpots.filter(s => s.region === regionId).length
  }

  // 스팟이 있는 지역만 필터링
  const activeRegions = GYEONGGI_REGIONS
    .filter(r => r.id === 'ALL' || getRegionCount(r.id) > 0)

  // 사용할 카테고리 (기본 카테고리만)
  const mainCategories = ['ALL', 'nature', 'water', 'ecology'].map(id => CATEGORIES[id])

  // 클라우드 동기화
  const handleSync = async () => {
    if (!isAuthenticated) return

    setSyncStatus('syncing')
    const gameData = getCloudSyncData()
    const success = await syncProgress(gameData)
    setSyncStatus(success ? 'synced' : 'error')

    setTimeout(() => setSyncStatus(null), 2000)
  }

  // 로그아웃
  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    await logout()
  }

  return (
    <>
      <TopBarContainer>
        {/* 왼쪽: 검색 바 */}
        <LeftSection>
          <SearchBar />
        </LeftSection>

        {/* 오른쪽: 로그인 + 필터 + 테마 토글 */}
        <RightSection>
          {/* 로그인/사용자 버튼 */}
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <UserButton onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                {user.avatar ? (
                  <UserAvatar src={user.avatar} alt={getDisplayName()} />
                ) : (
                  <FiUser size={20} />
                )}
                <UserName>{getDisplayName()}</UserName>
              </UserButton>

              {isUserMenuOpen && (
                <UserMenu>
                  <UserMenuItem onClick={() => { setIsProfileOpen(true); setIsUserMenuOpen(false) }}>
                    <FiSettings size={16} />
                    내 정보
                  </UserMenuItem>
                  <UserMenuItem onClick={handleSync} disabled={syncStatus === 'syncing'}>
                    <FiCloud size={16} />
                    {syncStatus === 'syncing' ? '동기화 중...' :
                     syncStatus === 'synced' ? '동기화 완료!' :
                     syncStatus === 'error' ? '동기화 실패' :
                     '클라우드 동기화'}
                  </UserMenuItem>
                  <UserMenuDivider />
                  <UserMenuItem $danger onClick={handleLogout}>
                    <FiLogOut size={16} />
                    로그아웃
                  </UserMenuItem>
                </UserMenu>
              )}
            </div>
          ) : (
            <LoginButton onClick={loginWithGoogle} disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? '로그인 중...' : 'Google 로그인'}
            </LoginButton>
          )}

          {/* 필터 버튼 */}
          <FilterButton onClick={() => setIsFilterOpen(true)}>
            <FiFilter size={16} />
            <FilterLabel>
              {regionInfo.emoji} {activeRegion === 'ALL' ? '전체' : regionInfo.name}
            </FilterLabel>
            <FilterCount>{filteredSpots.length}</FilterCount>
          </FilterButton>

          {/* 다크모드 토글 */}
          <IconButton onClick={toggleTheme} aria-label="테마 전환">
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </IconButton>
        </RightSection>
      </TopBarContainer>

      {/* 필터 모달 */}
      {isFilterOpen && (
        <>
          <FilterOverlay onClick={() => setIsFilterOpen(false)} />
          <FilterModal>
            <FilterHeader>
              <FilterTitle>필터</FilterTitle>
              <CloseButton onClick={() => setIsFilterOpen(false)}>
                <FiX size={20} />
              </CloseButton>
            </FilterHeader>

            {/* 카테고리 필터 */}
            <FilterSection>
              <SectionLabel>카테고리</SectionLabel>
              <ChipGroup>
                {mainCategories.map((cat) => (
                  <FilterChip
                    key={cat.id}
                    $active={activeCategory === cat.id}
                    $color={cat.color}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <ChipEmoji>{cat.emoji}</ChipEmoji>
                    {cat.label}
                  </FilterChip>
                ))}
              </ChipGroup>
            </FilterSection>

            {/* 지역 필터 */}
            <FilterSection>
              <SectionLabel>지역</SectionLabel>
              <ChipGroup>
                {activeRegions.map((region) => (
                  <FilterChip
                    key={region.id}
                    $active={activeRegion === region.id}
                    onClick={() => {
                      setActiveRegion(region.id)
                      setIsFilterOpen(false)
                    }}
                  >
                    <ChipEmoji>{region.emoji}</ChipEmoji>
                    {region.id === 'ALL' ? '전체' : region.name}
                    <FilterCount>{getRegionCount(region.id)}</FilterCount>
                  </FilterChip>
                ))}
              </ChipGroup>
            </FilterSection>
          </FilterModal>
        </>
      )}

      {/* 프로필 모달 */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  )
}

export default TopBar
