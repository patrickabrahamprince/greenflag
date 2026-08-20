# GreenFlag — Google Play Console Submission Reference

Copy-paste reference for every field Play Console asks for. Verified against
the actual codebase (not assumed) — where this repo's App Store docs said
something different, this file uses what the code actually does.

Payment method for coins: **Razorpay only** (native Android SDK, UPI/cards/
netbanking). This is a known compliance risk under Google Play's Payments
policy — see the "Payments policy risk" section at the bottom before
submitting.

---

## Store Listing

### App name
```
GreenFlag
```

### Short description (max 80 characters)
```
Set your standards. Meet your match. Intentional dating, verified profiles.
```
(78 characters)

### Full description (max 4000 characters)
```
GreenFlag is an intentional dating app built around personal standards and genuine connection.

HOW IT WORKS
Define what actually matters to you — your non-negotiables, your values, what a real green flag looks like to you. GreenFlag matches you with people who fit, not just people who are nearby.

THE 3-DAY INTENTION EXCHANGE
Every match starts with a structured 3-day exchange of small, meaningful prompts before unlimited messaging unlocks. It's built to surface real compatibility before the small talk, not after.

VERIFIED PROFILES
Every profile goes through a review step before it's visible to matches, so you're meeting real people, not bots or catfish accounts.

SAFETY FIRST
Report and block on any profile or conversation, reviewed by our team. Your account, your pace — pause or delete anytime from Settings, no need to contact anyone.

COINS
Unlock additional profiles, photos, and reveals with coins, purchased securely via UPI, cards, or netbanking.

GreenFlag is free to download and use. Coins are optional.
```
(1,146 characters — well under the limit; can expand later)

### App category
```
Lifestyle
```
Google Play doesn't have a separate "Dating" category the way Apple does — Lifestyle is the closest fit and where most Indian dating apps (including comparable ones) list.

### Tags (Play Console lets you pick a few from a fixed list)
Suggested: `Dating`, `Social`, `Relationships` — pick from whatever Play Console's current tag picker offers under Lifestyle.

### Contact details
```
Email: support@greenflag.app
```
(Verified — this is the real, live support address in app/support/page.tsx.)

### Privacy policy URL
```
https://greenflag-dusky.vercel.app/privacy
```
(Live route, verified present in the repo.)

### Website (optional)
```
https://greenflag-dusky.vercel.app
```

---

## App Content Declarations

### Target audience & content
- **Minimum age enforced by the app: 18.** (Verified in code: `app/(auth)/onboard/profile/page.tsx` — `MIN_AGE = 18`, matches a DB check constraint per the code comment. Do NOT use "17+" from the old iOS docs in this repo — that's stale/wrong for what's actually enforced.)
- Target age group for Play Console's "Target audience" section: **18 and over only**. Do not select any under-18 age bracket, even as a secondary range — a dating app with messaging and user photos should never claim to target minors.

### Content rating questionnaire (IARC)
Answer honestly based on what the app actually does:
| Question | Answer | Why |
|---|---|---|
| User-generated content (profiles, photos, messages)? | Yes | Profiles, photos, bios, chat messages are all user-generated |
| Is UGC moderated? | Yes | Profiles reviewed before visibility (per `app/admin/queue*` moderation flow); report/block exists |
| Dating or romantic content? | Yes | It's a dating app |
| Sexual content / nudity? | No | Not a feature; report/block exists for violations, but the app doesn't host or intend explicit content |
| Violence | No | |
| Profanity | Infrequent/mild, user-generated only | Possible in chat messages, not in app-authored content |
| Shares user location? | Yes | City-level location is used for matching (see Data Safety below) |
| Users can interact / exchange content? | Yes | Messaging, photo unlocks |
| In-app purchases? | Yes | Coins, via Razorpay |

Given dating + messaging + user photos, expect Play's IARC engine to land this around **Mature 17+ / PEGI 16-18 equivalent** — that's normal for this category and not something to fight.

### Ads
```
Does this app contain ads? No
```
(Verified: no ad SDK in package.json — no AdMob, no Facebook Audience Network, nothing.)

### Data safety — third-party SDKs actually present
Verified by checking `package.json` and the codebase directly:
- **Supabase** — backend, auth, database, file storage (photos)
- **Razorpay** — payment processing for coins
- **Google Sign-In / Sign in with Apple** — authentication
- **Firebase Cloud Messaging** (via `@capacitor/push-notifications`) — push notification delivery
- No analytics SDK, no crash reporter, no ad network, no third-party tracker of any kind.

---

## Data Safety Form

Fill this in exactly — Play Console cross-checks declared data types against
runtime permission/SDK behavior, so under- or over-declaring both cause
problems.

### Does your app collect or share any of the required user data types?
```
Yes
```

### Data types collected (check each, all marked "collected for app functionality", none for advertising)

| Data type | Collected? | Shared with 3rd party? | Purpose |
|---|---|---|---|
| Name | Yes | No | Account functionality (profile) |
| Email address | Yes | Supabase (auth provider), Google/Apple (sign-in) | Account creation, authentication |
| Phone number | Yes | Supabase (OTP verification) | Account verification |
| Photos | Yes | Supabase Storage | Profile display |
| Approximate location | Yes | No | Match distance / city display (`ACCESS_COARSE_LOCATION`) |
| Precise location | Yes | No | Same as above (`ACCESS_FINE_LOCATION`) — see note below |
| In-app messages | Yes | No | Core messaging feature |
| User IDs | Yes | Supabase | Account management |
| Purchase history | Yes | Razorpay | Coin purchase processing |
| Device or other IDs | Yes | Firebase Cloud Messaging | Push notification delivery |

**Note on location**: both `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` are declared in `AndroidManifest.xml`. Before submitting, confirm with the actual onboarding flow (`app/(auth)/onboard/profile/location/page.tsx`) whether fine (GPS-precision) location is genuinely needed, or whether coarse (city-level) alone would satisfy the matching feature — Play Console review scrutinizes fine location heavily for apps that don't clearly need it, and requesting it unnecessarily is a common rejection reason. If only city-level matching is needed, dropping `ACCESS_FINE_LOCATION` from the manifest entirely is the safer and simpler path.

### Is all this data encrypted in transit?
```
Yes
```
(HTTPS throughout — Vercel + Supabase + Razorpay all TLS.)

### Do you provide a way for users to request data deletion?
```
Yes
```
Verified real: Settings → Delete Account is self-service, in-app, no support contact required (`app/api/user/delete/route.ts` — actually deletes matches, submissions, messages, wallet, coin history, and photos, not just the profile row).

---

## Release

### Package name
```
com.greenflagapp.app
```

### Version
```
versionCode: 1
versionName: "1.0"
```
(Current values in `android/app/build.gradle` — fine for a first submission. Bump `versionCode` on every subsequent release; Play Console rejects a re-upload with the same versionCode.)

### Signing
Release signing is wired up and verified for real (see `android/app/build.gradle` — reads `android/keystore.properties`, gitignored; the AAB's actual embedded certificate fingerprint was matched against the keystore directly, not just "build succeeded"). **Back up `android/upload-keystore.jks` and `android/keystore.properties`** somewhere durable, off this machine — losing them before Play App Signing has custody of your app signing key means you can't publish updates without going through Google's key-reset process.

### Build artifact to upload
```
android/app/build/outputs/bundle/release/app-release.aab
```
Already built once successfully this session (14MB, signed). Rebuild with `cd android && ./gradlew bundleRelease` (needs `ANDROID_HOME`/`JAVA_HOME` set — see earlier in this session for the exact paths on this machine) before each real upload, so it reflects the latest code.

---

## Screenshots & Graphics

Done — `docs/play-store-assets/`:
- `feature_graphic.png` (1024×500) — banner with logo + tagline
- `01_hero.png`, `02_discover.png`, `03_coins.png`, `04_safety.png` (1080×1920 each, 1.78:1 — within Play's 320–3840px / max-2x-ratio limits)

These are marketing-style mockups (device frame + caption), not raw screen captures — the logged-in test account had no real matches/messages and Discover showed placeholder seed text, so raw captures of those screens weren't presentable. `02_discover.png` and `03_coins.png` do use real in-app screenshots inside the mockup frame (captured live from the connected device this session), cropped to avoid the placeholder text. This style (captioned device frame) is standard practice and what most Play Store listings actually use.

**Still needed:**
- **App icon**: 512×512 PNG for the Play Console listing itself (separate from the APK's adaptive icon) — export from the existing adaptive icon source
- Once there's real user content (actual matches, messages, real profile photos), consider swapping `02_discover.png`'s photo for a real one, or add a couple more slides (a real match celebration, a real conversation) — not blocking, current set is submission-ready.

---

## ⚠️ Payments Policy Risk — read before submitting

This app currently uses **Razorpay directly** for coin purchases (virtual
currency redeemed entirely within the app for unlocking profiles/photos).
Per Google's own Payments policy, this category of purchase is required to
go through Google Play's Billing system. Verified against Google's current
policy pages this session (see the earlier conversation for full detail and
sources: [support.google.com/googleplay/android-developer/answer/10281818](https://support.google.com/googleplay/android-developer/answer/10281818),
[.../answer/13306652](https://support.google.com/googleplay/android-developer/answer/13306652)).

This is proceeding Razorpay-only per your explicit decision. Flagging once
more here since this is the actual submission checklist, not just a
conversation aside: if Play review rejects the app or flags the account,
this is the most likely reason. Nothing else in this checklist changes that
risk — it's a business decision, not a technical gap.

---

## Final checklist before you submit

- [ ] `android/upload-keystore.jks` and `android/keystore.properties` backed up somewhere durable, off this machine — **deferred, still the one real risk in all of this.** Do it before you lose this machine, doesn't have to block this first upload.
- [x] `ACCESS_FINE_LOCATION` dropped — only coarse location is requested
- [x] Screenshots and feature graphic in `docs/play-store-assets/`
- [x] 512×512 Play Console app icon in `docs/play-store-assets/app_icon_512.png`
- [ ] Content rating questionnaire submitted in Play Console using the table above
- [ ] Data Safety form filled in using the table above
- [x] Privacy policy and Support URLs verified live (200 OK): `/privacy`, `/terms`, `/support`
- [x] `versionCode: 1` / `versionName: "1.0"` — correct for this first upload
- [x] Release build signed and verified for real, not just "gradle said success" — a path bug meant earlier builds silently fell through to unsigned; fixed, and confirmed by extracting the AAB's actual embedded certificate and matching its SHA1/SHA256 against the keystore directly. Current build:
      `android/app/build/outputs/bundle/release/app-release.aab` (built 2026-08-21 00:41, 13.3MB)
- [x] Aware of and accepting the Payments policy risk on Razorpay-only coins, per your decision

**What's left is entirely inside Play Console** (account access I don't have): upload the AAB above, fill in the content rating and Data Safety forms using the tables in this doc, then submit for review. Ask if you want to go through that together step by step.
