# GreenFlag — App Rules & Master Specification

> **Official product and architectural blueprint for GreenFlag (Travel + Dating App).**
> Any future feature, refactor, or UI update MUST adhere strictly to the rules defined in this document.

---

## 1. What the App Is All About

**GreenFlag** is a premium **Travel + Dating** mobile application. It enables verified travelers and singles to connect over shared experiences, curated road trips, weekend retreats, cafe crawls, and sunrise convoys.

### Core Value Proposition
- **Experience-First Dating**: People connect over shared journey plans (e.g. dawn cloud drives, artisan single-origin coffee tastings, cliff-edge hikes, secluded beach circles) rather than superficial swiping.
- **100% ID Verified & Escort-Free**: Mandatory verification protocols, verified badge levels, and trust scoring.
- **Safe & Curated Circles**: Dedicated Female-Verified circles and public meetup protocols for initial micro-dates.
- **Double-Blind Matching**: Mutual affinity and secret sparks only reveal when both individuals express shared interest.

---

## 2. Visual Design System & Aesthetics (Design Bomb Spec)

The app follows the minimalist luxury aesthetic inspired by **Design Bomb**:

| Token | Hex / Value | Purpose |
| :--- | :--- | :--- |
| **Base Canvas** | `#F7F6EB` | Warm, organic luxury cream backdrop |
| **Deep Ink / Onyx** | `#141414` / `#18181B` | Primary typography, deep buttons, header text |
| **Electric Lime** | `#CEFF00` | Energy accents, confirmation tags, spark badges |
| **Hot Magenta** | `#FF3EBA` | Romantic sparks, match signals, heart highlights |
| **Champagne Gold** | `#D4AF37` | Boarding pass foil, trust badges, elite verification |
| **Subtle Borders** | `#18181B]/[0.08]` | Hairline borders, perforated divider lines |

### Design Rules
1. **Zero Emojis in Core UI**: Use crisp SVG icons from `lucide-react` (e.g. `MapPin`, `Sparkles`, `Compass`, `Shield`, `Heart`, `Clock`). Do not use emoji graphics in headers, chips, or titles.
2. **Editorial Boarding Pass Aesthetics**: Ticket perforations, notch cutouts, clean barcode badges, and structured passport stamp aesthetics.
3. **Typography**: High contrast, bold uppercase tracking for metadata (`text-[9px] tracking-[0.2em] font-bold uppercase`), smooth rounded sans-serif for headlines.
4. **Haptics**: Always trigger `hapticTap()`, `hapticSuccess()`, or `hapticWarning()` on touch interactions.

---

## 3. Core App Modules & Navigation

### 1. Discover / Explore (`/trips`)
- **Radar & Convoy Feed**: Curated dawn expeditions, artisan coffee trails, female circles, and starlight ridge climbs.
- **Filter Pills**: `All Escapes`, `Micro Dates (60m)`, `Sunrise Convoys`, `Weekend Getaways`, `Female Circles`.
- **Hero Scenery & Ticket Cards**: Each card displays destination, departure hub, split cost per person, host explorer level, and shared vibe tags.
- **Boarding Pass Slide-Up Sheet**: Full itinerary, host trust rating, verified pickup location, and instant RSVP / Spark.

### 2. Travel Passport (`/passport`)
- **Traveler Identity**: Verified identity badge, passport tier, home airport/city hub.
- **Traveled Routes & Convoys**: Past completed expeditions and stamped locations.
- **Dating & Travel Preferences**: Early riser vs. night owl, soundtrack preferences, coffee style, travel pace.

### 3. Escape Host Wizard (`activeTab === 'create'`)
- 6-step guided experience to host a micro-date, day roadtrip, or weekend getaway.
- Automatic route time, distance calculation, pickup hub selector, and shared fuel/snack split calculator.

---

## 4. Technical Stack & Deployment Protocol

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, TypeScript.
- **Native Bridge**: Capacitor 8 (Android & iOS).
- **Backend & Database**: Supabase (Auth, PostgreSQL, Storage, Edge Functions).
- **Payments**: Razorpay (Webhooks, verified payment orders).
- **Production Server**: `https://greenflag-dusky.vercel.app`

### 📱 Android & Play Store Deployment Workflow
The live Play Store binary uses Capacitor configured with `server: { url: 'https://greenflag-dusky.vercel.app' }`. This means production updates deploy instantly to live users.

**Every deployment must run in this sequence:**
```bash
# 1. Verify build & types
npm run build

# 2. Synchronize native Android assets and plugins
npx cap sync android

# 3. Deploy live production bundle to Vercel
npx vercel --prod --yes
```

---

## 5. Strict Guardrails (What NOT to Do)

- ❌ **Never replace the Travel Dating core** with generic unstyled dating templates or plain airline ticket booking clones.
- ❌ **Never remove the Design Bomb color theme** (`#F7F6EB`, `#141414`, `#CEFF00`, `#FF3EBA`).
- ❌ **Never introduce generic cartoon emojis** into the primary UI components.
- ❌ **Never push broken code**: Always run `npm run build` to confirm 0 TypeScript / Lint errors before syncing or deploying.
