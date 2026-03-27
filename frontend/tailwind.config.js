/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        afro: {
          950: '#05050f',
          900: '#0a0a1a',
          800: '#0f0f28',
          700: '#1a1a3e',
          600: '#252550',
          500: '#3d3d80',
          400: '#6060b0',
          300: '#9090d0',
          gold:   '#d4a017',
          amber:  '#f59e0b',
          green:  '#10b981',
          red:    '#ef4444',
          purple: '#8b5cf6',
          blue:   '#3b82f6',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-ring':  'pulseRing 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':     'fadeIn 0.4s ease-out both',
        'slide-up':    'slideUp 0.4s ease-out both',
        'slide-right': 'slideRight 0.35s ease-out both',
        'scale-in':    'scaleIn 0.3s ease-out both',
        'spin-slow':   'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseRing: {
          '0%,100%': { opacity: '1',   transform: 'scale(1)'    },
          '50%':     { opacity: '0.5', transform: 'scale(1.06)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)'     },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to:   { opacity: '1', transform: 'scale(1)'    },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(212,160,23,0.3)' },
          to:   { boxShadow: '0 0 30px rgba(212,160,23,0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
