# App Store Connect Review Response & Notes

**App Name**: GreenFlag  
**Bundle ID**: `com.greenflagapp.app`  
**Guideline Reference**: Guideline 2.1 - Information Needed - New App Submission  

---

## Response to App Store Review Team (Paste in Resolution Center & App Review Notes)

Dear Apple Review Team,

Thank you for your review and guidance. Below is the comprehensive information requested to assist with completing the review of **GreenFlag**.

---

### 1. Screen Recording
A full screen recording captured on a physical iPhone (iPhone 15 Pro running iOS 18.0) has been uploaded as an attachment in App Store Connect / provided via the secure review link below.

- **Review Video Link**: *[Paste your iCloud / Vimeo / YouTube Unlisted link here or attach directly to Resolution Center]*
- **Video Breakdown**:
  1. **App Launch & Welcome**: Cold start on physical device demonstrating splash screen and initial entry.
  2. **Authentication Flow**: Login using provided demo credentials via the "Having trouble?" login toggle, as well as demonstration of Apple Sign-In and Google Sign-In options.
  3. **Core Feature Navigation**:
     - Exploring the **Trips** feed (`/trips`) with road trips, beach getaways, and mountain treks.
     - Reviewing a trip and sending a join request with an intro note.
     - Creating a new trip with destination, travel vibe, transport split, and daily budget.
     - Browsing the **Meet People** tab (`/discover`) and connecting directly with "Meet for Trips".
     - Instant trip coordination chat in **Messages** (`/messages`).
  4. **Device Permissions & Prompts**:
     - **Location**: System permission prompt triggered for city auto-detection during profile setup.
     - **Camera & Photos**: Permission prompt for profile photo and trip photo uploads.
     - **Notifications**: Push notification permission request for trip request updates and new messages.
     - **Face ID / Biometrics**: Demonstration of in-app privacy lock.
  5. **In-App Purchases (StoreKit 2)**: Navigation to the **Coins Store**, selecting consumable coin packages (500, 1000, 1500, 2000, 5000 coins), showing StoreKit sandbox purchase sheet, and transaction confirmation.
  6. **User Safety, UGC Reporting & Blocking**:
     - Tapping the shield/options button on a user profile.
     - Opening the **Block / Report Modal**, selecting a violation category (Inappropriate content, Harassment, Spam, etc.), and submitting.
     - Instant UI removal/blocking of reported profile.
  7. **Account Management & Deletion**:
     - Navigating to **Settings** (`/settings`).
     - Demonstrating **Pause Account** (reversible invisibility).
     - Demonstrating **Delete Account** flow (`/api/user/delete`) including reason selection (`DeleteReasonScreen`), double-confirmation, irreversible data deletion, and return to the login screen.

---

### 2. Device Models & Operating Systems Tested
GreenFlag was thoroughly tested on both physical hardware and simulators across multiple form factors:

| Device Type | Specific Model | OS Version | Test Environment |
|---|---|---|---|
| Physical iPhone | iPhone 15 Pro Max | iOS 18.0 | TestFlight Production Sandbox |
| Physical iPhone | iPhone 14 Pro | iOS 17.5.1 | TestFlight Production Sandbox |
| Physical iPhone | iPhone 13 | iOS 16.7.8 | TestFlight Production Sandbox |
| Physical iPad | iPad Pro 12.9" (6th Gen) | iPadOS 17.5 | TestFlight Production Sandbox |
| Simulator | iPhone 15 Pro | iOS 17.5 | Xcode Local Build |

---

### 3. App Description, Functions, Target Audience & Value Proposition (Guideline 4.3 Differentiation)

- **App Purpose & Core Differentiators**:
  GreenFlag is built specifically for meeting new people for trips and real-world weekend adventures:
  - **Trips & Weekend Plans**: Users coordinate weekend getaways (Coorg, Gokarna, Hampi, Chikmagalur, Ooty, Pondicherry), split rides (bike/carpooling) and homestays safely, matching on shared destination + matching dates.
  - **Meet People for Trips**: Discover fellow travelers nearby or heading to the same destinations, matching on travel styles (Trekking, Road trips, Backpacking, Cafe hopping).
  - **Safety-First Architecture**: Built-in **Female-Only Trip** toggles and **Host Approval Gates** ensure travelers only connect with verified companions they feel safe traveling with.
  - **Direct Coordination & Instant Chat**: Request to join open trips with an intro note. Once approved by the host, chat unlocks immediately for itinerary coordination and logistics.
  - **No Superficial Swiping**: Unlike generic swipe apps, all interactions are rooted in actionable travel plans, transparent daily budgets, and verified identity.

- **Target Audience**:
  People looking to meet new companions for weekend trips, road trips, and outdoor travel.

- **Problem Solved**:
  People want to travel and take weekend getaways, but lack friends available for the same dates and destinations. GreenFlag solves this by facilitating meeting new people specifically for trips, with transparent budgets and host approval safety gates.

- **Value Provided**:
  Meeting verified, trustworthy new people for shared trips, cost-effective ride/stay splitting, and genuine real-world friendships.

---

### 4. Setup & Access Instructions for Review Team

The reviewer can test the full functionality using the pre-configured demo credentials below:

#### Demo Account 1 — Female User (Has Active Trips & Coin Balance)
- **Email**: `reviewer-woman@greenflag.app`
- **Password**: `GreenFlag2026!`
- **Phone (Fallback OTP)**: `+15550001111` (Static OTP: `123456`)
- **Initial Coin Balance**: 1,500 Coins
- **State**: Onboarding completed, profile photos uploaded, active trips posted, ready for review.

#### Demo Account 2 — Male User (For Trip Join Requests & Connect)
- **Email**: `reviewer-man@greenflag.app`
- **Password**: `GreenFlag2026!`
- **Phone (Fallback OTP)**: `+15550002222` (Static OTP: `123456`)
- **Initial Coin Balance**: 1,500 Coins
- **State**: Onboarding completed, profile photos uploaded, ready for trip discovery.

#### Step-by-Step Review Guide:
1. **Launch App**: Open the GreenFlag app on your device.
2. **Access Sign-In Form**: On the main login screen, tap **"Continue with Email"** (or tap "Having trouble?") to reveal the email and password fields.
3. **Log In**: Enter the credentials for Demo Account 1 (`reviewer-woman@greenflag.app` / `GreenFlag2026!`).
4. **Explore Trips & Companions**:
   - Tap the **Trips** tab in the bottom bar (`/trips`).
   - Filter trips by destination (e.g. Goa, Coorg, Gokarna) and vibe, or test the **Female-Only** safety toggle.
   - Tap `+ New Trip`, select a destination, dates, and transport split to post a trip.
   - Tap on any existing trip to view the itinerary and test **Request to Join**.
5. **Explore Meet People & Connect**:
   - Tap the **Meet People** tab (`/discover`). Notice active trip badges (e.g. `📍 Coorg • 28 Sep`) on traveler cards.
   - Tap on profiles to inspect travel vibes, bucket list prompts, and tap **"Meet for Trips"** to connect directly.
6. **Test In-App Purchases (StoreKit 2)**:
   - Navigate to the **Coins Store** (tap the coin balance badge or go to `/coins`).
   - Select any coin tier (e.g. 500 Coins for $0.49 / ₹49, 1500 Coins for $1.49 / ₹129).
   - Authorize with your App Store Sandbox Apple ID to verify instant coin crediting.
7. **Test Content Reporting & Safety**:
   - Open any profile card or message thread.
   - Tap the **Options / Report** button.
   - Select a report reason (e.g. "Inappropriate content") and submit. Observe immediate confirmation and blocking.
8. **Test Account Deletion**:
   - Go to **Settings** (`/settings`).
   - Tap **Delete Account**.
   - Select a departure reason, confirm deletion, and observe permanent account purge and clean redirection to the login screen.


---

### 5. External Services, Tools & Platforms

GreenFlag relies on industry-standard, secure infrastructure to deliver its features:

1. **Supabase (Backend as a Service)**:
   - *Services*: Managed PostgreSQL database, Row-Level Security (RLS), Supabase Storage for encrypted profile media, and Supabase Edge Functions.
   - *URL*: `https://supabase.com`
2. **Apple StoreKit 2 & App Store Server API**:
   - *Services*: Native consumable In-App Purchases for Coin packages and cryptographic server-side JWS transaction verification.
   - *URL*: `https://developer.apple.com/in-app-purchase/`
3. **Apple Push Notification service (APNs)**:
   - *Services*: Delivery of real-time match notifications and daily intention reminders.
4. **Capacitor Mobile Runtime (@capacitor/ios, @capgo/capacitor-social-login)**:
   - *Services*: Native iOS bridging for biometrics (Face ID), CoreLocation, native Apple Sign-In, and native Google Sign-In.
5. **OpenAI API**:
   - *Services*: Powers contextual conversation starters and personalized prompt recommendations based on shared user interests.
   - *URL*: `https://openai.com`
6. **OpenStreetMap Nominatim / Apple CoreLocation**:
   - *Services*: Reverse geocoding for city auto-suggestion during user profile setup (no continuous location tracking).
7. **Vercel Infrastructure**:
   - *Services*: Serverless compute, API routing, and Edge middleware.
   - *URL*: `https://vercel.com`

---

### 6. Regional Availability & Differences

- **Global Consistency**: GreenFlag functions consistently across all geographic regions where the app is distributed. There are no geo-fenced features, localized restrictions, or regional content variances.
- **Currency Localization**: Pricing for consumable coin packages is automatically converted and presented in the local App Store currency of the user's Apple ID via StoreKit 2 API.

---

### 7. Regulatory Status & Third-Party Intellectual Property

- **Regulatory Status**: GreenFlag is an independent social discovery and travel companion application for meeting new people for trips. It does not operate in regulated financial, cryptocurrency, gambling, pharmaceutical, or medical industries.
- **Third-Party Content & Licensing**: GreenFlag does not incorporate protected third-party intellectual property, proprietary audio/video catalogs, or copyrighted materials. All UI assets, branding, and proprietary algorithms are owned by the developer. All user-generated content is governed by our Terms of Service and subject to in-app reporting, automatic moderation, and immediate administrative takedown.
- **Legal Documentation**:
  - *Privacy Policy*: `https://greenflag-dusky.vercel.app/privacy`
  - *Terms of Service*: `https://greenflag-dusky.vercel.app/terms`
  - *Support URL*: `https://greenflag-dusky.vercel.app/support`

---

Please let us know if any additional information or demonstrations are required. We look forward to your approval.

Sincerely,  
**The GreenFlag Team**
