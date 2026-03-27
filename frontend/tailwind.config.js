/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        afro: {
          900: '#0a0a1a',
          800: '#12122a',
          700: '#1a1a3e',
          600: '#252550',
          500: '#3d3d80',
          400: '#6060b0',
          300: '#9090d0',
          gold: '#d4a017',
          amber: '#f59e0b',
          green: '#10b981',
          red: '#ef4444',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      animation: {
        'pulse-ring': 'pulseRing 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
