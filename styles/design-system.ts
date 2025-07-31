export const colors = {
  // Primary palette - Deep nature
  forest: {
    900: '#0A3622',
    800: '#0F4A2F',
    700: '#1B5E3F',
    600: '#27724F',
    500: '#338660',
  },
  
  // Earth tones
  earth: {
    clay: '#C67B5C',
    terracotta: '#B85042',
    sand: '#F5E6D3',
    stone: '#8B8680',
    ash: '#4A4A48',
  },
  
  // Luxury accents
  accent: {
    gold: '#D4AF37',
    champagne: '#F7E7CE',
    pearl: '#FAFAF8',
    mist: '#F5F5F3',
  },
  
  // Functional
  neutral: {
    900: '#0F0F0F',
    800: '#1A1A1A',
    700: '#2D2D2D',
    600: '#404040',
    500: '#737373',
    400: '#A6A6A6',
    300: '#D9D9D9',
    200: '#E6E6E6',
    100: '#F5F5F5',
    50: '#FAFAFA',
  }
}

export const typography = {
  fontFamily: {
    serif: "'Playfair Display', 'Georgia', serif",
    sans: "'Inter', 'Helvetica Neue', sans-serif",
    mono: "'Space Mono', 'Courier New', monospace",
  },
  
  fontSize: {
    '6xl': '4.5rem',    // 72px
    '5xl': '3.75rem',   // 60px
    '4xl': '3rem',      // 48px
    '3xl': '2.25rem',   // 36px
    '2xl': '1.875rem',  // 30px
    'xl': '1.5rem',     // 24px
    'lg': '1.25rem',    // 20px
    'base': '1.125rem', // 18px
    'sm': '1rem',       // 16px
    'xs': '0.875rem',   // 14px
  },
  
  letterSpacing: {
    tightest: '-0.04em',
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.04em',
    widest: '0.08em',
  }
}

export const spacing = {
  // Based on 8px grid with golden ratio
  0: '0',
  1: '0.5rem',   // 8px
  2: '1rem',     // 16px
  3: '1.5rem',   // 24px
  4: '2rem',     // 32px
  5: '3rem',     // 48px
  6: '4rem',     // 64px
  7: '6rem',     // 96px
  8: '8rem',     // 128px
  9: '12rem',    // 192px
  10: '16rem',   // 256px
}

export const animations = {
  // Smooth, premium transitions
  transition: {
    instant: '100ms ease',
    fast: '200ms ease',
    base: '300ms ease',
    slow: '500ms ease',
    slower: '700ms ease',
  },
  
  // Elegant easings
  ease: {
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    premium: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)',
  }
}

export const effects = {
  shadow: {
    subtle: '0 2px 8px rgba(0, 0, 0, 0.04)',
    soft: '0 4px 16px rgba(0, 0, 0, 0.08)',
    medium: '0 8px 32px rgba(0, 0, 0, 0.12)',
    large: '0 16px 48px rgba(0, 0, 0, 0.16)',
    glow: '0 0 40px rgba(212, 175, 55, 0.15)',
  },
  
  blur: {
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  }
}