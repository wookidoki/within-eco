import Logo from '../Logo'
import UserStats from '../UserStats'
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
} from './DashboardPanel.styles'

const DashboardPanel = () => {
  return (
    <PanelContainer>
      <PanelHeader>
        <Logo />
        <PanelTitle>Re:Earth</PanelTitle>
      </PanelHeader>

      <UserStats />
    </PanelContainer>
  )
}

export default DashboardPanel
