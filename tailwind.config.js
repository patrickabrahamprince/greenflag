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
        // --- Dateasy design system tokens (source of truth) ---
        // Palette
        mindaro: '#D7FF81',
        lavender: '#BC96FF',
        indigo: '#371F7D',
        'electric-violet': '#612AFF',
        'pinkish-red': '#FC4363',
        // Elevation ramp: one continuous dark-purple environment, depth is
        // a step up this ramp -- never a shadow, never a gradient.
        well: '#1B103B',
        base: '#371F7D',
        raised: '#4A2A8C',
        card: '#522E98',
        overlay: '#5722A4',
        // Mindaro/Lavender are light fills -- text/icons on them must be
        // dark, never white. Use text-ink-dark on bg-accent/bg-lavender.
        'ink-dark': '#371F7D',

        // --- Legacy token names, repointed to the new palette ---
        // Kept so ~470 existing call sites across the app (bg-cream,
        // text-ink, bg-gold, etc.) keep working without editing each one --
        // same trick the previous theme migration in this repo used. Real
        // per-usage contrast fixes (bg-accent + text-white pairings that
        // are now unreadable) are swept separately, file by file, not by
        // changing what these names resolve to.
        cream: '#371F7D',       // was near-black bg -> now Persian Indigo (base)
        ink: '#FFFFFF',         // unchanged -- primary text stays white
        black: '#1B103B',       // was near-black -> now well (recessed)
        'black-deep': '#1B103B',// was near-black -> now well (recessed)
        gold: '#D7FF81',        // was magenta accent -> now Mindaro
        'gold-light': '#D7FF81',
        'gold-dark': '#612AFF', // was dark magenta -> now Electric Violet
        blush: '#FC4363',       // was magenta -> now Pinkish Red (like/heart)
        violet: '#612AFF',      // was #7C3AED -> now Electric Violet exactly
        surface: '#522E98',     // was nearly-black card bg -> now card
        'surface-light': '#4A2A8C', // was dark gray -> now raised
        border: '#4A2A8C',      // was dark gray -> now raised
        muted: '#FFFFFF99',     // unchanged -- 60% white
      },
      fontFamily: {
        // Cabinet Grotesk, per the Dateasy design system. These three keys
        // stay separate only because dozens of existing files already use
        // font-sans/font-display/font-serif classes; repointing all three
        // here changes the whole app without touching each file.
        display: ['var(--font-cabinet-grotesk)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-cabinet-grotesk)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cabinet-grotesk)', 'system-ui', 'sans-serif'],
      },
      // Type scale from the design deck. Sizes given in px for the ratio,
      // Tailwind stores them in rem (÷16) with a paired line-height.
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.05', fontWeight: '800' }],  // 40/1.05, weight 800
        title: ['1.75rem', { lineHeight: '1.15', fontWeight: '700' }],   // 28/1.15, weight 700
        heading: ['1.25rem', { lineHeight: '1.25', fontWeight: '700' }], // 20/1.25, weight 700
        body: ['0.9375rem', { lineHeight: '1.45', fontWeight: '400' }],  // 15/1.45, weight 400
        label: ['0.8125rem', { lineHeight: '1.3', fontWeight: '500' }],  // 13/1.3, weight 500
        caption: ['0.6875rem', { lineHeight: '1.3', fontWeight: '500' }],// 11/1.3, weight 500
      },
      // Named radii from the deck -- applied per-component by element
      // size, never via a bulk rounded-xl -> rounded-2xl regex (that
      // makes small elements like badges and 32px avatars look blobby).
      borderRadius: {
        pill: '999px',
        card: '24px',
        photo: '20px',
        tile: '16px',
        sheet: '28px',
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
