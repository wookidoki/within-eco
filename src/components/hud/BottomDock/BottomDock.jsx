import { useGameStore } from '../../../stores'
import {
  DockContainer,
  ScanButton,
  ScanRipple,
  ScanIcon,
} from './BottomDock.styles'

const BottomDock = () => {
  const { openSpotDetail, getFilteredSpots } = useGameStore()

  const handleScan = () => {
    // 랜덤 스팟 열기 (테스트용)
    const spots = getFilteredSpots()
    if (spots.length > 0) {
      const randomSpot = spots[Math.floor(Math.random() * spots.length)]
      openSpotDetail(randomSpot)
    }
  }

  return (
    <DockContainer>
      <ScanButton onClick={handleScan} aria-label="스캔하기">
        <ScanRipple />
        <ScanIcon>📡</ScanIcon>
      </ScanButton>
    </DockContainer>
  )
}

export default BottomDock
