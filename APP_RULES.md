# GreenFlag — Master App Blueprint & Rules

> **The definitive product blueprint and architecture guide for GreenFlag.**
> All ongoing development, design decisions, and feature additions must adhere to the rules in this document.

---

## 1. What the App Is All About

**GreenFlag** is a **fun, vibrant, and engaging app that pushes people to take solo and group trips, meet new people, and explore natural dating connections along the way.**

### Core Pillars & User Journey
1. **Pushing Solo & Spontaneous Escapes**:
   - Inspires users to get out of the routine with curated day rides, sunrise fortress drives, scenic cafes, and hidden local gems.
   - Low-friction solo discovery: discover nearby spots, join open convoys, or hit the road independently.

2. **Group Trips & Community Convoys**:
   - Effortlessly organize or join verified group getaways: weekend coffee estate stays, beach camping, cliff treks, and road trips.
   - Built-in cost-splitting per person (fuel, snacks, entry) and designated city departure hubs.

3. **Meeting New People & Social Chemistry**:
   - Connect with verified explorers who share your exact travel pace, music playlists, and outdoor passions.
   - Safe, verified environments (100% ID verification, Female-Verified Circles, public daylight meetup options).

4. **Natural, Pressure-Free Dating**:
   - No awkward swipe-fatigue: romantic sparks happen organically through shared travel itineraries, sunrise drives, and mutual sparks.
   - Double-blind mutual interest: secret sparks and match vibes only reveal when both individuals are genuinely interested.

---

## 2. Visual Design System (Design Bomb Spec)

GreenFlag pairs high-energy engagement with an ultra-clean, minimalist luxury aesthetic:

| Token | Hex / Value | Role in the App |
| :--- | :--- | :--- |
| **Base Canvas** | `#F7F6EB` | Organic warm luxury cream background |
| **Deep Ink / Onyx** | `#141414` / `#18181B` | Bold titles, high-contrast action buttons, chips |
| **Electric Lime** | `#CEFF00` | High-energy nudges, active departure badges, spark indicators |
| **Hot Magenta** | `#FF3EBA` | Romantic sparks, dating matches, favorite hearts |
| **Champagne Gold** | `#D4AF37` | Elite verified host badges, boarding pass foil borders |
| **Borders & Dividers** | `#18181B]/[0.08]` | Subtle hairline cards, ticket notches, perforated dividers |

### Tone & UX Principles
- **Fun, Adventurous & Engaging**: Active counters, instant departure nudges, interactive radar maps, and rich trip itineraries.
- **Zero Cheap Emoji Clutter**: Use clean, crisp SVG icons from `lucide-react` (`MapPin`, `Compass`, `Sparkles`, `Users`, `Flame`, `Zap`, `Shield`, `Heart`, `Calendar`).
- **Boarding Pass & Passport Details**: Every trip feels like an authentic boarding pass ticket; user profiles double as verified Travel Passports with stamped badges.
- **Micro-Haptics**: Tactile feedback on all button presses, filter changes, and booking confirmations.

---

## 3. Core App Modules

### 🗺️ 1. Explore & Convoys Feed (`/trips`)
- **Interactive Proximity Radar**: View nearby travelers and upcoming departures in real-time.
- **Categorized Escapes**:
  - `Micro Dates & Cafe Meets (60m)`
  - `Sunrise Roadtrips & Convoys`
  - `Weekend Retreats & Getaways`
  - `100% Female-Verified Circles`
  - `Solo Traveler Matchups`
- **Luxury Boarding Pass Sheet**: View itinerary details, pickup spot, shared cost split, host trust score, and RSVP / Spark.

### 🛂 2. Travel Passport (`/passport`)
- **Explorer Identity**: Verified badges, home departure hub, and host level.
- **Travel DNA**: Solo travel style, roadtrip music vibes, sunrise vs. sunset preferences.
- **Route Stamps**: History of completed trips, convoys, and verified connections.

### 🚗 3. Host an Escape Wizard (`activeTab === 'create'`)
- 6-step flow to host a solo meetup, group convoy, or curated date.
- Departure hub auto-complete, route time estimates, and shared split calculator.

---

## 4. Technical Architecture & Deployment Workflow

- **Framework**: Next.js 16 (App Router), React, Tailwind CSS, TypeScript.
- **Native App**: Capacitor 8 (Android & iOS).
- **Backend**: Supabase (Auth, Postgres, Storage, RLS).
- **Live Production Endpoint**: `https://greenflag-dusky.vercel.app`

### 🚀 Production Deployment Sequence
Whenever updating the live Play Store app:
```bash
# 1. Verify build and TypeScript
npm run build

# 2. Sync native assets and plugins to Android
npx cap sync android

# 3. Deploy live production bundle to Vercel
npx vercel --prod --yes
```

---

## 5. Strict Guardrails

- ❌ **Never lose the Solo + Group + Dating balance**: The app is simultaneously about adventures, making friends, taking solo/group trips, and dating.
- ❌ **Never revert to plain generic swiping**: Keep the experience-driven, convoy-first identity.
- ❌ **Preserve the Design Bomb aesthetic**: Keep `#F7F6EB`, `#141414`, `#CEFF00`, `#FF3EBA`.
- ❌ **Never deploy unverified code**: Always run `npm run build` first.
