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
        // Consolidated to a single family (Bricolage Grotesque) app-wide --
        // these three keys stay separate only because dozens of existing
        // files already use font-sans/font-display/font-serif classes;
        // repointing all three here changes the whole app without touching
        // each file.
        display: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
      },
      animation: {
        // Kept inside the 150-300ms window on purpose -- these fire on
        // every screen/card transition, so anything slower reads as
        // sluggish rather than smooth. logo-in is the one deliberate
        // exception: a single branded moment on the login screen, not a
        // repeated UI response, so it's allowed to take its time.
        'fade-in': 'fadeIn 220ms ease-out',
        'slide-up': 'slideUp 240ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'shimmer': 'shimmer 1.4s ease-in-out infinite',
        'logo-in': 'logoIn 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-up': 'sheetUp 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        // Loops for as long as it's mounted, unlike logo-in's single
        // entrance -- used for the onboarding transition overlay and the
        // shared LoadingLogo indicator, both of which show for an
        // unknown/unbounded duration.
        'logo-pulse': 'logoPulse 1.4s ease-in-out infinite',
        'card-enter': 'cardEnter 220ms ease-out',
        'match-card-left': 'matchCardInLeft 620ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'match-card-right': 'matchCardInRight 620ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms both',
        'match-glow': 'matchGlowPop 620ms cubic-bezier(0.34, 1.56, 0.64, 1) 280ms both',
        'match-text': 'matchTextUp 300ms ease-out 480ms both',
      },
      keyframes: {
        sheetUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        logoIn: {
          '0%': { opacity: '0', transform: 'scale(0.82)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        logoPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.85)' },
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
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        matchCardInLeft: {
          '0%': { opacity: '0', transform: 'translate(-40px, 20px) rotate(-16deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translate(-18px, 0) rotate(-6deg) scale(1)' },
        },
        matchCardInRight: {
          '0%': { opacity: '0', transform: 'translate(40px, 20px) rotate(16deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translate(18px, 0) rotate(6deg) scale(1)' },
        },
        matchGlowPop: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { opacity: '1', transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        matchTextUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      maxWidth: {
        'app': '480px',
      },
      spacing: {
        // viewport-fit=cover (app/layout.tsx) extends content edge-to-edge
        // under the notch/status bar/home indicator so full-bleed
        // backgrounds actually reach the true screen edges -- these give
        // headers and bottom-pinned buttons a way to inset themselves from
        // that same edge without clipping the background around them.
        // max() keeps a sane minimum gap on notch-less devices, where
        // env(safe-area-inset-*) resolves to 0.
        'safe-top': 'max(1.5rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1.5rem, env(safe-area-inset-bottom))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
