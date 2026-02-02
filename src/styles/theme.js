// Re:Earth 테마 - 복구, 데이터, 미래 컨셉

// 공통 테마 값
const common = {
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '32px',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },

  // Re:Earth 브랜드 컬러
  brand: {
    primary: '#00FF94',    // Bio Green - 회복, 생명
    secondary: '#00D4FF',  // Hologram Blue - 데이터, 정보
    danger: '#FF2A6D',     // Glitch Red - 경고, 파괴된 미래
    accent: '#FF0099',     // Hot Pink - 글리치 효과
  },
}

// 라이트 모드 (기본)
export const lightTheme = {
  ...common,
  colors: {
    primary: '#00CC76',
    secondary: '#00B8E6',
    danger: '#FF2A6D',
    accent: '#FF0099',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    glass: 'rgba(0, 0, 0, 0.05)',
    warning: '#FFB800',
    text: '#1A1A2E',
    textSecondary: '#A0A0A0',
    border: 'rgba(0, 0, 0, 0.1)',
  },

  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
  },

  shadows: {
    glow: '0 0 20px rgba(0, 204, 118, 0.2)',
    glowDanger: '0 0 20px rgba(255, 42, 109, 0.2)',
    glowAccent: '0 0 20px rgba(255, 0, 153, 0.2)',
    card: '0 8px 32px rgba(0, 0, 0, 0.08)',
  },
}

// 다크 모드 - Re:Earth 메인 테마
export const darkTheme = {
  ...common,
  colors: {
    primary: '#00FF94',      // Bio Green - 회복, 생명
    secondary: '#00D4FF',    // Hologram Blue - 데이터, 정보
    danger: '#FF2A6D',       // Glitch Red - 경고, 파괴된 미래
    accent: '#FF0099',       // Hot Pink - 글리치 효과
    background: '#0B101A',   // Deep Space
    surface: '#151C28',      // 카드/패널 배경
    glass: 'rgba(12, 12, 12, 0.75)',  // 더 깊고 진한 다크 글래스
    warning: '#FFB800',
    text: '#FFFFFF',         // text_main
    textSecondary: '#A0A0A0', // text_muted
    border: 'rgba(255, 255, 255, 0.1)',
  },

  glassmorphism: {
    background: 'rgba(12, 12, 12, 0.75)',  // bg_glass
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
  },

  shadows: {
    glow: '0 0 30px rgba(0, 255, 148, 0.4)',
    glowSecondary: '0 0 30px rgba(0, 212, 255, 0.4)',
    glowDanger: '0 0 30px rgba(255, 42, 109, 0.4)',
    glowAccent: '0 0 30px rgba(255, 0, 153, 0.4)',
    card: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
}

// 기본 내보내기 (다크 모드 - Re:Earth 기본)
export default darkTheme
