import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import useGameStore, { GYEONGGI_REGIONS } from './useGameStore'

// spots 모듈 모킹
vi.mock('../data/spots', () => ({
  ecoSpots: [
    {
      id: 'test-spot-1',
      name: '테스트 공원',
      region: '수원시',
      category: 'nature',
      location: { lat: 37.2636, lng: 127.0286 },
      mission: { reward: 100 },
    },
    {
      id: 'test-spot-2',
      name: '테스트 습지',
      region: '성남시',
      category: 'wetland',
      location: { lat: 37.4200, lng: 127.1267 },
      mission: { reward: 50 },
    },
  ],
  getPrioritySpots: () => [
    {
      id: 'test-spot-1',
      name: '테스트 공원',
      region: '수원시',
      category: 'nature',
      location: { lat: 37.2636, lng: 127.0286 },
    },
  ],
}))

describe('useGameStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    act(() => {
      useGameStore.setState({
        user: {
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          totalStamps: 0,
        },
        unlockedSpots: [],
        visitHistory: [],
        hasCompletedOnboarding: false,
        activeCategory: 'ALL',
        activeRegion: 'ALL',
        activeSeason: null,
        searchQuery: '',
        searchResults: [],
        navigateToSpot: null,
        currentLocation: null,
        selectedSpot: null,
        isCollectionOpen: false,
        isSpotDetailOpen: false,
        activePanel: null,
      })
    })
  })

  describe('GYEONGGI_REGIONS', () => {
    it('31개 지역 + 전체 옵션이 있어야 한다', () => {
      expect(GYEONGGI_REGIONS.length).toBe(31)
      expect(GYEONGGI_REGIONS[0].id).toBe('ALL')
    })
  })

  describe('사용자 정보', () => {
    it('초기 레벨이 1이어야 한다', () => {
      const { user } = useGameStore.getState()
      expect(user.level).toBe(1)
      expect(user.xp).toBe(0)
      expect(user.xpToNextLevel).toBe(100)
      expect(user.totalStamps).toBe(0)
    })
  })

  describe('스팟 해금', () => {
    it('unlockSpot으로 스팟을 해금할 수 있다', () => {
      const { unlockSpot } = useGameStore.getState()

      act(() => {
        unlockSpot('test-spot-1')
      })

      const state = useGameStore.getState()
      expect(state.unlockedSpots).toContain('test-spot-1')
      // 100 XP 보상 + 초기 xpToNextLevel 100 = 레벨업 발생
      // 레벨업 후 XP는 0이 됨 (100 - 100)
      expect(state.user.xp).toBe(0)
      expect(state.user.level).toBe(2) // 레벨업
      expect(state.user.totalStamps).toBe(1)
    })

    it('이미 해금된 스팟은 다시 해금되지 않는다', () => {
      act(() => {
        useGameStore.setState({ unlockedSpots: ['test-spot-1'] })
      })

      const { unlockSpot } = useGameStore.getState()

      act(() => {
        unlockSpot('test-spot-1')
      })

      const state = useGameStore.getState()
      expect(state.unlockedSpots.filter(id => id === 'test-spot-1').length).toBe(1)
    })

    it('XP가 충분하면 레벨업한다', () => {
      act(() => {
        useGameStore.setState({
          user: { level: 1, xp: 50, xpToNextLevel: 100, totalStamps: 0 }
        })
      })

      const { unlockSpot } = useGameStore.getState()

      act(() => {
        unlockSpot('test-spot-1') // +100 XP
      })

      const state = useGameStore.getState()
      expect(state.user.level).toBe(2)
      expect(state.user.xp).toBe(50) // 150 - 100 = 50
      expect(state.user.xpToNextLevel).toBe(150) // 100 + 50
    })

    it('isSpotUnlocked으로 해금 여부를 확인할 수 있다', () => {
      const { isSpotUnlocked, unlockSpot } = useGameStore.getState()

      expect(isSpotUnlocked('test-spot-1')).toBe(false)

      act(() => {
        unlockSpot('test-spot-1')
      })

      expect(useGameStore.getState().isSpotUnlocked('test-spot-1')).toBe(true)
    })
  })

  describe('필터링', () => {
    it('setActiveCategory로 카테고리를 변경할 수 있다', () => {
      const { setActiveCategory } = useGameStore.getState()

      act(() => {
        setActiveCategory('nature')
      })

      expect(useGameStore.getState().activeCategory).toBe('nature')
    })

    it('setActiveRegion으로 지역을 변경할 수 있다', () => {
      const { setActiveRegion } = useGameStore.getState()

      act(() => {
        setActiveRegion('수원시')
      })

      expect(useGameStore.getState().activeRegion).toBe('수원시')
    })
  })

  describe('검색', () => {
    it('setSearchQuery로 검색할 수 있다', () => {
      const { setSearchQuery } = useGameStore.getState()

      act(() => {
        setSearchQuery('공원')
      })

      const state = useGameStore.getState()
      expect(state.searchQuery).toBe('공원')
      expect(state.searchResults.length).toBeGreaterThan(0)
    })

    it('빈 검색어는 결과를 초기화한다', () => {
      act(() => {
        useGameStore.setState({ searchQuery: '테스트', searchResults: [{ id: 'test' }] })
      })

      const { setSearchQuery } = useGameStore.getState()

      act(() => {
        setSearchQuery('')
      })

      const state = useGameStore.getState()
      expect(state.searchQuery).toBe('')
      expect(state.searchResults).toEqual([])
    })

    it('clearSearch로 검색을 초기화할 수 있다', () => {
      act(() => {
        useGameStore.setState({ searchQuery: '테스트', searchResults: [{ id: 'test' }] })
      })

      const { clearSearch } = useGameStore.getState()

      act(() => {
        clearSearch()
      })

      const state = useGameStore.getState()
      expect(state.searchQuery).toBe('')
      expect(state.searchResults).toEqual([])
    })
  })

  describe('모달', () => {
    it('openSpotDetail로 스팟 상세를 열 수 있다', () => {
      const { openSpotDetail } = useGameStore.getState()
      const testSpot = { id: 'test', name: '테스트' }

      act(() => {
        openSpotDetail(testSpot)
      })

      const state = useGameStore.getState()
      expect(state.selectedSpot).toEqual(testSpot)
      expect(state.isSpotDetailOpen).toBe(true)
    })

    it('closeSpotDetail로 스팟 상세를 닫을 수 있다', () => {
      act(() => {
        useGameStore.setState({
          selectedSpot: { id: 'test' },
          isSpotDetailOpen: true,
        })
      })

      const { closeSpotDetail } = useGameStore.getState()

      act(() => {
        closeSpotDetail()
      })

      const state = useGameStore.getState()
      expect(state.selectedSpot).toBeNull()
      expect(state.isSpotDetailOpen).toBe(false)
    })

    it('toggleCollection으로 컬렉션 모달을 토글할 수 있다', () => {
      const { toggleCollection } = useGameStore.getState()

      act(() => {
        toggleCollection()
      })

      expect(useGameStore.getState().isCollectionOpen).toBe(true)

      act(() => {
        toggleCollection()
      })

      expect(useGameStore.getState().isCollectionOpen).toBe(false)
    })
  })

  describe('온보딩', () => {
    it('completeOnboarding으로 온보딩을 완료할 수 있다', () => {
      const { completeOnboarding } = useGameStore.getState()

      expect(useGameStore.getState().hasCompletedOnboarding).toBe(false)

      act(() => {
        completeOnboarding()
      })

      expect(useGameStore.getState().hasCompletedOnboarding).toBe(true)
    })
  })

  describe('방문 기록', () => {
    it('addVisit으로 방문 기록을 추가할 수 있다', () => {
      const { addVisit } = useGameStore.getState()

      act(() => {
        addVisit('test-spot-1')
      })

      const state = useGameStore.getState()
      expect(state.visitHistory.length).toBe(1)
      expect(state.visitHistory[0].spotId).toBe('test-spot-1')
      expect(state.visitHistory[0].spotName).toBe('테스트 공원')
    })

    it('존재하지 않는 스팟은 기록되지 않는다', () => {
      const { addVisit } = useGameStore.getState()

      act(() => {
        addVisit('non-existent-spot')
      })

      expect(useGameStore.getState().visitHistory.length).toBe(0)
    })
  })

  describe('리셋', () => {
    it('resetProgress로 진행상황을 초기화할 수 있다', () => {
      act(() => {
        useGameStore.setState({
          user: { level: 5, xp: 200, xpToNextLevel: 300, totalStamps: 10 },
          unlockedSpots: ['spot-1', 'spot-2'],
          visitHistory: [{ spotId: 'spot-1' }],
          hasCompletedOnboarding: true,
        })
      })

      const { resetProgress } = useGameStore.getState()

      act(() => {
        resetProgress()
      })

      const state = useGameStore.getState()
      expect(state.user.level).toBe(1)
      expect(state.user.xp).toBe(0)
      expect(state.unlockedSpots).toEqual([])
      expect(state.visitHistory).toEqual([])
      expect(state.hasCompletedOnboarding).toBe(false)
    })
  })

  describe('클라우드 동기화', () => {
    it('getCloudSyncData로 동기화 데이터를 가져올 수 있다', () => {
      act(() => {
        useGameStore.setState({
          user: { level: 3, xp: 50, xpToNextLevel: 200, totalStamps: 5 },
          unlockedSpots: ['spot-1'],
          hasCompletedOnboarding: true,
        })
      })

      const data = useGameStore.getState().getCloudSyncData()

      expect(data.user.level).toBe(3)
      expect(data.unlockedSpots).toContain('spot-1')
      expect(data.hasCompletedOnboarding).toBe(true)
    })

    it('restoreFromCloud로 클라우드 데이터를 복원할 수 있다', () => {
      const { restoreFromCloud } = useGameStore.getState()

      const cloudData = {
        progress: {
          level: 5,
          xp: 100,
          xpToNextLevel: 300,
          totalStamps: 15,
          hasCompletedOnboarding: true,
        },
        unlockedSpots: ['cloud-spot-1', 'cloud-spot-2'],
        visitHistory: [{ spotId: 'cloud-spot-1', visitedAt: '2024-01-01' }],
      }

      act(() => {
        restoreFromCloud(cloudData)
      })

      const state = useGameStore.getState()
      expect(state.user.level).toBe(5)
      expect(state.unlockedSpots).toEqual(['cloud-spot-1', 'cloud-spot-2'])
      expect(state.hasCompletedOnboarding).toBe(true)
    })
  })
})
