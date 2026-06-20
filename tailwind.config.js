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
        black: '#0A0A0A',
        'black-deep': '#080808',
        gold: '#D4AF37',
        'gold-light': '#E8C84A',
        'gold-dark': '#B8962F',
        blush: '#C4956A',
        surface: '#111111',
        'surface-light': '#161616',
        border: '#1E1E1E',
        muted: '#9A9A9A',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
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
