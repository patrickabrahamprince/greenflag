# GREENFLAG: Trips
> **Tagline:** *Don't just match. Go somewhere together.*

---

## Executive One-Pager

### 1. The Problem
Dating apps in India are experiencing systemic burnout:
* **68% of users admit to dating app fatigue** — driven by ghosting, infinite swipe loops, and superficial matches with zero real-world context.
* People want real-life context and genuine experiences, not endless digital small talk.

At the exact same time, solo travel across India is undergoing an unprecedented explosion:
* **Solo women travellers surged by 135%** between 2023 and 2025.
* **84% of Indians plan on travelling solo in 2025**.
* **Solo travel accounted for over 76.5% of all summer travellers in 2026**.

**The Gap:** People want to travel, but hesitate to travel completely alone. People want to date or meet new companions, but struggle with awkward first dates with zero shared intent. No single platform bridges real travel intent with verified, safe companionship in India.

---

### 2. The Idea
Introduce **Trips** as a core, native pillar inside Greenflag.

Instead of matching merely on curated photos, users match on **shared destination + matching dates + aligned travel vibe**.

---

### 3. How It Works (Inside Greenflag)

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│   Step 1: Create Trip     │      │   Step 2: Dual Discovery  │      │   Step 3: Join & Connect  │
│                           │      │                           │      │                           │
│ • Where: Coorg            │ ───► │ • Dating Feed: Green Badge│ ───► │ • Tap "Request to Join"   │
│ • When: 28–29 Sep         │      │   "📍 Coorg • 28 Sep"     │      │ • Host Accepts Request    │
│ • Vibe: Trek / Chill      │      │ • Dedicated Trips Feed:   │      │ • Safe Group Chat Unlocks │
│ • Need: 1 for bike split  │      │   Search by place & dates │      │   (No accept = No chat)   │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

1. **Create a Trip (30 seconds):**
   Any verified Greenflag member taps `+ New Trip`:
   * **Destination:** *e.g., Coorg, Hampi, Gokarna, Spiti, Pondicherry*
   * **Dates:** *e.g., 28–29 Sep*
   * **Vibe:** *Chill / Trek / Backpacking / Party*
   * **Trip Note:** *"Looking for 1 person to split a rental bike & homestay"*
2. **Dual-Channel Discovery:**
   * **Dating Profile Badge:** The user's profile card automatically gains an active travel badge: `📍 Coorg • 28 Sep` — instantly elevating their ranking and engagement in the Discover feed.
   * **Trips Feed:** The trip appears in the dedicated, searchable **Trips Feed**, filterable by destination, departure weekend, budget tier, and vibe.
3. **Intentional Join Requests (Safety Gated):**
   * An interested user taps `Request to Join`.
   * The host reviews the applicant's profile and standards.
   * **Only when the host accepts does chat unlock.** (No unsolicited DMs, no spam, no creepy messages).
   * Dating is natural and unforced: users connect as travel buddies first, with organic romance emerging through shared experiences.

---

### 4. Competitive Matrix: Why This Wins

| Dimension | Legacy Apps (Tinder / Bumble) | Travel Buddy Forums / Groups | Greenflag: Trips |
| :--- | :--- | :--- | :--- |
| **Matching Logic** | Superficial swipe on faces | Fragmented Telegram / WhatsApp / Reddit threads | **Aligned itinerary + destination + dates** |
| **First Interaction** | "Hey" / "WYD" with no real plan | Unvetted strangers, messy logistics | **"Let's split a cab to Coorg" (Instant plan)** |
| **Safety for Women** | Ghosting, unsolicited messages, no check-ins | Unverified strangers, unsafe offline meets | **Govt ID / Selfie verified + Female-Only Trip toggle + Host Approval Gate** |
| **Local Localization** | Westernized, English-first, Goa / Bali luxury focus | Unorganized local forums | **Multilingual (Kannada, Hindi, Tamil), domestic weekend getaways, budget-conscious (₹1,000–3,000/day)** |
| **Apple Positioning** | "Another dating clone" (Guideline 4.3 scrutiny) | Utility without social depth | **Travel Companion & Experiential Social Utility** |

---

### 5. Why Keep It Inside Greenflag (Rather than a Standalone App)?
1. **Zero Cold-Start User Cannibalization:** Leverage Greenflag’s existing authenticated user base, verified identity framework, and standard-matching algorithms without splitting brand equity across two apps.
2. **Organic High-Intent Acquisition (SEO & Word-of-Mouth):** Captures high-intent search traffic (e.g., *"Coorg travel buddy this weekend"*, *"Gokarna female travel partner"*) where organic competition is virtually zero.
3. **Decisive Apple App Store Review Advantage:** Solves Guideline 4.3 (Spam / Dating Clone). Greenflag becomes categorized as a **Travel Companion & Social Utility** featuring actionable real-world itineraries.

---
---

## Tailored Stakeholder Packs

### A. Team & Engineering Roadmap

#### Core Database Schema Additions (Supabase / PostgreSQL)
```sql
-- Trips table
create table trips (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references profiles(id) on delete cascade,
  destination text not null,
  state text,
  start_date date not null,
  end_date date not null,
  vibe text check (vibe in ('Chill', 'Trek', 'Backpacking', 'Party', 'Roadtrip', 'Workcation')),
  budget_per_day integer default 1500, -- in INR
  spots_available integer default 1,
  female_only boolean default false,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Trip join requests (Host approval gate)
create table trip_requests (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  applicant_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  intro_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(trip_id, applicant_id)
);
```

#### Key Technical & UX Deliverables
1. **Trip Creation Bottom Sheet:** Simple, 3-step rapid form with quick destination chips (*Coorg, Chikmagalur, Ooty, Hampi, Gokarna, Pondicherry*).
2. **Discover Feed Card Badge:** Injecting `<TripBadge destination={trip.destination} date={trip.startDate} />` over user cards in `DiscoverDeck.tsx`.
3. **Trips Tab (`app/(guest)/trips/page.tsx`):** Grid/list view with date filters (*This Weekend, Next Weekend, Custom Date*), destination search, and a `Female-Only` toggle.
4. **Safety & Moderation:** Trip flag/reporting pipeline tied directly to the existing admin moderation queue.

---

### B. Investor & Market Opportunity

#### 1. Market Tailwinds & Timing
* **The "Solo Social" Wave:** India’s domestic tourism market is projected to reach $150B+ by 2030, driven by Gen Z & Millennial disposable income. Solo travel is no longer a niche; it represents **over 76.5% of peak summer 2026 travel**.
* **Dating Market Saturation:** Dating app CAC has doubled year-over-year while Day-30 retention on swipe apps has plunged. Greenflag Trips shifts the dynamic from high-churn superficial swiping to **high-retention adventure collaboration**.

#### 2. Monetization Loops
* **Trip Boosts (Microtransactions via Coins):** Spend 200–500 Greenflag Coins to pin a trip to the top of the destination feed for 48 hours.
* **Travel Verified Badge:** Premium verification package including offline safety check-in features.
* **B2B Homestay / Hostel Affiliates:** Direct integration and referral revenue with boutique backpacker chains (e.g., Zostel, The Hosteller) for booked split stays.

#### 3. CAC & Viral Growth Engine
* **Ride & Room Splitting:** Every trip created inherently requires sharing a link with friends or on social media to fill remaining spots (*"Need 1 more for a bike trip to Coorg!"*), generating organic, zero-CAC viral invites.

---

### C. Apple Review & App Store Positioning

#### Category Reclassification Strategy
* **Primary Category:** `Travel > Travel Companions`
* **Secondary Category:** `Lifestyle > Social Networking`

#### Guideline 4.3 (Design & Utility) Defense
* **Utility-Driven:** Greenflag is not an endless swipe dating app. It delivers tangible utility: destination itinerary posting, ride/stay cost-sharing, and structured companionship matching.
* **Safety By Design (Guideline 1.2 User Generated Content):**
  * Mandatory host approval before any messaging channel opens.
  * Dedicated Female-Only trip filter preventing unsolicited interactions.
  * Instant block/report functionality on every trip card and message thread.
  * Zero anonymity: verified phone numbers and profile photo validation.

#### App Store Metadata Updates
* **Title:** `GreenFlag: Trips & Companions`
* **Subtitle:** `Travel Together & Connect`
* **Promotional Text:** `Don't just match. Go somewhere together. Discover verified travel companions, plan weekend getaways, and split trips safely.`
