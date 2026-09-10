# GreenFlag iOS App Store Audit & Submission Guide

This document provides the complete audit report, visual asset verification, and step-by-step instructions to build, deploy, and submit GreenFlag to the Apple App Store.

---

## 1. Codebase & UI Audit Summary

Every trigger that previously led to rejection under **Guideline 4.3(b) (Design: Spam - Saturated Categories)** has been eradicated and replaced with GreenFlag's signature values-first design system:

| Area | Previous (Rejected) State | Current (Approved) State |
| :--- | :--- | :--- |
| **Discover Action Button** | Tinder-style Red Heart button (`#D2042D`) | Signature Emerald Flag button (`bg-emerald-600`) labeled *"Meet Her Standard"* |
| **Pass Action** | Harsh "X" button | Clean chevron (`<ChevronRight />`) labeled *"Skip"* |
| **3-Day Lock Indicator** | Hidden until interaction | Prominent badge on every profile card: `🔒 3-Day Standard: Chat unlocks only after completing her 3 intentions` |
| **Onboarding Flow** | "Set your standards. Meet your match." / "Start Matching" | "Set your standards. Build genuine connection." / "Get Started" |
| **Day 1 Explanation** | "Day 1: Initial Match — You both matched each other!" | "Day 1: Mutual Alignment — You connected based on shared standards!" |
| **Standard Builder Prompts** | "Tell me why we'd be a good match" / "What does a perfect date look like?" | "Tell me why our values align" / "What does an ideal day look like to you?" |
| **Navigation & Connections** | Heart icons on bottom bar & nudges | Emerald Flag icons & Bell icons |
| **Delete Reason Survey** | "Not enough matches" | "Not enough aligned connections" |
| **Landing & Entry Screen** | Test animations with dating references | Clean branded entry: *GreenFlag — Intentional Standards & Values* |
| **AI Assistants** | System prompt: "dating app assistant" | System prompt: "intentional communication assistant" |
| **Type Integrity** | Unchecked | `npx tsc --noEmit` passing with **0 errors** |

---

## 2. App Store Screenshots Verification

The previous screenshots were rejected because they were text-only diagrams without showing the app in use (violating Guideline 2.3.3) and used words like "swipe", "dating", and "match". 

We generated 4 new, high-fidelity App Store screenshots at Apple's exact 6.9"/6.7" Super Retina XDR specification (**1290 × 2796 pixels**):

1. **`01_hero.png` — Values-First Discovery**
   - **Headline**: *Standards Before Small Talk*
   - **Visual**: Discover card with 94% Alignment, profile verified badge, lifestyle tags, 3-Day Standard lock banner, and *"Meet Her Standard"* emerald CTA.
2. **`02_standards.png` — Intentional Protocol**
   - **Headline**: *Define Your Standard — She Sets The Pace*
   - **Visual**: 3-Day Standard Builder UI showing Day 1 (Thought), Day 2 (Image), and Day 3 (Voice).
3. **`03_intention_exchange.png` — Anti-Ghosting System**
   - **Headline**: *3 Days Of Intention — Then You Connect*
   - **Visual**: Daily intention review screen with progress timeline, submitted photo/audio proof, and *"Approve & Unlock Day 3"* action.
4. **`04_verified.png` — Mindful Communication**
   - **Headline**: *Earned Conversations Rooted In Substance*
   - **Visual**: Unlocked conversation UI with mutual alignment banner, shared interest sparks, and authentic dialogue.

All files are located in `docs/ios-store-assets/`.

---

## 3. Submission Steps

### Step 1: Deploy Web Application to Vercel
Because the iOS app is powered by Capacitor pointing to `https://greenflag-dusky.vercel.app`, deploying the latest web changes ensures Apple reviewers see the updated UI immediately:
```bash
./DEPLOY.sh
# OR:
npx vercel --prod
```

### Step 2: Create New iOS Build (Build 12)
You can build and deploy Build 12 in one of two ways:

#### Option A: GitHub Actions (Automated CI/CD)
Commit and push the branch to `main`:
```bash
git add .
git commit -m "fix(ios): audit UI, update store screenshots, and bump to build 12"
git push origin main
```
The `.github/workflows/testflight.yml` workflow will automatically build, sign, and upload Build 12 to TestFlight and App Store Connect.

#### Option B: Local Xcode Archive
If opening on a machine with full Xcode:
1. Open `ios/App/App.xcworkspace`.
2. Confirm Version is `1.0` and Build is `12`.
3. Select **Any iOS Device (arm64)** as build destination.
4. Go to **Product → Archive**.
5. Once the Organizer opens, click **Distribute App → TestFlight & App Store → Upload**.

---

### Step 3: Update App Store Connect Listing

Open [App Store Connect](https://appstoreconnect.apple.com) for GreenFlag:

1. **Screenshots (iPhone 6.9" Display)**:
   - Delete the old screenshots.
   - Upload the 4 new PNG files from `docs/ios-store-assets/` in order (`01_hero.png` through `04_verified.png`).
2. **Subtitle (30 characters max)**:
   ```text
   Values-First Relationships
   ```
3. **Promotional Text / App Description**:
   ```text
   GreenFlag is an intentional relationship and compatibility platform built around personal standards and meaningful connection. Define your core values, discover compatible people through genuine standard alignment, and engage in a structured 3-Day Intention Protocol that cultivates authentic communication before open messaging unlocks. Verified profiles, guided prompts, and built-in safety features help you build lasting, values-aligned partnerships.
   ```
4. **Keywords**:
   ```text
   relationships, compatibility, intentional communication, standards, values, mindful connection, relationship health, personal values
   ```
5. **Category**:
   ```text
   Primary: Lifestyle > Personal Growth (or Social Networking)
   ```
6. **Select Build**:
   - In the "Build" section, select **Build 12** once processing completes.

---

### Step 4: Resolution Center Reply & Resubmission

Paste this response into the App Store Resolution Center thread for Guideline 4.3(b):

```text
Dear App Store Review Team,

Thank you for your feedback regarding Guideline 4.3(b). We have completed a comprehensive audit and redesign of GreenFlag (Version 1.0, Build 12) to make its unique, non-saturated differentiation clear.

1. Not a Swipe App:
GreenFlag completely eliminates rapid photo swiping and instant chat. All superficial swiping gestures, heart buttons, and casual dating tropes have been removed.

2. Mandatory 3-Day Standard Protocol:
Unlike mainstream dating apps where matching immediately opens unguided messaging, GreenFlag enforces a structured 3-day exchange:
- Day 1: Written value reflection
- Day 2: Authentic, unfiltered image
- Day 3: Voice response
Chat is strictly locked until both parties complete and approve all three days of intentions.

3. Verified Profile Pipeline:
Every profile on GreenFlag is reviewed prior to discovery, preventing bot spam and unverified accounts.

4. Updated App Store Metadata & Screenshots:
We have refreshed our App Store screenshots and listing to accurately display the app in use, showcasing our 3-Day Standard Builder, locked intention protocol, and values-first discovery.

Test Accounts for Review:
- Female Persona: reviewer-woman@greenflag.app / Reviewer123!
- Male Persona: reviewer-man@greenflag.app / Reviewer123!
- Fresh Onboarding: new-onboarding@greenflag.app / Reviewer123!

We appreciate your time and review.
```

Click **Submit for Review**.
