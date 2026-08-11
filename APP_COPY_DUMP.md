Got it - removing `membership` completely. Using `profile / account / circle` instead.

Here's the fixed version - same format, no membership word:

---

# GreenFlag — LUXURY Copy (No Membership Word)

## Login

- Heading: Welcome Back.
- Subheading: The Circle Awaits
- Placeholder: Email Address
- Placeholder: Password
- Button: Sign In
- Divider: —
- Text: New to Greenflag? [Begin Your Journey]
- Component: GoogleButton → "Continue with Google" / "Connecting..."
- Button: Sign Out

## Signup

- Heading: Set Your Standard.
- Text: Create Your Profile
- Toggle: Email / Phone
- EmailSignupForm — Placeholder: Full Name
- EmailSignupForm — Placeholder: Email Address
- EmailSignupForm — Placeholder: Password (min 6 characters)
- EmailSignupForm — Button: Creating Profile... / Join Greenflag
- PhoneOtpForm — Placeholder: Full Name
- PhoneOtpForm — Placeholder: Phone Number
- PhoneOtpForm — Button: Send Code
- OtpVerificationForm — Button: Change Number
- OtpVerificationForm — Text: Code sent to {phone}
- OtpVerificationForm — Placeholder: Enter Verification Code
- OtpVerificationForm — Button: Verify & Join
- OtpVerificationForm — Button: Resend Code
- Divider: —
- SignupFooter — Text: Already on Greenflag? [Sign In]
- Error: Welcome. Please sign in to continue.
- Error: Please enter a valid number

## Onboarding — Persona Select

- Button: Sign Out
- Text: Choose Your Path
- Card (woman): I Set The Standard
- Card (woman) desc: Define your 3-day Standard. He earns his way to you.
- Card (man): I Rise To It
- Card (man) desc: Discover curated profiles. Show intention. Earn the conversation.

## Onboarding — Phone

- Heading: Your Number / Verify Your Number
- Subtext: We'll send a discreet verification code
- Subtext: A code was sent to {phone}
- Button: Send Code
- Label: Verification Code
- Placeholder: 000000
- Button: Verify
- Button: Resend Code
- Button: Maybe Later
- Text: Signed in as {userEmail}. You can add your number later in Settings.
- Divider: —
- Toast: Code sent

## Onboarding — Profile

- Heading: Define Your Presence (woman) / Introduce Yourself (man)
- Label: Name — Placeholder: Your full name
- Label: Date of Birth
- Label: Location \* — (detecting...)
- Placeholder: Detecting location... / Your city
- Warning: We couldn't detect your city — please enter it manually, or [try again].
- Label: Instagram Handle \* / (Optional for Women)
- Placeholder: username
- Label: About You (optional) — Placeholder: A few words that define you...
- Label: Photos ({n} required)
- Text: {n}/{max} added
- Button: Continue
- Error: Name is required
- Error: Date of birth is required
- Error: You must be 18+
- Error: Please enter a valid date of birth
- Error: City is required
- Error: Please add at least 1 photo
- Error: Keep it under 200 characters
- Error: Instagram is required to verify
- Toast: Session expired. Please sign in again.
- Toast: Location found: {display}
- Toast: Photo upload failed: {error}

## Onboarding — Quiz

- Header: {n} of {total}
- Subtext: Choose what feels most like you
- Button: Next / Complete
- Toast: Please select an option to continue
- Toast: Saved
- Toast: Session expired
- **Questions:**
  - What brings you to Greenflag? → A long-term partnership / Marriage-minded / Intentional, but open / Exploring with intention
  - Your ideal Sunday? → Slow coffee & pages / Outdoors & movement / Brunch with your circle / Slow morning, no plans
  - How do you feel most loved? → Quality time together / Thoughtful words / Considerate actions / Physical presence
  - Your ideal first encounter? → A quiet coffee walk / Cocktails, low light / A class or experience together / An intimate dinner
  - How do you stay connected? → Thoughtful messages / Unplanned calls / Face to face / A shared sense of humor
  - Your humor? → Dry & understated / Playful & witty / Sharp & clever / Dark & dry
  - Where would you escape to? → Private beach / Old European city / Mountains, off-grid / Culinary capital
  - Pets? → Dog person / Cat person / Animal lover / Not just yet

## Onboarding — Interests

- Title 1: What Defines You — Choose 5
- Title 2: What You Value In Him (woman) / What You Value In Her (man)
- Button: Complete Profile
- Toast: Choose 5 that define you
- Toast: Choose 5 that you value
- Toast: Profile curated
- Interest tags: Books, Music, Travel, Fitness, Gastronomy, Art, Cinema, Philosophy, Spirituality, Business, Technology, Fashion, Nature, Coffee Culture, Nightlife, Yoga, Writing, Photography, Dance, Wellness

## Onboarding — Rules

- Header: House Rules
- Button: Agree & Continue
- **Rule slides:**
  1. Respect Is Standard — Every profile is treated with regard. No exceptions.
  2. No Noise — Keep it intentional. No spam, no mass messages.
  3. Discretion First — Share personal details only when you feel safe to.
  4. Intention Has Value — Show up genuinely. Effort is seen and valued.
  5. Your Circle, Your Rules — Manage privacy and preferences in Settings.
  6. Verified Profiles — Verified profiles are prioritized and distinguished.

## Onboarding — How It Works

- Heading: How Greenflag Works
- Subheading: Three days. One real connection.
- Button: Understood — Begin
- **Points:**
  1. 3 Days, 3 Intentions — Each day: one thought, one image, one voice. Simple. Honest.
  2. Sincerity Is Currency — Real answers open doors. Effort is seen.
  3. She Sets The Pace — After each day, she reviews. The next day unlocks after.
  4. Earn The Conversation — Complete all three days with intention, and the conversation begins.

## Onboarding — Pending Review

- Button: Sign Out
- Heading: Your Profile Is Being Reviewed
- Body: Greenflag is curated. We review every profile to maintain the standard. You'll be notified once you're approved.
- Countdown: MM:SS
- Text: You may explore while you wait.
- Button: Enter Discovery

## Onboarding — Rejected

- Button: Sign Out
- Heading: Not Approved This Time
- Label: Feedback
- Text: Refine your profile and resubmit. This will reset your previous submission.
- Button: Update & Resubmit

## Discovery

- Banner: Verification in progress
- Banner: You're verified. View your profile
- Coin pill (woman): {balance}
- Card badge: {n}% Greenflag Alignment
- Card badge (woman only): Intention from {n} person / Intention from {n} people
- Photo overlay button (man view): Meet Her Standard
- About label: The Standard
- Expand: ...more / Show less
- Buttons (woman): View Profile / Invite
- Buttons (man): Pass / Meet Her Standard
- Empty state heading: Your Curated Circle Is Complete
- Empty state body: No new profiles align with your Standard right now. Your circle will refresh soon.
- Confirm modal heading: Begin Her Standard?
- Confirm modal body: This will invest 500 coins to begin your 3-day introduction.
- Confirm modal buttons: Not Now / Begin
- Nudge-sent banner: Invitation Sent / {cost} coins invested
- Nudge-confirm modal heading: Invite Again?
- Nudge-confirm modal body: You've already invited this profile. Another invitation will invest {cost} coins.
- Nudge-confirm buttons: Cancel / Yes, Invite Again

## Standard Builder

- Header: Day {n} of {total}
- Heading: Set Your Standard
- Subtext: Each day: one thought, one image, one voice. He completes all three before you review.
- Day label: Day {n}
- Task labels: Thought / Image / Voice
- Custom input placeholder: Or define your own...
- Button: Continue to Day {n} / Set Live
- Toast: Complete all 3 intentions for today to continue.
- Day-lock dialog 1: "Day 1 — Defined." — You know what you want. That's rare. Let's set Day 2. — Button: Continue to Day 2
- Day-lock dialog 2: "Day 2 — Defined." — The bar is high. Finish Day 3 and your Standard goes live. — Button: Final Day
- **Preset chips:** Same as before, keep luxury tone.

## My Connections

- Heading: Your Circle
- Button: Discover New Profiles
- Status labels: Conversation Unlocked / She passed / Expired / Refunded / Day {n} of 3
- Badge: Unlocked
- Empty heading: Your Circle Is Empty
- Empty body: Discover someone to begin an introduction.

## Messages

- Header: Conversations
- Empty (man): No conversations yet. Discover curated profiles to begin.
- Empty (woman): Quiet for now — conversations begin once he meets your Standard.
- In-progress section label: Awaiting Your Standard
- Like button: Show Intention / Intention Shown
- Toast: Invitation sent — he's been nudged to begin your Standard
- ChatHeader badge: Connected
- ConnectedBanner: Connected. You may now exchange contacts.
- EmptyChat heading: You're connected
- EmptyChat body: Say hello to {partnerName}
- EmptyChat suggested openers: "Appreciated your effort on my Standard" / "That Day 2 answer stayed with me" / "Hello — shall we start properly?"
- MessageInput placeholder: Write a message...
- LockedOverlay heading: Conversation Locked
- LockedOverlay body: Chat unlocks after Day 3 review.
- LockedOverlay button: Back to Standard

## Task Flow

- Header: {otherProfile.name}
- Text: Day {n} of 3
- Banner: Access earned — you may message her anytime — Button: Open Conversation
- Locked state heading: Day {n} unlocks in
- Locked state text: Return then to continue with {name}.
- Task card label: Intention {n} ({type})
- Status: Complete ✓ / Under Review / Awaiting
- Button: Submit Response
- Text (woman, waiting): Awaiting his response...
- Buttons (woman review): Decline / Approve
- Label: His Response:
- Error: Connection not found — Button: Back to Discovery
- DayCompleteModal heading: Day Complete
- DayCompleteModal body: Tomorrow's intentions unlock at the same time tomorrow.
- DayCompleteModal buttons: Understood / Discover Profiles
- **SubmitSheet:**
  - Heading: Day {n}
  - Text placeholder: Write with intention (10–500 characters)...
  - Photo prompt: Tap to capture
  - Voice: Tap to record / Tap to finish / Ready to send
  - Voice recorded text: Voice captured ({n}s)
  - Button: Submitting... / Submit
  - Success heading: Submitted
  - Success body: Under review. Continue to your next intention, or explore in the meantime.
  - Buttons: Next Intention / Discover Profiles
  - Error: Insufficient coins. You need {n} coins to continue.
  - Error: Could not upload.

## Profile View — Own Profile

- Header: Profile
- Buttons: Edit Profile / Settings
- Coins card (men only): Balance: {balance} — Invest coins to begin introductions — Button: Get Coins
- Button: Sign Out

## Profile Edit

- Header: Edit Profile
- Pending banner: An update is under review. You can submit again once reviewed.
- Label: Photos (up to 3) — helper: First photo is your cover
- Label: Name / Age / City / About ({n}/120)
- Placeholder: Your name / A line that defines you...
- Button: Submitting... / Submit for Review

## Profile View — Other User

- ProfileActionBar: Edit Profile / Continue Standard / Beginning... / Meet Her Standard / Awaiting Review
- ProfileInfo: Shared Values / Values
- ReportModal heading: Report Profile
- ReportModal reasons: Misleading profile / Inappropriate content / Harassment / Other
- ReportModal placeholder: Share any relevant context...
- BlockConfirmModal heading: Block {name}?
- BlockConfirmModal body: They won't see you, and you won't see them again in Discovery.

## My Standard Section

- Heading: Her Standard
- Badge: Live / Draft
- Day label: Day {n}

## Settings

- Header: Settings
- Label: Phone — Badge: Verified
- Label: Email — Placeholder: email@example.com — Button: Update
- Label: Password — Button: Change Password
- Label: Notifications — toggles: Push / SMS / Email
- Danger Zone: Delete your account and all data — Button: Delete Account
- Button: Sign Out
- Delete confirm heading: Delete Account?
- Delete confirm body: This cannot be undone. All your data will be permanently removed.
- Delete confirm buttons: Cancel / Deleting... / Delete

## Coins

- Header: Wallet
- Balance label: Coins
- Package badges: Most Chosen / Best Value
- Package text: {n} Coins — ₹{price}
- Buy button: Processing... / Purchase
- Transaction history heading: History
- Empty: No transactions yet

## Notifications

- Header: Notifications — badge: {n} new
- Button: Mark all as read
- Empty heading: No notifications
- Empty body: We'll notify you when there's activity in your circle.

## Notification Templates

- New submission: "{guestName} completed Day {n}"
- Chat unlocked!: "{hostName} approved your Standard. You may now chat."
- Application rejected: "{hostName} chose not to continue. Your coins have been returned."
- New message: title = sender name, body = preview
- New connection: "{manName} invested to begin your Standard"
- Day approved: "Day {n} approved. Day {n+1} unlocked."
- Access earned!: "Day 3 approved. Conversation unlocked."
- You're Connected!: "Complete. You're Connected."
- Connection ended: "Connection ended."
- Submission ready: "{manName}'s Day {n} is ready for your review"
- Account suspended: "Your account has been paused."
- Submission rejected: "Response did not meet our guidelines."
- Someone nudged you: "{fromName} showed intention — view his profile"
- A little nudge: "{fromName} invited you to continue her Standard"

## Shared Nav

- BottomNav tabs (man): Discover / Circle / Conversations / Notifications / Profile / Wallet
- BottomNav tabs (woman): Discover / Circle / Conversations / Notifications / Profile
- PendingReviewBanner: "Under review — {MM}:{SS}"

## Static / Error Pages

- `app/banned/page.tsx`: "Account Paused" — "Your account is currently paused. Contact us if you believe this is an error." — Button: Sign Out
- `app/error.tsx`: "500" — "Something unexpected" — "We're looking into it. Please try again." — Button: Try Again
- `app/not-found.tsx`: "404" — "Not found" — "This page is no longer available." — Button: Back to Discovery

---

**ADMIN PANEL**

- Title: Dashboard
- KPI cards: Total Profiles ({n} men / {n} women) / Men / Women / Active Circles / Pending Review / Revenue / Connected Today
- Users List Title: Profiles — "{n} total"
- Filters: All profiles / Women / Men — All status / Active / Paused / Pending
- Table columns: Name / Persona / City / Joined / Circles / Coins / Status / Actions
- Status badges: Paused / Pending / Declined / Admin / Active
- Modals: Pause Profile / Decline Application / Remove Profile (no membership word anywhere)
