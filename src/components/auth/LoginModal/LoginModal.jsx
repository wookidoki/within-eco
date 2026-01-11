import GoogleLoginButton from '../GoogleLoginButton'
import {
  Overlay,
  ModalContainer,
  LogoContainer,
  Logo,
  AppName,
  Tagline,
  Description,
  FeatureList,
  FeatureItem,
  FeatureIcon,
  FeatureText,
  Divider,
  DividerText,
  SkipButton,
  PrivacyNote,
} from './LoginModal.styles'

// 로그인 혜택 목록
const FEATURES = [
  { icon: '☁️', text: '클라우드에 진행상황 자동 저장' },
  { icon: '📱', text: '모든 기기에서 이어서 탐험' },
  { icon: '🏆', text: '랭킹 및 업적 시스템 참여' },
]

/**
 * 로그인 모달 컴포넌트
 * 온보딩 후 표시되어 Google 로그인 유도
 */
const LoginModal = ({ onSkip }) => {
  return (
    <Overlay>
      <ModalContainer>
        <LogoContainer>
          <Logo>🌍</Logo>
          <AppName>Re:Earth</AppName>
          <Tagline>경기도 생태 탐험 게임</Tagline>
        </LogoContainer>

        <Description>
          로그인하면 탐험 진행상황이 클라우드에 저장되어
          어디서든 이어서 플레이할 수 있어요
        </Description>

        <FeatureList>
          {FEATURES.map((feature, index) => (
            <FeatureItem key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureText>{feature.text}</FeatureText>
            </FeatureItem>
          ))}
        </FeatureList>

        <GoogleLoginButton />

        <Divider>
          <DividerText>또는</DividerText>
        </Divider>

        <SkipButton onClick={onSkip}>
          로그인 없이 시작하기
        </SkipButton>

        <PrivacyNote>
          로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          수집되는 정보: Google 계정 이메일, 프로필 이미지
        </PrivacyNote>
      </ModalContainer>
    </Overlay>
  )
}

export default LoginModal
