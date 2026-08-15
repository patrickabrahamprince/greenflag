# App Store Submission — Final Pre-Flight Checklist

## ✅ BEFORE YOU SUBMIT

### 1. Screen Recording (CRITICAL)
- [ ] Record on **physical iPhone** (not simulator)
- [ ] Running **latest iOS** (iOS 18.0+)
- [ ] Show complete user flow from cold launch through deletion
- [ ] Include all permission prompts (location, camera, photos, microphone, notifications, Face ID)
- [ ] Show In-App Purchase flow (coins store purchase)
- [ ] Show reporting/blocking feature
- [ ] Show account deletion flow
- [ ] **Upload to**: App Store Connect → Resolution Center → Attach video file OR paste YouTube/Vimeo link
- [ ] Verify video plays in App Store Connect (test the link!)

### 2. Demo Accounts (CRITICAL)
- [ ] Test Demo Account 1 (Female) login works: `reviewer-woman@greenflag.app` / `GreenFlag2026!`
- [ ] Test Demo Account 2 (Male) login works: `reviewer-man@greenflag.app` / `GreenFlag2026!`
- [ ] Both accounts have profile photos uploaded
- [ ] Both accounts have 1,500+ coins
- [ ] Both accounts have completed onboarding
- [ ] "Having trouble?" email/password toggle works from login screen
- [ ] Each demo account can browse, like, and match with other account

### 3. App Configuration
- [ ] Bundle ID: `com.greenflagapp.app` ✓
- [ ] App Name: `GreenFlag` ✓
- [ ] Version: `1.0.0` ✓
- [ ] Build Number: Increment to `12` for resubmission
- [ ] Signing Certificate: Valid & not expired
- [ ] Provisioning Profile: Valid & not expired

### 4. App Store Listing (Fill in App Store Connect)
- [ ] **App Name**: GreenFlag
- [ ] **Subtitle**: Set Your Standards. Meet Your Match.
- [ ] **Description**: (Use the one from APP_STORE_FINAL_SUBMISSION.md section 3)
- [ ] **Keywords**: dating, relationships, standards, matching, social, single
- [ ] **Category**: Lifestyle → Social Networking
- [ ] **Content Rating**: 17+ (dating features, some mature content)
- [ ] **Age Restriction**: 17+

### 5. Privacy & Legal (Fill in App Store Connect)
- [ ] **Privacy Policy URL**: https://greenflag-dusky.vercel.app/privacy
- [ ] **Terms & Conditions URL**: https://greenflag-dusky.vercel.app/terms
- [ ] **Support URL**: https://greenflag-dusky.vercel.app/support
- [ ] **Delete Account URL**: https://greenflag-dusky.vercel.app/settings (in-app)
- [ ] Privacy Policy: Covers all data collection ✓
- [ ] Terms: Include coin refund policy, dating-specific terms ✓

### 6. Age Rating Questionnaire (Fill in App Store Connect)
Complete the questionnaire answering:
- [ ] Contains user-generated content? **YES** (profiles, photos, messages)
- [ ] Content moderation system? **YES** (reporting, blocking, admin review)
- [ ] Dating/romantic content? **YES** (dating app core feature)
- [ ] Mature sexual content? **NO** (user-generated may violate terms)
- [ ] Profanity/crude humor? **INFREQUENT** (user-generated, moderated)
- [ ] Alcohol/tobacco? **NO**
- [ ] Violence? **NO**
- [ ] Horror/scary content? **NO**
- [ ] Medical/health? **NO**
- [ ] Gambling/lotteries? **NO**
- [ ] Financial services? **NO**
- [ ] Requires login? **YES**

### 7. App Store Screenshots (Fill in App Store Connect)
Need to create for each device size (can use your own screenshots or generate):

**Required Sizes**:
- [ ] iPhone 6.7" (landscape optional)
- [ ] iPhone 6.1" (required - most important)
- [ ] iPad Pro 12.9" (required if supporting iPad)

**Content for Screenshots** (show these screens):
1. Discover page (swiping)
2. Standards/Compatibility view
3. 3-Day Intention flow
4. Messaging
5. Coins store (IAP showcase)

**Tips**:
- Use actual app screenshots (not mockups)
- Add text overlays explaining key features
- Show the app in action, not just login screen
- Use consistent branding

### 8. In-App Purchases (StoreKit 2)
- [ ] All 5 coin packages configured in App Store Connect
  - [ ] 500 coins ($0.49)
  - [ ] 1000 coins ($0.99)
  - [ ] 1500 coins ($1.49)
  - [ ] 2000 coins ($1.99)
  - [ ] 5000 coins ($4.99)
- [ ] Test each package on TestFlight with real sandbox transactions
- [ ] Verify coin balance updates after purchase
- [ ] Server-side verification working (Apple receipt validation)

### 9. Push Notifications (APNs)
- [ ] APNs certificate uploaded in Apple Developer account ✓
- [ ] APNs key ID set in environment variables ✓
- [ ] Private key PEM format correct ✓
- [ ] Test notification delivery works end-to-end

### 10. Compliance & Security
- [ ] ITSAppUsesNonExemptEncryption = false ✓ (only standard HTTPS)
- [ ] All permission purpose strings present in Info.plist ✓
  - [ ] Camera: "capture photos for your profile and daily intentions"
  - [ ] Microphone: "record your voice intentions"
  - [ ] Photos: "choose photos for your profile and submissions"
  - [ ] Location: "suggest your city during profile setup"
  - [ ] Face ID: "keep your matches and messages private"
  - [ ] Notifications: "alert you about matches and messages"
- [ ] No hardcoded secrets in Info.plist ✓
- [ ] OAuth URLs configured (Google, Apple) ✓
- [ ] Localhost ATS exception only (production uses HTTPS) ✓

### 11. Build & Submission
- [ ] Run `npm run build` — 0 errors ✓
- [ ] Archive builds without warnings
- [ ] Upload to App Store Connect
- [ ] Select "Pending Developer Release" (NOT "Automatically release after approval")
- [ ] Review all submission details 2x before clicking "Submit for Review"

### 12. App Review Notes (CRITICAL - Copy from APP_STORE_FINAL_SUBMISSION.md)
In App Store Connect → App Review Information → Notes section, paste:
```
[Copy the entire content from APP_STORE_FINAL_SUBMISSION.md sections 1-7]
```

**Make sure to include**:
- Screen recording link/upload ✓
- Device testing matrix ✓
- App description & value prop ✓
- Demo account credentials ✓
- External services list ✓
- Regional consistency confirmation ✓
- Regulatory status ✓

---

## 🚀 SUBMISSION WORKFLOW

### Step 1: Final Testing (1-2 hours)
1. Test app on 2+ physical devices
2. Test demo accounts end-to-end
3. Run through all permission prompts
4. Test in-app purchases on TestFlight
5. Record screen capture video

### Step 2: Prepare App Store Connect (30 min)
1. Update build number to 12
2. Fill in all required fields (name, description, keywords)
3. Upload screenshots (or use current ones)
4. Verify privacy/legal URLs
5. Complete age rating questionnaire

### Step 3: Final Submission (15 min)
1. Upload new build from Xcode archive
2. Paste complete App Review Notes (from APP_STORE_FINAL_SUBMISSION.md)
3. Upload screen recording video
4. Review all fields one more time
5. Click "Submit for Review"

### Step 4: Monitoring
- Apple typically reviews within 24-48 hours
- Check email daily for review status
- If rejected, read rejection reason carefully
- Address any issues and resubmit with build number increment

---

## ⚠️ COMMON REJECTION REASONS TO AVOID

❌ **Missing Information** → Solution: Use APP_STORE_FINAL_SUBMISSION.md content  
❌ **No Demo Account Access** → Solution: Verify accounts work with "Having trouble?" toggle  
❌ **Demo Accounts Deleted** → Solution: Refresh demo data before resubmission  
❌ **Permission Strings Missing** → Solution: Verify all 6 permission strings in Info.plist ✓  
❌ **No Screenshot Recording** → Solution: Record on physical device, not simulator  
❌ **IAP Not Tested** → Solution: Test all 5 coin packages on TestFlight  
❌ **Crashes on Startup** → Solution: Test on iOS 16, 17, 18 simulators + physical device  
❌ **Age Gate Ineffective** → Solution: Test age verification during signup  
❌ **Misleading Functionality** → Solution: App does what description says ✓  

---

## 📞 IF REJECTED AGAIN

1. **Read the rejection reason carefully** - Apple is specific
2. **Do NOT just resubmit same build** - increment build number
3. **Respond in Resolution Center** with:
   - Why you believe rejection was in error (if applicable)
   - What changes you made
   - Updated screen recording if needed
4. **Common fixes**:
   - Add more detailed App Review Notes
   - Provide clearer screen recording
   - Refresh demo accounts
   - Update screenshots to better showcase features

---

## 💡 SUCCESS TIPS

✅ **Be thorough** - Apple appreciates complete, detailed information  
✅ **Be honest** - Don't hide features or functionality  
✅ **Test everything** - Demo accounts, IAP, all flows  
✅ **Respond quickly** - If Apple asks follow-up, reply within 24 hours  
✅ **Track versions** - Keep build numbers sequential  
✅ **Read guidelines** - Review App Store Review Guidelines before each submission  

---

**Current Status**: Ready for submission  
**Build Version**: Ready to increment to 12  
**Demo Accounts**: Ready to verify  
**Documentation**: Complete (APP_STORE_FINAL_SUBMISSION.md)  

🎯 **Next Step**: Record screen capture on physical iPhone and upload to App Store Connect!
