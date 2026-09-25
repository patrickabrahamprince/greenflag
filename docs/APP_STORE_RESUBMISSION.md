# iOS App Store — Resubmission After Guideline 4.3(b) Rejection

## What happened

- Aug 14: submission
- Aug 18, 6:06 AM: Apple rejected under **Guideline 4.3(b) — Design — Spam**: "The app primarily includes dating features that duplicate the content and functionality of similar apps that are already widely available... there are already enough of these apps on the App Store."
- Aug 19, 1:15 PM: resubmitted the same build with no changes addressing this — currently "Waiting for Review," very likely heading for the same outcome.

4.3(b) is a subjective judgment call about market differentiation, not a bug — it can't be fixed by resubmitting the same thing and hoping for a different reviewer. The fix is making GreenFlag's actual differentiators obvious both in the Resolution Center reply and in the store listing itself (screenshots are often what shapes a reviewer's first impression, more than text).

## Step 1: Reply in the Resolution Center

Full text already drafted and ready to send — see the conversation, or reconstruct from the differentiators below. Key points made: structured 3-day intention exchange before unlimited messaging, standards-first matching (define criteria before seeing anyone), and an active profile-review pipeline (not just report/block). Acknowledges the saturation concern honestly rather than being defensive.

## Step 2: Updated screenshots

`docs/ios-store-assets/` — 4 screenshots at Apple's required Pro Max resolution (1284×2778, Apple auto-scales down for all iPhones):

1. `01_hero.png` — "Any Trip. Meet Your Crew." (Road trips, beach escapes, mountain treks, cafe crawls, or camping)
2. `02_standards.png` — "Post Your Trip. Pick Your Travel Vibe." (Destination, departure dates, transport split, budget)
3. `03_intention_exchange.png` — "Instant Chat. Plan The Journey." (Direct 1-on-1 and group chat once trip request is accepted)
4. `04_verified.png` — "Safe Travel Community. Verified Profiles." (Phone verification, host approval gates & female-only trips)

Upload these 4 PNGs in order to App Store Connect.

## Step 3: Updated description

Replace the current App Store description with:

```
Don't travel alone. GreenFlag is the app for meeting new people for any trip. Road trips, weekend getaways, beach escapes, mountain treks, cafe crawls, or camping — discover verified travel companions, plan itineraries, split rides and stays safely, and explore together. Built-in female-only trip filters and host approval gates ensure a safe, authentic travel community.

ANY TRIP, ANY VIBE
Browse open trips or post your own. Whether it's a weekend road trip to Coorg, a beach getaway in Goa, cliff hiking in Gokarna, or camping by the river in Rishikesh — find verified companions heading to your dream destinations.

HOST APPROVAL & DIRECT CHAT
No endless swiping. Send a quick intro request to join an open trip. Once the host reviews and approves your request, direct chat unlocks immediately so you can coordinate packing lists, departure times, and homestays.

FEMALE-ONLY TRAVEL SAFETY
Verified female travelers can host and discover trips designated strictly for women, providing complete peace of mind on every journey.

FAIR & TRANSPARENT COST SPLITS
Every trip features transparent daily budget expectations and transport splits (self-drive SUV, Royal Enfield ride, carpooling, train, or flight).

COMMUNITY SAFETY
Phone verification, profile moderation, zero tolerance for harassment, and instant reporting/blocking keep our travel community safe and respectful.
```
Unlock additional profiles, photos, and reveals with coins — entirely optional, GreenFlag is free to download and use.
```

Subtitle (30 char max): keep as `Set Your Standards. Meet Your Match.` if it still fits, or shorten if needed.

## Checklist

- [ ] Send the Resolution Center reply (drafted in conversation)
- [ ] Upload the 4 new screenshots from `docs/ios-store-assets/` (in order)
- [ ] Replace the App Store description with the version above
- [ ] Do NOT resubmit the build again without doing the above — that's what already happened once and didn't help
