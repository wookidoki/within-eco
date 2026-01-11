import { StyledPanel } from './Panel.styles'

const Panel = ({ children, ...props }) => {
  return (
    <StyledPanel {...props}>
      {children}
    </StyledPanel>
  )
}

export default Panel
