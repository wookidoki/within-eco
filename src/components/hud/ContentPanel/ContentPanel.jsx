import { useState } from 'react'
import { FiX, FiMap, FiBook, FiCompass } from 'react-icons/fi'
import { useGameStore } from '../../../stores'
import { ecoSpots, REGIONS } from '../../../data/spots'
import { TravelCourseList } from '../../content/TravelCourse'
import ExplorationLog from '../../content/ExplorationLog'
import RegionProgress from '../../content/RegionProgress'
import {
  PanelOverlay,
  PanelContainer,
  PanelHeader,
  PanelTitle,
  CloseButton,
  PanelContent,
  TabContainer,
  Tab,
} from './ContentPanel.styles'

const TABS = [
  { id: 'courses', label: '여행 코스', icon: FiCompass },
  { id: 'log', label: '탐험 일지', icon: FiBook },
  { id: 'regions', label: '지역 현황', icon: FiMap },
]

const ContentPanel = () => {
  const { activePanel, closePanel, visitHistory, unlockedSpots, openSpotDetail } = useGameStore()
  const [activeTab, setActiveTab] = useState(activePanel || 'courses')

  if (!activePanel) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closePanel()
    }
  }

  const handleCourseSelect = (course) => {
    const firstSpot = ecoSpots.find(s => s.id === course.spots[0])
    if (firstSpot) {
      openSpotDetail(firstSpot)
      closePanel()
    }
  }

  const handleSpotSelect = (spotId) => {
    const spot = ecoSpots.find(s => s.id === spotId)
    if (spot) {
      openSpotDetail(spot)
      closePanel()
    }
  }

  const currentTab = TABS.find(t => t.id === activeTab)

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <TravelCourseList
            onSelectCourse={handleCourseSelect}
          />
        )
      case 'log':
        return (
          <ExplorationLog
            visits={visitHistory}
            onSpotClick={handleSpotSelect}
          />
        )
      case 'regions':
        return (
          <RegionProgress
            regions={REGIONS}
            spots={ecoSpots}
            unlockedSpots={unlockedSpots}
          />
        )
      default:
        return null
    }
  }

  return (
    <PanelOverlay onClick={handleOverlayClick}>
      <PanelContainer>
        <PanelHeader>
          <PanelTitle>
            {currentTab && <currentTab.icon size={20} />}
            {currentTab?.label}
          </PanelTitle>
          <CloseButton onClick={closePanel}>
            <FiX size={20} />
          </CloseButton>
        </PanelHeader>

        <TabContainer>
          {TABS.map(tab => (
            <Tab
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={14} />
              {tab.label}
            </Tab>
          ))}
        </TabContainer>

        <PanelContent>
          {renderContent()}
        </PanelContent>
      </PanelContainer>
    </PanelOverlay>
  )
}

export default ContentPanel
