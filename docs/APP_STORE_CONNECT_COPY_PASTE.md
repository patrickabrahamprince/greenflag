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
Set Your Standards. Meet Your Match.
```

### App Description (Promotional Text)
```
GreenFlag is an intentional dating app built around personal standards and genuine connection. Define your values, match with compatible singles, and engage in a structured 3-Day Intention Exchange that builds real chemistry before unlimited messaging unlocks. Verified profiles, smart matching, and built-in safety features help you find meaningful relationships—not just dates.
```

### Keywords (comma-separated, no quotes)
```
dating, relationships, singles, standards, matching, social, connection
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
(Change to 12 for resubmission)

### Category
```
Lifestyle > Social Networking
```

### Content Rating / Age Restriction
```
17+
```

---

## 🎯 RATINGS & REVIEW SECTION

### Use this for Age Rating Questionnaire:

**Question: Does your app include user-generated content?**
```
✓ YES
```
Explain: Profiles, photos, messages, and intentions are user-generated

**Question: Do you monitor and filter user-generated content?**
```
✓ YES
```
Explain: All profiles verified before visibility, users can report/block, admin team reviews flagged content within 24 hours

**Question: Does your app include dating or romantic content?**
```
✓ YES
```
Explain: Dating application with messaging features

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

### Required Screenshot Sizes

#### iPhone 6.7-inch (5.5-inch and larger displays)
- **Size**: 1242 x 2688 pixels
- **Show**: Discover page with swiping cards
- **Text Overlay**: "Swipe to find compatible matches"

#### iPhone 6.1-inch (standard)
- **Size**: 1170 x 2532 pixels
- **Show**: Match celebration screen
- **Text Overlay**: "It's a Match! Chat to connect"

#### iPhone 5.5-inch or smaller (if supporting)
- **Size**: 750 x 1334 pixels
- **Show**: Messaging screen
- **Text Overlay**: "Real conversations after meaningful intentions"

#### iPad Pro 12.9-inch (if supporting iPad)
- **Size**: 2048 x 2732 pixels
- **Show**: Full Discover page
- **Text Overlay**: "Available on iPad too"

**Tip**: Use current app screenshots. Don't use mockups or demo images.

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
Mild/Moderate Dating & Romantic Content
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
Welcome to GreenFlag! Set your standards and meet your match. Features include daily intention messaging, verified profiles, smart matching, and a community dedicated to genuine connections.

Version 1.0.0 includes:
- Discover swiping with compatibility breakdown
- 3-Day Intention Exchange system
- Verified profile profiles
- In-App Messaging
- Coins Store (In-App Purchases)
- Face ID App Lock
- Account Pause & Deletion
- Content Reporting & Blocking

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
