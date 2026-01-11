import DashboardPanel from '../DashboardPanel'
import TopBar from '../TopBar'
import BottomDock from '../BottomDock'
import CollectionModal from '../CollectionModal'
import ContentPanel from '../ContentPanel'
import SpotPreview from '../SpotPreview'
import TestController from '../TestController'
import { HUDContainer, RightSection } from './HUDLayout.styles'

const HUDLayout = () => {
  return (
    <HUDContainer>
      {/* 왼쪽 대시보드 패널 */}
      <DashboardPanel />

      {/* 오른쪽 영역 (지도 위 오버레이) */}
      <RightSection>
        <TopBar />
        <BottomDock />
      </RightSection>

      {/* 스팟 미리보기 (오른쪽 하단) */}
      <SpotPreview />

      {/* 모달 */}
      <CollectionModal />

      {/* 콘텐츠 패널 (여행코스, 탐험일지, 지역현황) */}
      <ContentPanel />

      {/* 개발용 테스트 컨트롤러 */}
      {import.meta.env.DEV && <TestController />}
    </HUDContainer>
  )
}

export default HUDLayout
