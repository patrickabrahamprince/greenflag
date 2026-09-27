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
        // --- GreenFlag Luxury Emerald & Obsidian Velvet design system tokens ---
        // Palette
        crimson: '#10B981',     // GreenFlag emerald primary
        wine: '#064E3B',        // Deep emerald wine
        'rose-tint': '#FFFFFF',
        // Elevation ramp: deep obsidian velvet environment, frosted glass depth
        well: '#0D0818',
        base: '#080511',
        raised: '#1A132B',
        card: '#120D22',
        overlay: '#090612',
        'ink-dark': '#080511',

        // --- Core & legacy token mappings ---
        cream: '#080511',
        ink: '#FFFFFF',
        black: '#0D0818',
        'black-deep': '#06040C',
        gold: '#F59E0B',        // Radiant Amber/Gold for coins and badges
        'gold-light': '#FDE047',
        'gold-dark': '#B45309',
        emerald: '#10B981',
        'emerald-glow': '#34D399',
        blush: '#10B981',
        violet: '#6366F1',
        lavender: '#8B5CF6',
        surface: '#120D22',
        'surface-light': '#1A132B',
        border: 'rgba(255, 255, 255, 0.1)',
        muted: 'rgba(255, 255, 255, 0.65)',
        indigo: '#10B981',
      },
      fontFamily: {
        // Apple SF Pro for admin panel
        apple: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Segoe UI', 'system-ui', 'sans-serif'],
        // Cabinet Grotesk, per the Dateasy design system
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
      boxShadow: {
        'glow-crimson': '0 4px 24px -2px rgba(16,185,129,0.45)',
        'glow-crimson-sm': '0 2px 14px -2px rgba(16,185,129,0.3)',
        'glow-emerald': '0 4px 24px -2px rgba(16,185,129,0.45)',
        'glow-emerald-lg': '0 8px 32px -4px rgba(16,185,129,0.6)',
        'glow-gold': '0 4px 20px -2px rgba(245,158,11,0.4)',
        'glow-wine': '0 0 24px -10px rgba(6,78,59,0.7)',
        'flat-dark': '0 4px 14px rgba(0,0,0,0.4)',
        'depth-sm': '0 2px 10px rgba(0,0,0,0.3)',
        'depth-md': '0 4px 20px rgba(0,0,0,0.4)',
        'depth-lg': '0 8px 30px rgba(0,0,0,0.5)',
        'depth-xl': '0 12px 40px rgba(0,0,0,0.6)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
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
        'icon-bounce': 'iconBounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1) infinite',
        'icon-pulse': 'iconPulse 2s ease-in-out infinite',
        // Mobbin-inspired animations for onboarding focus
        'icon-glow-pulse': 'iconGlowPulse 3s ease-in-out infinite',
        'icon-spin': 'iconSpin 6s linear infinite',
        'icon-scale-pulse': 'iconScalePulse 2.5s ease-in-out infinite',
        'float-up': 'floatUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        // Mobbin-inspired advanced animations
        'spin-smooth': 'spinSmooth 3s linear infinite',
        'float-drift': 'floatDrift 6s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'confetti-pop': 'confettiPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-left': 'slideInLeft 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slideInRight 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
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
        iconBounce: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.1)' },
        },
        iconPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        iconGlowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 12px rgba(210,4,45,0.4))' },
          '50%': { filter: 'drop-shadow(0 0 24px rgba(210,4,45,0.7))' },
        },
        iconSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        iconScalePulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 8px rgba(210,4,45,0.3))' },
          '50%': { transform: 'scale(1.08)', filter: 'drop-shadow(0 0 20px rgba(210,4,45,0.6))' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spinSmooth: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floatDrift: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-10px) translateX(5px)' },
          '50%': { transform: 'translateY(-20px) translateX(0px)' },
          '75%': { transform: 'translateY(-10px) translateX(-5px)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        confettiPop: {
          '0%': { opacity: '1', transform: 'translate(0, 0) scale(1)' },
          '100%': { opacity: '0', transform: 'translate(var(--tx), var(--ty))) scale(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(210,4,45,0.7)' },
          '70%': { boxShadow: '0 0 0 20px rgba(210,4,45,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(210,4,45,0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
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
