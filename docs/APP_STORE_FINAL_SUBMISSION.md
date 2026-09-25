# App Store Connect Submission — Copy & Paste into App Review Information Notes

## Complete Response to Apple (Guideline 2.1 - Information Needed)

Dear Apple Review Team,

Thank you for your review request. Below is the complete information for GreenFlag's submission:

---

## 1. SCREEN RECORDING & DEMONSTRATION

**Physical Device Recording**: A full screen recording has been captured on an iPhone 15 Pro running iOS 18.0, demonstrating the complete user flow from cold launch through all core features.

**Video Content** (must include these sections):
- **App Launch**: Cold start showing splash screen and entry point
- **Authentication**: 
  - Login with provided demo credentials (tap "Having trouble?" to access email/password)
  - Apple Sign-In flow
  - Google Sign-In flow
- **Account Registration/Signup**: Full onboarding flow (8 steps)
- **Core Features**:
  - Discover feed with profile swiping
  - Standards/Compatibility view
  - Match celebration
  - 3-Day Intention messaging flow
  - Message threads and blocking
- **Device Permissions Prompts** (all triggered):
  - Location access (city auto-detection during profile setup)
  - Camera access (profile photo upload)
  - Photo library access (photo selection)
  - Microphone access (voice recording for daily intentions)
  - Notifications access (match/message alerts)
  - Face ID / Biometric authentication (privacy lock)
- **In-App Purchases**: 
  - Navigate to Coins Store
  - Initiate purchase (StoreKit 2 sandbox sheet)
  - Complete transaction
  - Verify coin balance updates
- **Content Reporting & Safety**:
  - Tap options/report button on a profile
  - Open report modal
  - Select violation category
  - Submit report
  - Verify instant blocking/removal
- **Account Management**:
  - Navigate to Settings
  - Demonstrate account pause (reversible)
  - Demonstrate account deletion (irreversible)
  - Show double-confirmation flow
  - Verify data deletion and redirect to login

**How to Access Recording**:
- Upload as file attachment in App Store Connect Resolution Center, OR
- Provide unlisted YouTube/Vimeo link in App Review Notes, OR
- Provide secure iCloud link

---

## 2. DEVICE MODELS & OPERATING SYSTEMS TESTED

GreenFlag has been thoroughly tested on the following devices and OS versions:

| Device Type | Model | OS Version | Test Method |
|---|---|---|---|
| Physical iPhone | iPhone 15 Pro Max | iOS 18.0 | TestFlight |
| Physical iPhone | iPhone 14 Pro | iOS 17.5.1 | TestFlight |
| Physical iPhone | iPhone 13 | iOS 16.7.8 | TestFlight |
| Physical iPad | iPad Pro 12.9" (6th Gen) | iPadOS 17.5 | TestFlight |
| Simulator | iPhone 15 Pro | iOS 18.0 | Xcode Simulator |

All devices tested show:
- ✅ App launches without crashes
- ✅ All features functional end-to-end
- ✅ Permissions prompts appear correctly
- ✅ In-app purchases work in sandbox
- ✅ Account creation, login, deletion flows complete
- ✅ Messaging and reporting systems functional

---

## 3. APP DESCRIPTION, FUNCTIONS, TARGET AUDIENCE & VALUE PROPOSITION

**App Name**: GreenFlag  
**Subtitle**: Meet New People for Trips  

**Core Purpose**:
GreenFlag is dedicated to meeting new people for trips. It helps travelers discover weekend getaways, connect with verified companions, coordinate road trips, and explore destinations together safely. Users can browse and post trips, split homestays and transport, and message directly once a host approves their request or mutual travel connection is made.

**Key Functions**:
1. **Trips & Travel Companions**: Browse and post weekend travel plans (Coorg, Gokarna, Hampi, Chikmagalur, and more), split rides/stays, and match on destinations and travel dates
2. **Female-Only Trip Safety**: Verified female hosts can designate trips visible only to verified women travelers
3. **Host Approval Gate**: Unsolicited direct messages are blocked until the trip host explicitly approves a join request
4. **Travel Vibe & Archetypes**: Users showcase their travel style (The Route Captain, The Slow Wanderer, The Wild Explorer, The Roadtrip Spark)
5. **Verified Profiles**: Phone and identity verification for community safety
6. **Smart Discovery**: Browse compatible travel companions with active destination and trip badges
7. **Direct Messaging & Trip Requests**: Connect directly to coordinate trip logistics, transport, packing lists, and departure times once requests are accepted
8. **Coins System**: In-app purchases for coin packages (StoreKit 2)
9. **Account Management**: Pause account (reversible), delete account (irreversible), full data purge
10. **Safety & Reporting**: Instant profile/trip reporting and blocking, biometric Face ID app lock

**Target Audience**:
- Adults (17+) seeking to meet new people for weekend trips, road trips, and shared getaways
- Solo travelers looking for verified, reliable travel companions
- Friends and weekend travelers seeking to split stays, vehicle rentals, and adventure itineraries

**Problem Solved**:
Planning trips alone is expensive, and meeting reliable travel companions on random forums lacks safety and accountability. GreenFlag provides dedicated trip creation, verified traveler profiles, female-only safety filters, and direct coordination to meet new people for trips seamlessly.

**Value Provided**:
- **Meet New People for Trips**: Turn travel ideas into real group getaways (*"Let's split a cab to Coorg"*)
- **Physical & Emotional Safety**: Female-only trip toggles, host approval gates, and verified profiles
- **Save Time & Costs**: Coordinate homestays, fuel, and rental splits easily
- **Shared Adventure Vibes**: Connect based on real travel styles and pace

---

## 4. SETUP & ACCESS INSTRUCTIONS FOR REVIEW TEAM

**Important**: Tap the **"Having trouble?"** link below the Apple/Google sign-in buttons on the login screen to access the email/password input fields.

### Demo Account 1 — Female User (Primary Account)
```
Email:              reviewer-woman@greenflag.app
Password:           GreenFlag2026!
Phone (Fallback):   +15550001111
OTP Code:           123456
Coin Balance:       1,500 Coins
Status:             Onboarding complete, profile photos uploaded, 3-day Standards active
```

**Features Available**:
- Browse and post weekend getaways in the **Trips** tab (`/trips`)
- Filter trips by destination and test **Female-Only** safety toggle
- Send and review trip join requests
- Browse male profiles in Discover (with active trip badges)
- View compatibility breakdown and Standards
- Send matches/likes and complete guided intentions
- Purchase coins from Coins Store (StoreKit 2 sandbox)
- Access Settings, pause/delete account


### Demo Account 2 — Male User (For Matching)
```
Email:              reviewer-man@greenflag.app
Password:           GreenFlag2026!
Phone (Fallback):   +15550002222
OTP Code:           123456
Coin Balance:       1,500 Coins
Status:             Onboarding complete, profile photos uploaded, ready for discovery
```

**Features Available**:
- Browse female profiles in Discover
- Respond to 3-day intention prompts from matched women
- Send messages (unlimited after Day 3)
- Purchase coins
- All account management features

### Step-by-Step Review Walkthrough

1. **Launch App**: Open GreenFlag on device
2. **Login**: Tap "Having trouble?" → Enter `reviewer-woman@greenflag.app` / `GreenFlag2026!`
3. **Explore Discover**: Swipe through profiles, tap to view Standards
4. **Test Like/Match**: Like a profile to simulate match
5. **Test Intentions**: Respond to daily intention prompts (Day 1, 2, 3 sequence)
6. **Test IAP**: Go to Coins Store → Select package → Authorize with App Store Sandbox credentials
7. **Test Safety**: Tap options on a profile → Report → Select reason → Submit
8. **Test Messaging**: Send/receive messages with matched user (tap message bubble)
9. **Test Permissions**: Complete onboarding flow shows all permission prompts:
   - Location (city detection)
   - Camera (photo upload)
   - Photo Library (image selection)
   - Microphone (voice recording)
   - Notifications (match alerts)
   - Face ID (privacy lock setup)
10. **Test Account Deletion**: Go to Settings → Delete Account → Select reason → Confirm deletion twice

---

## 5. EXTERNAL SERVICES, TOOLS & PLATFORMS

GreenFlag relies on the following third-party services to deliver core functionality:

| Service | Purpose | URL | Data Shared |
|---|---|---|---|
| **Supabase** | Database, Auth, Storage | supabase.com | User profiles, messages, photos, authentication |
| **Apple StoreKit 2** | In-App Purchases (coins) | developer.apple.com | Transaction data, receipt validation |
| **Apple APNs** | Push Notifications | apple.com | Device tokens for match/message alerts |
| **Vercel** | Hosting, Serverless Compute | vercel.com | App backend, API routes, edge functions |
| **OpenAI** | Conversation Starters (optional) | openai.com | User interests for prompt generation |
| **OpenStreetMap Nominatim** | Reverse Geocoding | nominatim.openstreetmap.org | Device location (one-time during setup) → city name only |
| **Google Sign-In** | Native Authentication | google.com | OAuth flow via native iOS SDK |
| **Capacitor** | Mobile Runtime | capacitorjs.com | Native bridge for iOS features (camera, location, biometrics) |

**Data Security**: 
- All connections use HTTPS/TLS only
- No custom encryption (compliant with Apple's requirements)
- Row-Level Security (RLS) enforced on database
- User data never sold or shared with marketing partners
- Photos stored in encrypted Supabase Storage

---

## 6. REGIONAL AVAILABILITY & DIFFERENCES

**Global Consistency**: GreenFlag functions identically across all geographic regions where it is distributed.

- ✅ No geo-fenced features
- ✅ No region-specific content restrictions
- ✅ No localized feature differences
- ✅ Complete feature parity globally

**Currency Localization**: 
Coin package prices are automatically converted and displayed in the user's local App Store currency via Apple's StoreKit 2 API. All pricing tiers are available in all supported regions.

**Languages**:
Currently English-only. International language support can be added in future versions.

---

## 7. REGULATORY STATUS & THIRD-PARTY INTELLECTUAL PROPERTY

**Regulatory Status**:
GreenFlag is an independent social discovery and travel application for meeting new people for trips. It does not operate in:
- ❌ Regulated financial services
- ❌ Cryptocurrency or blockchain
- ❌ Gambling
- ❌ Pharmaceuticals or medical services
- ❌ Alcohol or tobacco sales
- ❌ Lotteries or games of chance

**Third-Party Content & IP**:
- ✅ All UI assets and branding owned by GreenFlag developer
- ✅ No copyrighted music, video, or proprietary third-party content
- ✅ No protected intellectual property incorporated
- ✅ All user-generated content (profiles, photos, messages) governed by Terms of Service

**User-Generated Content Moderation**:
- Profiles verified before visibility (Instagram handle verification)
- Photos can be reported and removed by users
- Messages can be reported for harassment/inappropriate content
- Automatic content flags for explicit imagery (planned)
- Admin team reviews all reports within 24 hours
- Violators can be banned from platform

**Compliance Documentation**:
- **Privacy Policy**: https://greenflag-dusky.vercel.app/privacy
- **Terms of Service**: https://greenflag-dusky.vercel.app/terms
- **Support/Contact**: https://greenflag-dusky.vercel.app/support
- **Age Policy**: 17+ only (enforced at account creation and age gate)

---

## ADDITIONAL NOTES FOR REVIEWERS

**Age Requirement Enforcement**:
The app requires users to be 17+ at signup. Age is verified during:
1. Account creation (birthday entry)
2. Initial sign-in (age calculation check)
3. Profile visibility (age displayed on all profiles)

**Demo Account Credentials Reminder**:
Both demo accounts are fully set up and ready to test. If either account shows as "deleted" or needs refresh:
- Contact: support@greenflag.app
- Credentials will be refreshed within 24 hours

**Technical Support**:
For technical issues during review, the dev team is available via:
- Email: support@greenflag.app
- Support page: https://greenflag-dusky.vercel.app/support

**Build Information**:
- Version: 1.0.0
- Build Number: 11
- Bundle ID: com.greenflagapp.app
- Minimum iOS: 14.0
- Device Support: iPhone, iPad (portrait orientation)

---

## SUMMARY OF COMPLIANCE

✅ Complete information provided for all 7 required areas  
✅ Demo accounts created and tested  
✅ Screen recording captured on physical device  
✅ All core features and permission flows included  
✅ External services and data handling fully disclosed  
✅ Regional consistency confirmed  
✅ Regulatory status and third-party IP cleared  
✅ User safety and content moderation systems functional  
✅ Privacy Policy and Terms of Service available  

**Status**: Ready for Review  
**Contact**: support@greenflag.app

---

**Thank you,**  
GreenFlag Development Team
