import { LogoContainer, LogoPrefix, LogoMain, LogoSubtitle } from './Logo.styles'

const Logo = ({ showSubtitle = true }) => {
  return (
    <div>
      <LogoContainer>
        <LogoPrefix>Re:</LogoPrefix>
        <LogoMain>Earth</LogoMain>
      </LogoContainer>
      {showSubtitle && (
        <LogoSubtitle>Restore the Planet</LogoSubtitle>
      )}
    </div>
  )
}

export default Logo
