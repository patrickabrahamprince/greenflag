const colors = require('tailwindcss/colors');

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
        // --- GreenFlag Luxury Emerald & Clean Light Pearlescent design system tokens ---
        // Palette
        crimson: '#059669',     // GreenFlag emerald primary
        wine: '#064E3B',        // Deep emerald accent
        'rose-tint': '#0F172A',
        // Elevation ramp: luxury clean light environment, frosted glass depth
        well: '#F1F5F9',
        base: '#F8FAFC',
        raised: '#FFFFFF',
        card: '#FFFFFF',
        overlay: '#0F172A',
        'ink-dark': '#020617',

        // --- Core & legacy token mappings ---
        cream: '#F8FAFC',
        ink: '#0F172A',
        black: '#0F172A',
        'black-deep': '#020617',
        gold: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          dark: '#B45309',
          ...colors.amber,
        },
        'gold-light': '#F59E0B',
        'gold-dark': '#B45309',
        emerald: {
          DEFAULT: '#059669',
          glow: '#10B981',
          ...colors.emerald,
        },
        'emerald-glow': '#10B981',
        blush: '#059669',
        violet: {
          DEFAULT: '#6366F1',
          ...colors.violet,
        },
        lavender: '#8B5CF6',
        surface: '#FFFFFF',
        'surface-light': '#F1F5F9',
        border: 'rgba(15, 23, 42, 0.08)',
        muted: 'rgba(15, 23, 42, 0.60)',
        indigo: {
          DEFAULT: '#059669',
          ...colors.indigo,
        },
      },
      fontFamily: {
        apple: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
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
      boxShadow: {
        'glow-crimson': '0 4px 20px -2px rgba(5,150,105,0.3)',
        'glow-crimson-sm': '0 2px 12px -2px rgba(5,150,105,0.2)',
        'glow-emerald': '0 4px 20px -2px rgba(5,150,105,0.3)',
        'glow-emerald-lg': '0 8px 30px -4px rgba(5,150,105,0.4)',
        'glow-gold': '0 4px 20px -2px rgba(217,119,6,0.3)',
        'glow-wine': '0 0 20px -10px rgba(6,78,59,0.4)',
        'flat-dark': '0 2px 8px rgba(15,23,42,0.08)',
        'depth-sm': '0 1px 3px rgba(15,23,42,0.06)',
        'depth-md': '0 4px 14px rgba(15,23,42,0.08)',
        'depth-lg': '0 8px 24px rgba(15,23,42,0.1)',
        'depth-xl': '0 12px 36px rgba(15,23,42,0.12)',
        'glass-card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.4s ease-in-out infinite',
        'logo-in': 'logoIn 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-up': 'sheetUp 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        'logo-pulse': 'logoPulse 1.4s ease-in-out infinite',
        'card-enter': 'cardEnter 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'match-card-left': 'matchCardInLeft 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'match-card-right': 'matchCardInRight 500ms cubic-bezier(0.16, 1, 0.3, 1) 80ms both',
        'match-glow': 'matchGlowPop 500ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both',
        'match-text': 'matchTextUp 260ms cubic-bezier(0.16, 1, 0.3, 1) 360ms both',
        'icon-bounce': 'iconBounce 600ms cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'icon-pulse': 'iconPulse 2s ease-in-out infinite',
        'icon-glow-pulse': 'iconGlowPulse 2.5s ease-in-out infinite',
        'icon-spin': 'iconSpin 4s linear infinite',
        'icon-scale-pulse': 'iconScalePulse 2s ease-in-out infinite',
        'float-up': 'floatUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-smooth': 'spinSmooth 2.5s linear infinite',
        'float-drift': 'floatDrift 5s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'confetti-pop': 'confettiPop 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'slide-in-left': 'slideInLeft 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        sheetUp: {
          '0%': { transform: 'translate3d(0, 100%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        logoIn: {
          '0%': { opacity: '0', transform: 'scale3d(0.9, 0.9, 1)' },
          '100%': { opacity: '1', transform: 'scale3d(1, 1, 1)' },
        },
        logoPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale3d(1, 1, 1)' },
          '50%': { opacity: '0.65', transform: 'scale3d(0.92, 0.92, 1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 16px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translate3d(0, -12px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        cardEnter: {
          '0%': { opacity: '0', transform: 'translate3d(0, 12px, 0) scale3d(0.98, 0.98, 1)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)' },
        },
        matchCardInLeft: {
          '0%': { opacity: '0', transform: 'translate3d(-30px, 16px, 0) rotate(-12deg) scale(0.92)' },
          '100%': { opacity: '1', transform: 'translate3d(-14px, 0, 0) rotate(-6deg) scale(1)' },
        },
        matchCardInRight: {
          '0%': { opacity: '0', transform: 'translate3d(30px, 16px, 0) rotate(12deg) scale(0.92)' },
          '100%': { opacity: '1', transform: 'translate3d(14px, 0, 0) rotate(6deg) scale(1)' },
        },
        matchGlowPop: {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '60%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        matchTextUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 10px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        iconBounce: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -6px, 0) scale(1.06)' },
        },
        iconPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.04)' },
        },
        iconGlowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.35))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.65))' },
        },
        iconSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        iconScalePulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' },
          '50%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 16px rgba(16,185,129,0.55))' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 20px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        spinSmooth: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floatDrift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '25%': { transform: 'translate3d(4px, -8px, 0)' },
          '50%': { transform: 'translate3d(0, -14px, 0)' },
          '75%': { transform: 'translate3d(-4px, -8px, 0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -6px, 0)' },
        },
        confettiPop: {
          '0%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
          '100%': { opacity: '0', transform: 'translate3d(var(--tx), var(--ty), 0) scale(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.6)' },
          '70%': { boxShadow: '0 0 0 16px rgba(16,185,129,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translate3d(-24px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translate3d(24px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
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
