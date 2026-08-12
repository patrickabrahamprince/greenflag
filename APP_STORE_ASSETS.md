# GreenFlag - App Store Assets & Submission Checklist

## 🎯 App Store Connect Information

### Basic Info
- **App Name**: GreenFlag
- **Subtitle**: Set Your Standards. Meet Your Match.
- **Bundle ID**: com.greenflag.app (or com.yourcompany.greenflag)
- **Version**: 1.0.0
- **Build Number**: (start at 1, increment with each build)
- **Team ID**: (get from Apple Developer Account)

### Category & Rating
- **Category**: Lifestyle (Social Networking)
- **Content Rating**: 17+
- **Rating Reason**: Contains dating/romantic themes

---

## 📱 Required App Assets

### 1. App Icon
- **Size**: 1024 × 1024 pixels
- **Format**: PNG
- **Requirements**:
  - No transparency
  - No borders or shadows
  - Rounded corners (system applies them)
  - High contrast for visibility

### 2. App Screenshots

**Required for each device type:**

#### iPhone (6.7-inch) - Recommended
- 6-7 screenshots showing main features
- Suggested order:
  1. Onboarding/Login
  2. Discover page
  3. Profile
  4. Day 1-3 messaging
  5. Coins/Store
  6. Settings

#### iPhone (6.1-inch) - Required
- Same 6 screenshots as above

#### iPad Pro (12.9-inch) - Required
- Same 6 screenshots (will auto-scale)

**Screenshot Requirements:**
- Size: 1290 × 2796 pixels (iPhone)
- Format: PNG or JPG
- No borders/bezels
- Clear, high contrast
- Add text/captions explaining features

### 3. Preview Video (Optional but Recommended)
- **Duration**: 15-30 seconds
- **Format**: MOV, MP4, or M4V
- **Resolution**: 1080p minimum
- **Aspect Ratio**: 9:16 (portrait)
- **Content**: Show key features in action

### 4. Description

**Subtitle** (30 characters max):
"Set Your Standards. Meet Your Match."

**Full Description** (4000 characters max):
```
GreenFlag is a dating app designed for people who value genuine connections over endless swiping.

Set Your Standards
Define what matters to you: your values, lifestyle, interests, and what you're looking for. This foundation becomes the core of your matching algorithm.

Get Matched Smart
Our algorithm finds people who align with your standards—not just likes and comments. Each profile shows your compatibility percentage and why you match.

Day 1, 2, and 3 Flow
After matching, you have three days to genuinely connect. Each day, you and your match share one intention (thought, photo, or voice note). This builds real chemistry naturally.

Exchange with Purpose
- Day 1: Share your initial thoughts and first impressions
- Day 2: Exchange deeper questions about values and personality
- Day 3: Share something personal to build real connection
- After Day 3: Unlock unlimited messaging and video calls

Smart Messaging
Your first message is auto-generated based on shared interests. Daily conversation prompts help you go deeper at your own pace.

Earn With Coins
- Get 10 free coins every week just for using the app
- Unlock premium features like profile reveals or special messaging options
- Send thoughtful gifts to show you're interested
- Coins are completely optional—use the app for free

Safety First
- All profiles verified for real people
- Block, report, or unmatch anyone anytime
- Your photos are never shared unless you choose
- Community guidelines enforced

GreenFlag isn't about quantity—it's about quality. Join a community dedicated to genuine connections, meaningful conversations, and finding someone who gets you.
```

### 5. Keywords (Max 30, comma-separated)
```
dating, relationships, singles, matching, social, love, connection, genuine, standards, quality dating, authentic, verified profiles, safe dating, meaningful relationships, find love
```

---

## 🔑 Demo Account Instructions for Reviewers

### How to Test the App

**Step 1: Create Accounts**
- Tap "Sign Up" → Choose email or OAuth (Google/Apple)
- Create two accounts:
  - Account A: Female user
  - Account B: Male user

**Step 2: Complete Onboarding**
- Follow the 8-step flow (Persona → How-It-Works → Name → Phone → Profile → Quiz → Interests → Rules)
- Upload 3-5 photos for each account
- Add genuine bios and interests

**Step 3: Test Matching**
- Log in as Account B (male)
- Swipe through profiles and like Account A (female)
- If Account A likes back, you'll get a match

**Step 4: Test Day 1-3 Flow**
- After match, you'll see Day 1 intentions
- Complete all 3 days of messaging
- Observe how messaging unlocks after Day 3

**Step 5: Test Coins System**
- Navigate to Coins page
- Try purchasing coins (use TestFlight sandbox)
- Use coins to unlock photos or send special messages

**Step 6: Test Settings**
- Notification preferences
- Account pause
- Account deletion
- Profile editing

**Step 7: Admin Panel (Optional)**
- Go to `/admin/login` (visible in app UI or direct link)
- Use provided admin credentials
- View admin dashboard for profile management

---

## ✅ Pre-Submission Checklist for App Store Connect

### App Information
- [ ] App name: "GreenFlag"
- [ ] Subtitle: "Set Your Standards. Meet Your Match."
- [ ] Description: (copy from above)
- [ ] Keywords: (copy from above)
- [ ] Support URL: support@greenflag.app (or contact form)
- [ ] Privacy Policy URL: (must be accessible)
- [ ] Terms & Conditions URL: (must be accessible)

### App Icon & Screenshots
- [ ] Icon uploaded (1024×1024px PNG)
- [ ] Screenshots for iPhone 6.7": 6 images
- [ ] Screenshots for iPhone 6.1": 6 images
- [ ] Screenshots for iPad Pro 12.9": 6 images
- [ ] Preview video (optional): uploaded

### General App Information
- [ ] Version number: 1.0.0
- [ ] Build number: (increment from Xcode)
- [ ] Category: Lifestyle (Social Networking)
- [ ] Content Rating: 17+

### Age Rating Questionnaire
- [ ] Complete Apple's age rating questionnaire
- [ ] Answer "Yes" for dating features
- [ ] Answer appropriately for user-generated content

### Pricing & Availability
- [ ] Availability: Select countries (India, worldwide, etc.)
- [ ] Free app with in-app purchases
- [ ] In-app purchases configured:
  - [ ] 500 coins: ₹49
  - [ ] 1000 coins: ₹89
  - [ ] 1500 coins: ₹129
  - [ ] 2000 coins: ₹169
  - [ ] 5000 coins: ₹399

### Rights & Declarations
- [ ] Confirms you own or have rights to all content
- [ ] No restricted content (violence, hate speech, etc.)
- [ ] Age-appropriate for 17+ rating
- [ ] Privacy policy covers all data collection
- [ ] No hidden ads or misleading content

### Review Information
- [ ] App review notes: (see below)
- [ ] Demo account credentials:
  - Email: test.woman@greenflag.app
  - Email: test.man@greenflag.app
- [ ] Screenshot showing demo accounts work
- [ ] Any special instructions for testing

### Sample Review Notes
```
Thank you for reviewing GreenFlag!

GreenFlag is a dating app focused on genuine connections. Users set their standards, get matched based on compatibility, and exchange daily intentions over a 3-day period before unlocking full messaging.

To test the app:
1. Create two accounts (preferably one male, one female)
2. Complete onboarding for both accounts
3. From male account: Like female profile
4. From female account: Like male profile back to match
5. Complete Day 1-3 messaging flow
6. Test coins purchase in Settings
7. Explore admin panel at /admin (use provided credentials)

Key features:
- Standards-based matching algorithm
- 3-day intention exchange before messaging
- Verified profiles
- Free with optional coin purchases
- Safety features (block, report, unmatch)
- Admin panel for internal profile management

Test accounts are set up and ready to use. Please feel free to create additional accounts as needed.
```

---

## 🚀 Final Checklist Before Hitting Submit

- [ ] All screenshots completed and uploaded
- [ ] Privacy policy live and accessible
- [ ] Terms of service live and accessible
- [ ] Support contact method working
- [ ] Demo accounts created and tested
- [ ] TestFlight build uploaded and processed
- [ ] Age rating questionnaire complete
- [ ] In-app purchases configured
- [ ] App review notes written
- [ ] All required info fields filled out
- [ ] Pricing tier selected
- [ ] Availability set correctly
- [ ] Ready for submission button clicked

---

## 📝 Submission Timeline

**Expected Review Time**: 24-48 hours  
**Common Issues**: Usually minor (missing privacy policy link, demo account info, etc.)  
**Appeal Process**: If rejected, address feedback and resubmit

---

## 📱 App Store URLs (After Launch)

- App Store: https://apps.apple.com/app/greenflag
- Direct Link: https://apps.apple.com/app/id[YOUR_APP_ID]
- Support: support@greenflag.app
- Privacy: https://greenflag.app/privacy
- Terms: https://greenflag.app/terms

---

**Status**: Ready for App Store submission ✅
