# Screen Recording Walkthrough Guide for App Store Review

> **Apple Guideline 2.1 Requirement**:
> "A screen recording captured on a physical device, running the latest operating system, demonstrating the app's functionality. The recording must begin with launching the app and show the typical user flow through its core features."

This document provides the exact **step-by-step storyboard** and **recording checklist** to ensure 100% compliance on the first review pass.

---

## ⚙️ Pre-Recording Checklist

1. **Physical Device**: Use an iPhone (e.g., iPhone 14 Pro, iPhone 15, or iPhone 16) running iOS 17.5+ or iOS 18.0+.
2. **Seed Accounts First**: Run `npm run seed:reviewers` from the terminal to ensure clean demo accounts (`reviewer-woman@greenflag.app` & `reviewer-man@greenflag.app`) with active standards, coins, and clean feed state.
3. **Display Settings**:
   - Set appearance to **Dark Mode** (or as designed).
   - Turn **Do Not Disturb / Focus Mode** ON (avoids personal notification banners during recording).
   - Set auto-lock to 5 minutes so screen doesn't dim.
4. **Recording Method**:
   - **Option A (Recommended - Clean macOS QuickTime)**: Connect iPhone to Mac with USB cable -> Open **QuickTime Player** -> *File* -> *New Movie Recording* -> Click arrow next to Record button and select **iPhone** as Camera & Microphone.
   - **Option B (iOS Native Screen Recorder)**: Enable Screen Recording in iOS *Settings > Control Center*. Record, then trim start/end cleanly.

---

## 🎬 Second-by-Second Video Storyboard (Target Duration: ~90–120 seconds)

### Scene 1: App Launch & Splash Screen (0:00 – 0:08)
- [x] Start recording from the iOS Home Screen.
- [x] Tap the **GreenFlag** app icon.
- [x] Show the dark launch screen transition into the main Welcome / Login screen.

### Scene 2: Authentication & Terms Gate (0:08 – 0:25)
- [x] Show the Apple Sign-In and Google Sign-In options.
- [x] Tap the **"Having trouble?"** link below the social buttons to reveal the email/password fields.
- [x] Enter `reviewer-woman@greenflag.app` and `GreenFlag2026!`.
- [x] If Terms Gate appears, tap **Accept & Continue**.
- [x] Tap **Sign In** and smoothly arrive at the main app screen.

### Scene 3: Device Permissions & Prompts Demonstration (0:25 – 0:45)
- [x] Navigate to **Profile** or Onboarding photo update.
- [x] Tap **Add Photo** -> Trigger iOS **Photo Library / Camera permission prompt** (Shows `NSPhotoLibraryUsageDescription` / `NSCameraUsageDescription`).
- [x] Trigger or show location suggestion for city (`NSLocationWhenInUseUsageDescription`).
- [x] Trigger or show Notifications prompt if presented.
- [x] Show Face ID lock toggle in settings if enabled (`NSFaceIDUsageDescription`).

### Scene 4: Discover Feed & Standards Review (0:45 – 1:05)
- [x] Go to **Discover** tab.
- [x] Scroll through user cards, inspect compatibility rating and user interests.
- [x] Tap to expand a profile to inspect their **Standards** (values, lifestyle preferences, and 3-day guided flow).
- [x] Perform a like/match interaction.

### Scene 5: Paid Content & In-App Purchases (StoreKit 2) (1:05 – 1:25)
- [x] Tap the **Coin Balance** badge in the navigation header or go to `/coins`.
- [x] Show the Coin Store screen with coin bundles:
  - 500 Coins ($0.49 / ₹49)
  - 1,000 Coins ($0.89 / ₹89)
  - 1,500 Coins ($1.29 / ₹129)
  - 2,000 Coins ($1.69 / ₹169)
  - 5,000 Coins ($3.99 / ₹399)
- [x] Tap **Buy** on any package (e.g. 500 or 1500 coins).
- [x] The **StoreKit Apple Pay / Sandbox sheet** appears.
- [x] Confirm sandbox purchase and show the celebration / updated coin balance.

### Scene 6: Safety, Content Reporting & User Blocking (1:25 – 1:40)
- [x] Open a profile or connection card.
- [x] Tap the **Shield / Menu** icon.
- [x] Select **Report / Block User**.
- [x] Choose a reason (e.g. "Inappropriate behavior", "Spam", or "Harassment") and tap **Submit Report**.
- [x] Verify user is blocked and removed from the active view immediately.

### Scene 7: Account Management, Pause & Deletion Flow (1:40 – 1:55)
- [x] Tap **Profile** -> **Settings** (`/settings`).
- [x] Show the **Pause Account** feature ("Go invisible without losing data").
- [x] Tap **Delete Account** -> Shows `DeleteReasonScreen`.
- [x] Select a reason, proceed to confirmation modal, confirm deletion.
- [x] Show instant redirection back to the clean `/login` screen.

---

## 📤 How to Provide the Video to Apple

1. **Option 1 (App Store Connect Attachment)**:
   - In App Store Connect -> *App Review Information* -> *Attachment*, upload the `.mp4` or `.mov` file (keep under 500MB).
2. **Option 2 (Resolution Center Reply with Direct Link)**:
   - Upload the video to an accessible cloud link (e.g. iCloud Shared Link, Google Drive, Vimeo unlisted, YouTube unlisted).
   - Paste the direct URL into your reply in Resolution Center.
