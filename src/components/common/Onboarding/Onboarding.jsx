import { useState } from 'react'
import {
  Overlay,
  Container,
  StepIndicator,
  StepDot,
  IconContainer,
  Title,
  GradientText,
  Description,
  FeatureList,
  FeatureItem,
  FeatureIcon,
  FeatureText,
  ButtonRow,
  SkipButton,
  NextButton,
} from './Onboarding.styles'

const STEPS = [
  {
    icon: '🌍',
    title: (
      <>
        <GradientText>Re:Earth</GradientText>에<br />오신 것을 환영해요!
      </>
    ),
    description: '경기도의 소중한 환경 데이터를 복구하고, 지구를 되살리는 여행을 시작해보세요.',
    features: null,
  },
  {
    icon: '🗺️',
    title: '탐험하고 배워요',
    description: '지도에서 에코 스팟을 발견하고, 각 장소의 환경적 가치를 알아보세요.',
    features: [
      { icon: '📍', text: '경기도 곳곳의 친환경 명소 발견' },
      { icon: '📊', text: '환경 데이터와 통계 확인' },
      { icon: '💡', text: '재미있는 환경 지식 학습' },
    ],
  },
  {
    icon: '🎯',
    title: '미션을 완료해요',
    description: '각 장소에서 미션을 완료하고 데이터를 복구하세요!',
    features: [
      { icon: '📡', text: '현장에서 데이터 복구하기' },
      { icon: '💾', text: '탐험 일지에 기록 저장' },
      { icon: '🏆', text: 'XP 획득하고 레벨업!' },
    ],
  },
  {
    icon: '🚀',
    title: '탐험을 시작해요!',
    description: '지도에서 초록색 마커를 클릭하면 에코 스팟 정보를 볼 수 있어요.',
    features: [
      { icon: '🌱', text: '첫 번째 에코 스팟을 방문해보세요' },
      { icon: '📸', text: '사진을 찍고 추억을 남겨요' },
      { icon: '🌳', text: '지구를 함께 복원해요!' },
    ],
  },
]

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <Overlay>
      <Container>
        <StepIndicator>
          {STEPS.map((_, index) => (
            <StepDot key={index} $active={index === currentStep} />
          ))}
        </StepIndicator>

        <IconContainer>{step.icon}</IconContainer>

        <Title>{step.title}</Title>
        <Description>{step.description}</Description>

        {step.features && (
          <FeatureList>
            {step.features.map((feature, index) => (
              <FeatureItem key={index}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureText>{feature.text}</FeatureText>
              </FeatureItem>
            ))}
          </FeatureList>
        )}

        <ButtonRow>
          {!isLastStep && (
            <SkipButton onClick={handleSkip}>건너뛰기</SkipButton>
          )}
          <NextButton onClick={handleNext}>
            {isLastStep ? '시작하기!' : '다음'}
          </NextButton>
        </ButtonRow>
      </Container>
    </Overlay>
  )
}

export default Onboarding
