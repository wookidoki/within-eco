import styled from 'styled-components'

export const HUDContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;

  > * {
    pointer-events: auto;
  }
`

export const RightSection = styled.div`
  position: absolute;
  top: 0;
  left: 340px;
  right: 0;
  bottom: 0;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    left: 0;
    bottom: 50vh;
  }
`
