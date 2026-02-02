import { useState } from 'react'
import { FiSettings, FiMapPin, FiUnlock, FiRefreshCw, FiX } from 'react-icons/fi'
import { useGameStore } from '../../../stores'
import { ecoSpots } from '../../../data/spots'
import {
  ControllerButton,
  Panel,
  PanelHeader,
  PanelTitle,
  CloseBtn,
  ButtonList,
  TestButton,
} from './TestController.styles'

const TestController = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { simulateVisit, unlockAllSpots, resetProgress, openSpotDetail } = useGameStore()

  const handleSimulateVisit = () => {
    // 광교 호수공원으로 위치 시뮬레이션
    simulateVisit('spot_001')
    openSpotDetail(ecoSpots[0])
  }

  if (!isOpen) {
    return (
      <ControllerButton onClick={() => setIsOpen(true)}>
        <FiSettings size={20} />
      </ControllerButton>
    )
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>🛠️ 테스트 도구</PanelTitle>
        <CloseBtn onClick={() => setIsOpen(false)}>
          <FiX size={18} />
        </CloseBtn>
      </PanelHeader>

      <ButtonList>
        <TestButton onClick={handleSimulateVisit}>
          <FiMapPin size={16} />
          광교호수 방문 시뮬레이션
        </TestButton>

        <TestButton onClick={unlockAllSpots}>
          <FiUnlock size={16} />
          모든 스팟 해금
        </TestButton>

        <TestButton onClick={resetProgress} $danger>
          <FiRefreshCw size={16} />
          진행상황 초기화
        </TestButton>
      </ButtonList>
    </Panel>
  )
}

export default TestController
