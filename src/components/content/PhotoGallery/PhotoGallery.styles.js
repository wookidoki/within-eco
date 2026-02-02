import styled from 'styled-components'

export const GalleryContainer = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 16px;
  overflow: hidden;
`

export const ImageSlider = styled.div`
  display: flex;
  height: 100%;
  transition: transform 0.4s ease;
  transform: translateX(${({ $activeIndex }) => -$activeIndex * 100}%);
`

export const ImageSlide = styled.div`
  min-width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.surface},
    ${({ theme }) => theme.colors.background}
  );
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

export const PlaceholderEmoji = styled.span`
  font-size: 80px;
`

export const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 16px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
`

export const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
`

export const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => $active ? '#fff' : 'rgba(255,255,255,0.4)'};
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.8);
  }
`

export const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $direction }) => $direction === 'prev' ? 'left: 8px;' : 'right: 8px;'}
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;

  ${GalleryContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`

export const Counter = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 12px;
  font-weight: 600;
`
