import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import {
  GalleryContainer,
  ImageSlider,
  ImageSlide,
  Image,
  PlaceholderEmoji,
  Overlay,
  Dots,
  Dot,
  NavButton,
  Counter,
} from './PhotoGallery.styles'

const PhotoGallery = ({ photos = [], thumbnail, alt = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [failedImages, setFailedImages] = useState(new Set())
  const hasPhotos = photos.length > 0

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  if (!hasPhotos) {
    return (
      <GalleryContainer>
        <ImageSlide>
          <PlaceholderEmoji>{thumbnail}</PlaceholderEmoji>
        </ImageSlide>
      </GalleryContainer>
    )
  }

  return (
    <GalleryContainer>
      <ImageSlider $activeIndex={activeIndex}>
        {photos.map((photo, index) => (
          <ImageSlide key={index}>
            {failedImages.has(index) ? (
              <PlaceholderEmoji>{thumbnail}</PlaceholderEmoji>
            ) : (
              <Image
                src={photo}
                alt={`${alt} ${index + 1}`}
                loading="lazy"
                onError={() => {
                  setFailedImages(prev => new Set(prev).add(index))
                }}
              />
            )}
          </ImageSlide>
        ))}
      </ImageSlider>

      <Counter>{activeIndex + 1} / {photos.length}</Counter>

      {photos.length > 1 && (
        <>
          <NavButton $direction="prev" onClick={goToPrev}>
            <FiChevronLeft size={20} />
          </NavButton>
          <NavButton $direction="next" onClick={goToNext}>
            <FiChevronRight size={20} />
          </NavButton>

          <Overlay>
            <Dots>
              {photos.map((_, index) => (
                <Dot
                  key={index}
                  $active={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </Dots>
          </Overlay>
        </>
      )}
    </GalleryContainer>
  )
}

export default PhotoGallery
