# iOS App Store — Resubmission After Guideline 4.3(b) Rejection

## What happened

- Aug 14: submission
- Aug 18, 6:06 AM: Apple rejected under **Guideline 4.3(b) — Design — Spam**: "The app primarily includes dating features that duplicate the content and functionality of similar apps that are already widely available... there are already enough of these apps on the App Store."
- Aug 19, 1:15 PM: resubmitted the same build with no changes addressing this — currently "Waiting for Review," very likely heading for the same outcome.

4.3(b) is a subjective judgment call about market differentiation, not a bug — it can't be fixed by resubmitting the same thing and hoping for a different reviewer. The fix is making GreenFlag's actual differentiators obvious both in the Resolution Center reply and in the store listing itself (screenshots are often what shapes a reviewer's first impression, more than text).

## Step 1: Reply in the Resolution Center

Full text already drafted and ready to send — see the conversation, or reconstruct from the differentiators below. Key points made: structured 3-day intention exchange before unlimited messaging, standards-first matching (define criteria before seeing anyone), and an active profile-review pipeline (not just report/block). Acknowledges the saturation concern honestly rather than being defensive.

## Step 2: Updated screenshots

`docs/ios-store-assets/` — 4 screenshots at Apple's exact required 6.9" resolution (1290×2796, verified against current spec, Apple will auto-scale down for smaller iPhones):

1. `01_hero.png` — "Define your standards. Then meet your match." / "Not another swipe app — intentional dating, done differently."
2. `02_standards.png` — visual diagram of the standards-first mechanic ("Set your standards before you swipe")
3. `03_intention_exchange.png` — Day 1 → Day 2 → Day 3 → Chat progression diagram (the exact mechanic Apple's rejection said wasn't differentiated)
4. `04_verified.png` — verified-profile-pipeline messaging

These are concept/diagram screenshots, not raw UI captures — deliberate, since the goal is making the *mechanic* differentiation unmistakable at a glance, which a raw screenshot of a chat screen wouldn't necessarily convey. Upload these in this order so the differentiation leads.

## Step 3: Updated description

Replace the current App Store description with (leads harder with "not another swipe app" framing than the original, to match the new screenshots and the Resolution Center reply):

```
GreenFlag isn't another swipe app — it's intentional dating, built around personal standards and a structured path to real connection.

NOT PHOTOS FIRST — STANDARDS FIRST
Before you ever see a potential match, you define your own standards: the specific, non-negotiable qualities you're actually looking for. Matches are surfaced against what you defined, not a photo feed to swipe through.

3 DAYS BEFORE UNLIMITED MESSAGING
Every match starts with a structured 3-day exchange — small, specific prompts each day that both people complete together. Unlimited messaging only opens up after that exchange, not the moment you match. It's built to surface real compatibility before the small talk.

VERIFIED, NOT JUST REPORTED
Every profile goes through a review step before it's visible to anyone else — an active moderation process, not just a report button added after the fact.

SAFETY FIRST
Report and block on any profile or conversation, reviewed by our team. Your account, your pace — pause or delete anytime from Settings.

COINS
Unlock additional profiles, photos, and reveals with coins — entirely optional, GreenFlag is free to download and use.
```

Subtitle (30 char max): keep as `Set Your Standards. Meet Your Match.` if it still fits, or shorten if needed.

## Checklist

- [ ] Send the Resolution Center reply (drafted in conversation)
- [ ] Upload the 4 new screenshots from `docs/ios-store-assets/` (in order)
- [ ] Replace the App Store description with the version above
- [ ] Do NOT resubmit the build again without doing the above — that's what already happened once and didn't help
