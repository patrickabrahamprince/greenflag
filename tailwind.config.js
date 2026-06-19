/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'green-900': '#0D3D0D',
        'green-800': '#1A4D1A',
        'green-700': '#2D5F2D',
        'green-600': '#4A7A4A',
        'green-400': '#8FAE8F',
        'gold': '#D4AF37',
        'gold-light': '#F4E4BC',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'card': '0 10px 40px rgba(13, 61, 13, 0.5)',
        'card-lg': '0 20px 60px rgba(13, 61, 13, 0.6)',
      },
    },
  },
  plugins: [],
};
