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
        // --- Obsidian Velvet design system tokens (source of truth) ---
        // Palette
        crimson: '#D2042D',
        wine: '#45050C',
        // Was a soft blush pink (#F0BCC5) -- now pure white. Still a
        // light fill, so the contrast direction (dark text on top) is
        // unchanged; only the hue moved.
        'rose-tint': '#FFFFFF',
        // Elevation ramp: black environment, depth is a step up this ramp
        // -- never a shadow, never a gradient. `card` and `base` are now
        // the same value (both pure black) -- cards read as part of the
        // same black field instead of a lighter surface. The bottom nav
        // is the one deliberate exception (#1A1A1A, hardcoded on
        // .nav-glass in globals.css, not this token) so it still reads as
        // a distinct floating layer against a now-identical card/base.
        well: '#0F0A0A',
        base: '#000000',
        raised: '#2A1519',
        card: '#000000',
        // Was #241014 -- read as a lighter reddish-brown against the rest
        // of the now-black app on the Terms sheet and every other
        // BottomSheet-based surface (login options, permission primers,
        // profile-detail pickers). Darkened toward the same black
        // environment while keeping a faint wine undertone.
        overlay: '#150A0C',
        // Crimson is dark/saturated -- fills using it need WHITE text
        // (use text-ink, already white). rose-tint (now white) is a
        // light fill and needs dark text -- that's what ink-dark is for,
        // now pure black to match.
        'ink-dark': '#000000',

        // --- Legacy token names, repointed to the new palette ---
        // Kept so existing call sites across the app (bg-cream, text-ink,
        // bg-gold, etc.) keep working without editing each one -- same
        // trick the Dateasy migration used. IMPORTANT DIFFERENCE from that
        // migration: Mindaro (the previous `gold`) was a LIGHT fill, so
        // every bg-gold call site was paired with text-ink-dark. Crimson
        // is a DARK, saturated fill -- the opposite contrast need. Every
        // bg-gold + text-ink-dark pairing from the Dateasy pass has been
        // swept file-by-file to text-ink (white) alongside this token
        // change; see the accompanying commit for the list.
        cream: '#000000',       // was Persian Indigo bg -> now Neutral black
        ink: '#FFFFFF',         // unchanged -- primary text stays white
        black: '#0F0A0A',       // now well (recessed)
        'black-deep': '#0F0A0A',// now well (recessed)
        gold: '#D2042D',        // was Mindaro (light) -> now Crimson (dark) -- contrast flips
        'gold-light': '#D2042D',
        'gold-dark': '#45050C', // was Electric Violet -> now Wine
        blush: '#D2042D',       // was Pinkish Red -> unified with Crimson (one red family)
        violet: '#45050C',      // was Electric Violet -> now Wine
        // Never repointed when the rest of the old Dateasy palette was --
        // every bg-lavender/border-lavender call site (Gift icon button,
        // interest-picker chip borders, match confetti, profile photo-slot
        // outlines) has been silently rendering with NO color at all since
        // that migration, not a wrong color. Wine is the closest surviving
        // "cool/secondary" tone in the locked palette.
        lavender: '#45050C',
        surface: '#000000',     // dark background
        'surface-light': '#2A1519', // slightly lighter dark (same as raised)
        border: '#4a4a6a',      // dark border color
        muted: '#FFFFFF99',     // unchanged -- 60% white
        // bottom-nav.tsx's active-tab disc (dark disc on the light pill,
        // was Persian Indigo) -- kept as its own token since "well"/"base"
        // read ambiguously in that file; same near-black as base.
        indigo: '#000000',
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
        'glow-crimson': '0 0 30px -10px rgba(210,4,45,0.6)',
        'glow-crimson-sm': '0 0 20px -8px rgba(210,4,45,0.4)',
        'glow-wine': '0 0 24px -10px rgba(69,5,12,0.7)',
        'flat-dark': '0 4px 14px rgba(0,0,0,0.4)',
        'depth-sm': '0 2px 8px rgba(210,4,45,0.15)',
        'depth-md': '0 4px 16px rgba(210,4,45,0.2)',
        'depth-lg': '0 8px 24px rgba(210,4,45,0.25)',
        'depth-xl': '0 12px 32px rgba(210,4,45,0.3)',
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
