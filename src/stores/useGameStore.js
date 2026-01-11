import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ecoSpots, getPrioritySpots } from '../data/spots'
import { BADGES, getUnlockedBadges, getNextBadges, getLevelInfo } from '../data/achievements'
import { calculateUserContribution, calculateEnvironmentalImpact } from '../data/ecoAnalysis'

// 배지 요구사항 체크 함수
const checkBadgeRequirement = (badge, stats) => {
  const req = badge.requirement
  switch (req.type) {
    case 'visits':
      return stats.totalVisits >= req.count
    case 'category':
      return (stats.categoryVisits?.[req.category] || 0) >= req.count
    case 'regions':
      return stats.uniqueRegions >= req.count
    case 'streak':
      return stats.currentStreak >= req.days
    case 'ecoScore':
      return stats.totalEcoScore >= req.score
    case 'weekendVisits':
      return stats.weekendVisits >= req.count
    default:
      return false
  }
}

// 경기도 시군 목록
export const GYEONGGI_REGIONS = [
  { id: 'ALL', name: '전체', emoji: '🗺️' },
  { id: '수원시', name: '수원시', emoji: '🏰', center: { lat: 37.2636, lng: 127.0286 } },
  { id: '성남시', name: '성남시', emoji: '🏙️', center: { lat: 37.4200, lng: 127.1267 } },
  { id: '용인시', name: '용인시', emoji: '🎢', center: { lat: 37.2411, lng: 127.1776 } },
  { id: '화성시', name: '화성시', emoji: '🚀', center: { lat: 37.1995, lng: 126.8313 } },
  { id: '고양시', name: '고양시', emoji: '🌸', center: { lat: 37.6584, lng: 126.8320 } },
  { id: '안산시', name: '안산시', emoji: '🌊', center: { lat: 37.3219, lng: 126.8309 } },
  { id: '남양주시', name: '남양주시', emoji: '🏔️', center: { lat: 37.6360, lng: 127.2165 } },
  { id: '안양시', name: '안양시', emoji: '🌳', center: { lat: 37.3943, lng: 126.9568 } },
  { id: '평택시', name: '평택시', emoji: '⚓', center: { lat: 36.9921, lng: 127.1129 } },
  { id: '시흥시', name: '시흥시', emoji: '🦢', center: { lat: 37.3800, lng: 126.8030 } },
  { id: '파주시', name: '파주시', emoji: '📚', center: { lat: 37.7126, lng: 126.7618 } },
  { id: '김포시', name: '김포시', emoji: '✈️', center: { lat: 37.6153, lng: 126.7156 } },
  { id: '광주시', name: '광주시', emoji: '🏺', center: { lat: 37.4294, lng: 127.2551 } },
  { id: '광명시', name: '광명시', emoji: '💎', center: { lat: 37.4786, lng: 126.8646 } },
  { id: '군포시', name: '군포시', emoji: '🌲', center: { lat: 37.3614, lng: 126.9352 } },
  { id: '하남시', name: '하남시', emoji: '🌅', center: { lat: 37.5393, lng: 127.2148 } },
  { id: '오산시', name: '오산시', emoji: '🦅', center: { lat: 37.1499, lng: 127.0773 } },
  { id: '이천시', name: '이천시', emoji: '🍚', center: { lat: 37.2723, lng: 127.4348 } },
  { id: '안성시', name: '안성시', emoji: '🐂', center: { lat: 37.0080, lng: 127.2798 } },
  { id: '의왕시', name: '의왕시', emoji: '🚂', center: { lat: 37.3449, lng: 126.9683 } },
  { id: '양평군', name: '양평군', emoji: '🌾', center: { lat: 37.4917, lng: 127.4873 } },
  { id: '여주시', name: '여주시', emoji: '👑', center: { lat: 37.2984, lng: 127.6373 } },
  { id: '과천시', name: '과천시', emoji: '🦁', center: { lat: 37.4292, lng: 126.9876 } },
  { id: '포천시', name: '포천시', emoji: '⛰️', center: { lat: 37.8949, lng: 127.2003 } },
  { id: '의정부시', name: '의정부시', emoji: '🪖', center: { lat: 37.7381, lng: 127.0337 } },
  { id: '양주시', name: '양주시', emoji: '🏯', center: { lat: 37.7853, lng: 127.0458 } },
  { id: '구리시', name: '구리시', emoji: '🌉', center: { lat: 37.5944, lng: 127.1295 } },
  { id: '가평군', name: '가평군', emoji: '🏝️', center: { lat: 37.8315, lng: 127.5095 } },
  { id: '연천군', name: '연천군', emoji: '🦌', center: { lat: 38.0966, lng: 127.0750 } },
  { id: '동두천시', name: '동두천시', emoji: '🎖️', center: { lat: 37.9035, lng: 127.0605 } },
]

const useGameStore = create(
  persist(
    (set, get) => ({
      // 사용자 정보
      user: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        totalStamps: 0,
        totalXp: 0, // 누적 XP
      },

      // 해금된 스팟 ID 목록
      unlockedSpots: [],

      // 방문 기록 (탐험 일지용)
      visitHistory: [],

      // 해금된 배지 ID 목록
      unlockedBadges: [],

      // 연속 방문 기록
      streak: {
        current: 0,
        longest: 0,
        lastVisitDate: null,
      },

      // 통계
      stats: {
        totalVisits: 0,
        categoryVisits: {}, // { nature: 10, water: 5, ... }
        regionVisits: {},   // { 수원시: 5, 안산시: 3, ... }
        weekendVisits: 0,
        totalEcoScore: 0,
        firstVisitDate: null,
      },

      // 온보딩 완료 여부
      hasCompletedOnboarding: false,

      // 현재 카테고리 필터
      activeCategory: 'ALL',

      // 현재 지역 필터
      activeRegion: 'ALL',

      // 현재 시즌 필터
      activeSeason: null,

      // 검색어
      searchQuery: '',

      // 검색 결과 (스팟 목록)
      searchResults: [],

      // 네비게이션 대상 스팟 (지도 이동용)
      navigateToSpot: null,

      // 현재 위치
      currentLocation: null,

      // 현재 위치 설정
      setCurrentLocation: (location) => set({ currentLocation: location }),

      // 모달 상태
      selectedSpot: null,
      isCollectionOpen: false,
      isSpotDetailOpen: false,

      // 네비게이션 패널 상태
      activePanel: null, // 'courses' | 'log' | 'regions' | null

      // 카테고리 필터 설정
      setActiveCategory: (category) => set({ activeCategory: category }),

      // 지역 필터 설정
      setActiveRegion: (region) => set({ activeRegion: region }),

      // 검색어 설정 및 검색 실행
      setSearchQuery: (query) => {
        if (!query || query.trim() === '') {
          set({ searchQuery: '', searchResults: [] })
          return
        }

        const normalizedQuery = query.toLowerCase().trim()
        const results = ecoSpots.filter((spot) => {
          const name = spot.name?.toLowerCase() || ''
          const district = spot.district?.toLowerCase() || ''
          const type = spot.type?.toLowerCase() || ''
          const address = spot.address?.toLowerCase() || ''

          return name.includes(normalizedQuery) ||
                 district.includes(normalizedQuery) ||
                 type.includes(normalizedQuery) ||
                 address.includes(normalizedQuery)
        }).slice(0, 20) // 최대 20개 결과

        set({ searchQuery: query, searchResults: results })
      },

      // 검색 초기화
      clearSearch: () => set({ searchQuery: '', searchResults: [] }),

      // 지도 네비게이션
      setNavigateToSpot: (spot) => set({ navigateToSpot: spot }),
      clearNavigateToSpot: () => set({ navigateToSpot: null }),

      // 필터링된 스팟 가져오기 (지역 + 카테고리)
      getFilteredSpots: () => {
        const { activeCategory, activeRegion } = get()
        let spots = ecoSpots

        // 지역 필터
        if (activeRegion !== 'ALL') {
          // 특정 지역 선택 시: 해당 지역의 모든 스팟 표시
          spots = spots.filter((spot) => spot.region === activeRegion)
        } else {
          // 전체 선택 시: 우선순위 스팟만 표시 (성능 최적화)
          // 우선순위 스팟 = 도립/군립공원, 국가하천, 특별보호구역 등
          spots = getPrioritySpots()
        }

        // 카테고리 필터
        if (activeCategory !== 'ALL') {
          spots = spots.filter((spot) => spot.category === activeCategory)
        }

        return spots
      },

      // 현재 표시 중인 스팟 개수 정보
      getSpotDisplayInfo: () => {
        const { activeRegion } = get()
        const filteredSpots = get().getFilteredSpots()
        const totalSpots = ecoSpots.length
        const prioritySpots = getPrioritySpots().length

        if (activeRegion === 'ALL') {
          return {
            showing: prioritySpots,
            total: totalSpots,
            isFiltered: true,
            message: `주요 스팟 ${prioritySpots}개 표시 중 (전체 ${totalSpots}개)`,
          }
        }

        const regionSpots = ecoSpots.filter(s => s.region === activeRegion).length
        return {
          showing: filteredSpots.length,
          total: regionSpots,
          isFiltered: false,
          message: `${activeRegion} ${filteredSpots.length}개`,
        }
      },

      // 현재 선택된 지역 정보 가져오기
      getActiveRegionInfo: () => {
        const { activeRegion } = get()
        return GYEONGGI_REGIONS.find(r => r.id === activeRegion) || GYEONGGI_REGIONS[0]
      },

      // 두 좌표 사이 거리 계산 (미터 단위)
      calculateDistance: (lat1, lng1, lat2, lng2) => {
        const R = 6371000 // 지구 반경 (미터)
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
      },

      // 스팟 해금 (위치 검증 포함)
      unlockSpot: (spotId, userLocation = null) => {
        const { unlockedSpots, user, stats, streak, currentLocation, calculateDistance } = get()
        if (unlockedSpots.includes(spotId)) return { success: false, reason: 'already_unlocked' }

        const spot = ecoSpots.find((s) => s.id === spotId)
        if (!spot) return { success: false, reason: 'spot_not_found' }

        // 위치 검증 (500m 이내)
        const location = userLocation || currentLocation
        if (location && spot.location) {
          const distance = calculateDistance(
            location.lat, location.lng,
            spot.location.lat, spot.location.lng
          )
          // 500m 이상 떨어진 경우 해금 불가
          if (distance > 500) {
            return { success: false, reason: 'too_far', distance: Math.round(distance) }
          }
        } else if (!location) {
          // 위치 정보가 없으면 해금 불가
          return { success: false, reason: 'no_location' }
        }

        const reward = spot?.mission?.reward || 50
        const ecoScore = spot.ecoScores?.total_score || spot.ecoStats?.score || 0

        const newXp = user.xp + reward
        const newTotalXp = (user.totalXp || 0) + reward
        const shouldLevelUp = newXp >= user.xpToNextLevel

        // 연속 방문 체크
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        let newStreak = { ...streak }

        if (streak.lastVisitDate === today) {
          // 오늘 이미 방문함 - 스트릭 유지
        } else if (streak.lastVisitDate === yesterday) {
          // 어제 방문 - 스트릭 증가
          newStreak.current = streak.current + 1
          newStreak.longest = Math.max(newStreak.longest, newStreak.current)
          newStreak.lastVisitDate = today
        } else {
          // 스트릭 리셋
          newStreak.current = 1
          newStreak.lastVisitDate = today
        }

        // 통계 업데이트
        const isWeekend = [0, 6].includes(new Date().getDay())
        const newStats = {
          ...stats,
          totalVisits: stats.totalVisits + 1,
          categoryVisits: {
            ...stats.categoryVisits,
            [spot.category]: (stats.categoryVisits[spot.category] || 0) + 1,
          },
          regionVisits: {
            ...stats.regionVisits,
            [spot.region]: (stats.regionVisits[spot.region] || 0) + 1,
          },
          weekendVisits: isWeekend ? stats.weekendVisits + 1 : stats.weekendVisits,
          totalEcoScore: stats.totalEcoScore + ecoScore,
          firstVisitDate: stats.firstVisitDate || new Date().toISOString(),
        }

        set({
          unlockedSpots: [...unlockedSpots, spotId],
          user: {
            ...user,
            xp: shouldLevelUp ? newXp - user.xpToNextLevel : newXp,
            level: shouldLevelUp ? user.level + 1 : user.level,
            xpToNextLevel: shouldLevelUp ? user.xpToNextLevel + 50 : user.xpToNextLevel,
            totalStamps: user.totalStamps + 1,
            totalXp: newTotalXp,
          },
          stats: newStats,
          streak: newStreak,
        })

        // 배지 체크 (다음 프레임에서)
        setTimeout(() => get().checkAndUnlockBadges(), 0)

        return { success: true, reward, levelUp: shouldLevelUp }
      },

      // 스팟 해금 여부 확인
      isSpotUnlocked: (spotId) => {
        return get().unlockedSpots.includes(spotId)
      },

      // 모든 스팟 해금 (테스트용)
      unlockAllSpots: () => {
        const allIds = ecoSpots.map((s) => s.id)
        set({
          unlockedSpots: allIds,
          user: {
            level: 10,
            xp: 0,
            xpToNextLevel: 600,
            totalStamps: allIds.length,
          },
        })
      },

      // 테스트용 위치 시뮬레이션
      simulateVisit: (spotId) => {
        const spot = ecoSpots.find((s) => s.id === spotId)
        if (spot) {
          set({
            currentLocation: {
              lat: spot.location.lat + 0.0001,
              lng: spot.location.lng + 0.0001,
            },
          })
        }
      },

      // 모달 열기/닫기
      openSpotDetail: (spot) => set({ selectedSpot: spot, isSpotDetailOpen: true }),
      closeSpotDetail: () => set({ selectedSpot: null, isSpotDetailOpen: false }),
      toggleCollection: () => set((state) => ({ isCollectionOpen: !state.isCollectionOpen })),

      // 온보딩 완료
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      // 시즌 필터 설정
      setActiveSeason: (season) => set({ activeSeason: season }),

      // 패널 네비게이션
      setActivePanel: (panel) => set({ activePanel: panel }),
      closePanel: () => set({ activePanel: null }),

      // 방문 기록 추가
      addVisit: (spotId) => {
        const { visitHistory } = get()
        const spot = ecoSpots.find((s) => s.id === spotId)
        if (!spot) return

        set({
          visitHistory: [
            {
              spotId,
              visitedAt: new Date().toISOString(),
              spotName: spot.name,
              category: spot.category,
            },
            ...visitHistory,
          ],
        })
      },

      // 리셋 (개발용)
      resetProgress: () => set({
        unlockedSpots: [],
        visitHistory: [],
        unlockedBadges: [],
        hasCompletedOnboarding: false,
        user: {
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          totalStamps: 0,
          totalXp: 0,
        },
        stats: {
          totalVisits: 0,
          categoryVisits: {},
          regionVisits: {},
          weekendVisits: 0,
          totalEcoScore: 0,
          firstVisitDate: null,
        },
        streak: {
          current: 0,
          longest: 0,
          lastVisitDate: null,
        },
      }),

      // ===================
      // 배지/업적 시스템
      // ===================

      // 배지 해금 체크
      checkAndUnlockBadges: () => {
        const { stats, streak, unlockedBadges } = get()
        const uniqueRegions = Object.keys(stats.regionVisits || {}).length

        const badgeStats = {
          totalVisits: stats.totalVisits,
          categoryVisits: stats.categoryVisits,
          uniqueRegions,
          currentStreak: streak.current,
          totalEcoScore: stats.totalEcoScore,
          weekendVisits: stats.weekendVisits,
        }

        const newlyUnlocked = []
        Object.values(BADGES).forEach(badge => {
          if (!unlockedBadges.includes(badge.id)) {
            const isUnlocked = checkBadgeRequirement(badge, badgeStats)
            if (isUnlocked) {
              newlyUnlocked.push(badge.id)
            }
          }
        })

        if (newlyUnlocked.length > 0) {
          set({ unlockedBadges: [...unlockedBadges, ...newlyUnlocked] })
        }

        return newlyUnlocked
      },

      // 해금된 배지 목록 가져오기
      getUnlockedBadges: () => {
        const { unlockedBadges } = get()
        return unlockedBadges.map(id => BADGES[id]).filter(Boolean)
      },

      // 다음 해금 가능한 배지
      getNextBadges: (limit = 3) => {
        const { stats, streak, unlockedBadges } = get()
        const uniqueRegions = Object.keys(stats.regionVisits || {}).length

        const badgeStats = {
          totalVisits: stats.totalVisits,
          categoryVisits: stats.categoryVisits,
          uniqueRegions,
          currentStreak: streak.current,
          totalEcoScore: stats.totalEcoScore,
          weekendVisits: stats.weekendVisits,
        }

        return getNextBadges(badgeStats, limit)
      },

      // 레벨 정보 가져오기
      getLevelInfo: () => {
        const { user } = get()
        return getLevelInfo(user.totalXp || 0)
      },

      // ===================
      // 환경 기여 분석
      // ===================

      // 사용자 환경 기여도 계산
      getUserContribution: () => {
        const { unlockedSpots } = get()
        return calculateUserContribution(unlockedSpots, ecoSpots)
      },

      // 스팟 환경 영향 분석
      getSpotImpact: (spotId) => {
        const spot = ecoSpots.find(s => s.id === spotId)
        if (!spot) return null
        return calculateEnvironmentalImpact(spot)
      },

      // 통계 요약
      getStatsSummary: () => {
        const { stats, streak, user, unlockedSpots, unlockedBadges } = get()
        const uniqueRegions = Object.keys(stats.regionVisits || {}).length
        const totalSpots = ecoSpots.length

        return {
          totalVisits: stats.totalVisits,
          unlockedCount: unlockedSpots.length,
          totalSpots,
          completionRate: ((unlockedSpots.length / totalSpots) * 100).toFixed(1),
          uniqueRegions,
          totalRegions: GYEONGGI_REGIONS.length - 1, // ALL 제외
          currentStreak: streak.current,
          longestStreak: streak.longest,
          totalEcoScore: stats.totalEcoScore.toFixed(0),
          badgeCount: unlockedBadges.length,
          totalBadges: Object.keys(BADGES).length,
          level: user.level,
          totalXp: user.totalXp || 0,
          daysSinceStart: stats.firstVisitDate
            ? Math.floor((Date.now() - new Date(stats.firstVisitDate).getTime()) / 86400000)
            : 0,
        }
      },

      // ===================
      // 클라우드 동기화
      // ===================

      // 클라우드 데이터로 상태 복원
      restoreFromCloud: (cloudData) => {
        if (!cloudData) return

        set((state) => ({
          user: cloudData.progress ? {
            level: cloudData.progress.level ?? state.user.level,
            xp: cloudData.progress.xp ?? state.user.xp,
            xpToNextLevel: cloudData.progress.xpToNextLevel ?? state.user.xpToNextLevel,
            totalStamps: cloudData.progress.totalStamps ?? state.user.totalStamps,
            totalXp: cloudData.progress.totalXp ?? state.user.totalXp ?? 0,
          } : state.user,
          hasCompletedOnboarding: cloudData.progress?.hasCompletedOnboarding ?? state.hasCompletedOnboarding,
          activeCategory: cloudData.progress?.activeCategory ?? state.activeCategory,
          activeRegion: cloudData.progress?.activeRegion ?? state.activeRegion,
          unlockedSpots: cloudData.unlockedSpots?.length > 0
            ? cloudData.unlockedSpots
            : state.unlockedSpots,
          visitHistory: cloudData.visitHistory?.length > 0
            ? cloudData.visitHistory
            : state.visitHistory,
          unlockedBadges: cloudData.unlockedBadges?.length > 0
            ? cloudData.unlockedBadges
            : state.unlockedBadges,
          stats: cloudData.stats || state.stats,
          streak: cloudData.streak || state.streak,
        }))
      },

      // 현재 상태를 클라우드용 객체로 변환
      getCloudSyncData: () => {
        const state = get()
        return {
          user: state.user,
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          activeCategory: state.activeCategory,
          activeRegion: state.activeRegion,
          unlockedSpots: state.unlockedSpots,
          visitHistory: state.visitHistory,
          unlockedBadges: state.unlockedBadges,
          stats: state.stats,
          streak: state.streak,
        }
      },

      // 로컬과 클라우드 데이터 병합 (클라우드 우선 또는 로컬 우선 선택)
      mergeWithCloud: (cloudData, preferCloud = false) => {
        const state = get()

        if (preferCloud && cloudData) {
          // 클라우드 데이터 우선
          get().restoreFromCloud(cloudData)
        } else {
          // 로컬 데이터 유지하되 해금 스팟은 합치기
          const mergedUnlockedSpots = [...new Set([
            ...state.unlockedSpots,
            ...(cloudData?.unlockedSpots || []),
          ])]

          set({
            unlockedSpots: mergedUnlockedSpots,
            user: {
              ...state.user,
              totalStamps: mergedUnlockedSpots.length,
            },
          })
        }
      },
    }),
    {
      name: 'reearth-game-storage',
    }
  )
)

export default useGameStore
