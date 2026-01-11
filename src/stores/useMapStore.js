import { create } from 'zustand'

const useMapStore = create((set) => ({
  // 선택된 지역
  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  clearSelectedRegion: () => set({ selectedRegion: null }),

  // Time Shift: 2050 모드 (켜면 2050년의 망가진 미래를 본다는 컨셉)
  isTimeShift2050: false,
  toggleTimeShift: () => set((state) => ({ isTimeShift2050: !state.isTimeShift2050 })),

  // 지도 로딩 상태
  isMapLoaded: false,
  setMapLoaded: (loaded) => set({ isMapLoaded: loaded }),
}))

export default useMapStore
