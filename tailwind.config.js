/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0A3622',
          800: '#0F4A2F',
          700: '#1B5E3F',
          600: '#27724F',
          500: '#338660',
        },
        earth: {
          clay: '#C67B5C',
          terracotta: '#B85042',
          sand: '#F5E6D3',
          stone: '#8B8680',
          ash: '#4A4A48',
        },
        accent: {
          gold: '#D4AF37',
          champagne: '#F7E7CE',
          pearl: '#FAFAF8',
          mist: '#F5F5F3',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
        mono: ['Space Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.43, 0.13, 0.23, 0.96)',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dawn': 'linear-gradient(to bottom, #F5E6D3 0%, #FAFAF8 50%, #F7E7CE 100%)',
        'gradient-dusk': 'linear-gradient(to bottom, #0A3622 0%, #1B5E3F 50%, #27724F 100%)',
      }
    },
  },
  plugins: [],
}