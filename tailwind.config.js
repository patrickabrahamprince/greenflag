/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#0B0614',
        ink: '#FFFFFF',
        black: '#1A1A1A',
        'black-deep': '#0A0A0A',
        gold: '#C026D3',
        'gold-light': '#E879F9',
        'gold-dark': '#86198F',
        blush: '#C026D3',
        violet: '#7C3AED',
        surface: '#111111',
        'surface-light': '#1C1C1E',
        border: '#2A2A2A',
        muted: '#FFFFFF99',
      },
      fontFamily: {
        // Consolidated to a single family (Poppins) app-wide -- these three
        // keys stay separate only because dozens of existing files already
        // use font-sans/font-display/font-serif classes; repointing all
        // three here changes the whole app without touching each file.
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
        'slide-down': 'slideDown 400ms ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      maxWidth: {
        'app': '480px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
