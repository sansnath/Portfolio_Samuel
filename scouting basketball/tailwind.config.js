/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand palette
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Dark surface palette
        dark: {
          950: '#030712',
          900: '#0a0f1a',
          850: '#0d1424',
          800: '#111827',
          750: '#141d2e',
          700: '#1a2540',
          600: '#1e2d4a',
          500: '#243354',
        },
        // Cluster colors
        cluster: {
          shooter:   '#f97316',
          energy:    '#22c55e',
          interior:  '#ef4444',
          playmaker: '#3b82f6',
          stretch:   '#06b6d4',
          superstar: '#f59e0b',
          wing:      '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'court': "url('/court-bg.svg')",
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(249,115,22,0.35)',
        'glow-blue':   '0 0 20px rgba(59,130,246,0.35)',
        'glow-gold':   '0 0 20px rgba(245,158,11,0.35)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                     to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 10px rgba(249,115,22,0.3)' }, '50%': { boxShadow: '0 0 30px rgba(249,115,22,0.7)' } },
      },
    },
  },
  plugins: [],
}
