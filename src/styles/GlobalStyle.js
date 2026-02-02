import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  /* Reset CSS */
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* 모바일 터치 최적화 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.6;
    min-height: 100vh;
    min-height: 100dvh; /* 모바일 동적 뷰포트 */
    overflow-x: hidden;
    /* 모바일 스크롤 최적화 */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: none;
  }

  /* 모바일 폰트 크기 조정 */
  @media (max-width: 480px) {
    html {
      font-size: 14px;
    }
  }

  #root {
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    color: inherit;
    /* 터치 최적화 */
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;

    /* 터치 피드백 */
    @media (hover: none) and (pointer: coarse) {
      &:active {
        opacity: 0.7;
        transform: scale(0.98);
      }
    }
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  input, textarea {
    font-family: inherit;
    font-size: inherit;
    border: none;
    outline: none;
    background: transparent;
    color: inherit;
    /* iOS 자동 확대 방지 */
    font-size: 16px;
    -webkit-appearance: none;
    border-radius: 0;
  }

  /* 링크 터치 최적화 */
  a {
    -webkit-touch-callout: none;
  }

  /* Safe Area 지원 */
  @supports (padding: env(safe-area-inset-bottom)) {
    body {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
  }

  /* Scrollbar 스타일 */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.glass};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Selection 스타일 */
  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
`

export default GlobalStyle
