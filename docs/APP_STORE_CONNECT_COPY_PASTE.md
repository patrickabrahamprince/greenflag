# App Store Connect — Copy & Paste Reference

Use this guide to fill in EVERY field in App Store Connect without guessing.

---

## 📝 APP INFORMATION SECTION

### Product Name
```
GreenFlag
```

### Subtitle
```
Meet New People for Trips
```

### App Description (Promotional Text)
```
Don't travel alone. GreenFlag is the app for meeting new people for any trip. Road trips, weekend getaways, beach escapes, mountain treks, cafe crawls, or camping — discover verified travel companions, plan itineraries, split rides and stays safely, and explore together. Built-in female-only trip filters and host approval gates ensure a safe, authentic travel community.
```

### Keywords (comma-separated, no quotes)
```
meet new people, trips, travel companions, road trips, weekend trips, beach trips, trekking, solo travel, camping, travel buddies
```

### Support URL
```
https://greenflag-dusky.vercel.app/support
```

### Privacy Policy URL
```
https://greenflag-dusky.vercel.app/privacy
```

### App Website URL (optional, can leave blank or use support)
```
https://greenflag-dusky.vercel.app
```

---

## 🔐 GENERAL APP INFORMATION SECTION

### Bundle ID
```
com.greenflagapp.app
```

### Version Number
```
1.0.0
```

### Build Number (increment each submission)
```
12
```
(Current build ready in Xcode is 12)

### Category
```
Primary: Travel
Secondary: Social Networking
```


### Content Rating / Age Restriction
```
12+ (or 17+ for Social Networking)
```

---

## 🎯 RATINGS & REVIEW SECTION

### Use this for Age Rating Questionnaire:

**Question: Does your app include user-generated content?**
```
✓ YES
```
Explain: Profiles, photos, messages, and trip listings are user-generated

**Question: Do you monitor and filter user-generated content?**
```
✓ YES
```
Explain: All profiles verified before visibility, users can report/block, admin team reviews flagged content within 24 hours

**Question: Does your app include dating or romantic content?**
```
✗ NO
```
Explain: Platform for meeting new people for trips, coordinating weekend travel, road trips, and outdoor adventures

**Question: Does your app include mature or adult content?**
```
✗ NO
```
(Moderated via reporting system)

**Question: Does your app include profanity or crude humor?**
```
✓ INFREQUENT
```
(Only in user-generated messages, moderated)

**Question: Does your app include violence or horror?**
```
✗ NO
```

**Question: Does your app include medical, health, or fitness content?**
```
✗ NO
```

**Question: Does your app require login/authentication?**
```
✓ YES
```

---

## 📞 APP REVIEW INFORMATION SECTION

### Notes for App Review

**Copy the ENTIRE content below** and paste into "Notes" field:

```
[PASTE ENTIRE CONTENT FROM: docs/APP_STORE_FINAL_SUBMISSION.md sections 1-7]
```

**Key sections to include**:
1. Screen Recording Info (upload link or video file)
2. Device Testing Matrix
3. App Description & Functions
4. Setup & Demo Account Credentials
5. External Services List
6. Regional Consistency
7. Regulatory Status & IP

### Login Credentials for Reviewer

**In the same Notes field, include**:

```
DEMO ACCOUNT 1 (Female):
Email: reviewer-woman@greenflag.app
Password: GreenFlag2026!
Phone: +15550001111
OTP: 123456
Status: Onboarding complete, 1,500 coins, profile photos uploaded, 3-day Standards active

DEMO ACCOUNT 2 (Male):
Email: reviewer-man@greenflag.app
Password: GreenFlag2026!
Phone: +15550002222
OTP: 123456
Status: Onboarding complete, 1,500 coins, profile photos uploaded, ready for discovery

IMPORTANT: Tap "Having trouble?" below the Apple/Google buttons on the login screen to access the email/password form.
```

---

## 🎨 BUILD SECTION

### Version
```
1.0.0
```

### Build
```
12
```

### SDK/Xcode/Swift Versions (auto-filled)
- Leave as default (auto-detected from your build)

---

## 📸 SCREENSHOTS SECTION
Use the newly generated high-resolution screenshots from `docs/ios-store-assets/` (at 1284 x 2778 px, Apple auto-scales down for all iPhones):

1. **Screenshot 1 (`01_hero.png`)**:
   - Headline: "Any Trip. Meet Your Crew."
   - Focus: Trips Feed (Goa beach escapes, Coorg treks, transport splits, budget estimates).
2. **Screenshot 2 (`02_standards.png`)**:
   - Headline: "Post Your Trip. Pick Your Travel Vibe."
   - Focus: Trip creation (Destination chips, travel vibes: road trip, beach, trek, camping, transport splits).
3. **Screenshot 3 (`03_intention_exchange.png`)**:
   - Headline: "Instant Chat. Plan The Journey."
   - Focus: Direct 1-on-1 and group chat unlocked on host approval for trip logistics.
4. **Screenshot 4 (`04_verified.png`)**:
   - Headline: "Safe Community. Verified Profiles."
   - Focus: Verified travelers, host approval gates & female-only trips.

These 4 screenshots have already been generated and are saved in `docs/ios-store-assets/`. Upload them in this order.

---

## 💰 IN-APP PURCHASES SECTION

Make sure these are configured in App Store Connect:

### Coin Package 1
```
Product ID: com.greenflagapp.app.coins500
Type: Consumable
Name: 500 Coins
Price: $0.49 / ₹49
```

### Coin Package 2
```
Product ID: com.greenflagapp.app.coins1000
Type: Consumable
Name: 1000 Coins
Price: $0.99 / ₹99
```

### Coin Package 3
```
Product ID: com.greenflagapp.app.coins1500
Type: Consumable
Name: 1500 Coins
Price: $1.49 / ₹129
```

### Coin Package 4
```
Product ID: com.greenflagapp.app.coins2000
Type: Consumable
Name: 2000 Coins
Price: $1.99 / ₹169
```

### Coin Package 5
```
Product ID: com.greenflagapp.app.coins5000
Type: Consumable
Name: 5000 Coins
Price: $4.99 / ₹399
```

**Verify**: Test purchase of at least 2 packages on TestFlight before submitting

---

## 🌐 LOCALIZATION SECTION

### Supported Languages
- English (primary)
- Future: Add Hindi, Spanish, etc. in future versions

### Regional Notes
```
GreenFlag is available globally with consistent features across all regions. No geo-fencing or regional restrictions. Pricing is localized via Apple's StoreKit 2 API to user's App Store currency.
```

---

## 📋 COMPLIANCE SECTION

### Encryption & Security
- **App uses non-exempt encryption**: ✗ NO (unchecked)
- **Reason**: App uses only standard HTTPS/TLS via Supabase, Apple APIs, and Vercel. No custom encryption algorithms.

### GDPR / Privacy
- **Includes GDPR compliance**: ✓ YES
- **Includes CCPA compliance**: ✓ YES
- **Privacy Policy URL**: https://greenflag-dusky.vercel.app/privacy

### Age Requirements
```
Minimum Age: 17 years old
Enforced via: Age verification at signup, birthday field required, age validation on login
```

### Content Rating
```
Social Networking & Travel Connections
Infrequent Profanity/Crude Humor (user-generated, moderated)
No Violence, Horror, Medical, Gambling, or Restricted Content
```

---

## ✅ RELEASE SECTION

### Release Type
```
Prepare this version for submission (do NOT select automatic release)
```

### Release Notes
```
Welcome to GreenFlag: Meet New People for Trips! Don't travel alone. Travel together.

Version 1.0.0 includes:
- Greenflag Trips: Browse and post weekend travel plans (Coorg, Gokarna, Hampi, Chikmagalur, and more)
- Split rides and stays safely with verified travel companions
- Female-Only trip toggle for added safety
- Host Approval Gate: No uninvited messages before host acceptance
- Standards-based discovery with compatibility alignment breakdown
- 3-Day Intention Exchange protocol before open chat unlocks
- Verified profile system & Biometric Face ID App Lock
- Coins Store (In-App Purchases)
- Instant Content Reporting & Account Management

We're excited to launch and look forward to your review!
```


---

## 🚀 FINAL CHECKS BEFORE SUBMIT

- [ ] All text fields filled in above
- [ ] Screenshot resolution matches required sizes
- [ ] At least 1 (max 5) screenshots per device
- [ ] App Review Information Notes contains full submission details
- [ ] Demo account credentials provided
- [ ] Screen recording link/file uploaded
- [ ] All In-App Purchase products active
- [ ] Build number incremented (12)
- [ ] Version stays 1.0.0
- [ ] Privacy Policy & Terms URLs work (open in browser first)
- [ ] Age rating set to 17+
- [ ] No placeholder or test text left behind

---

## 📤 SUBMISSION

1. Go to App Store Connect
2. Select GreenFlag app
3. Go to "TestFlight" → Build
4. Select latest build
5. Click "Submit to App Review"
6. Fill all fields above
7. **READ EVERYTHING ONE MORE TIME**
8. Click "Submit for Review"
9. Confirm email notification

**Typical review time**: 24-48 hours

---

## 📞 IF YOU NEED HELP

**Apple's App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/

**Common issues & solutions**: See FINAL_SUBMISSION_CHECKLIST.md

**Technical help**: support@greenflag.app

---

**Good luck! 🎉**
