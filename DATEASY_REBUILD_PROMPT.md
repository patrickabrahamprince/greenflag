# Prompt: rebuild the GreenFlag UI to match the Dateasy design

Copy everything below the line into Claude Code. Attach
`screencapture-behance-net-gallery-198004119-Dateasy-Dating-Mobile-App-Ronas-IT.pdf`
to the same message.

---

You are rebuilding the UI of this app to match an attached design deck
**exactly**. Read this whole brief before writing any code.

## 1. What this codebase actually is

Do not assume. Verify each of these before you start:

- **Next.js 14, App Router**, TypeScript, Tailwind 3.4, Supabase, Zustand.
- It ships as an **iOS app via Capacitor** — a WKWebView wrapper. The
  Xcode project at `ios/App` is a shell. There is no Swift UI code. All UI
  is React + Tailwind.
- ~57 routes under `app/`, ~180 `.tsx` files, ~16.5k lines.
- Repo root: the directory containing `capacitor.config.ts`.

Read `package.json`, `tailwind.config.js`, `app/globals.css` and
`app/layout.tsx` first, then map the route tree with
`find app -name "page.tsx"`.

## 2. The single hardest constraint

**Change how it looks. Do not change what it does.**

This is a working product with real business logic — Standards, coins,
tasks, connections, admin moderation, Supabase queries, Capacitor
plugins. Every data fetch, state machine, route guard, haptic call and
permission check must survive untouched.

Two categories of code that look like styling but are **not**, and must
be preserved verbatim:

1. **The iOS/Capacitor fixes in `app/globals.css`.** The `--kb-inset`
   keyboard spacer on `.min-h-dvh`, `overscroll-behavior-y`, the
   scrollbar hiding, and the `-webkit-autofill` override. Each has a long
   comment explaining a real bug it fixes. Keep them and keep the
   comments.
2. **Product behaviour that reads as visual.** Example: the Discover card
   applies `blur(14px)` to her photo. That is the paywall, not a style.
   Read surrounding comments before "cleaning up" anything.

If you are unsure whether something is style or logic, leave it and say
so in your summary.

## 3. Design tokens — use these exact values

**The deck's own colour labels are wrong.** On the "font and colors"
page, three of the five swatches are all labelled `#D7FF81`. These values
were sampled from the artwork at 300dpi. Trust them, not the labels.

### Palette

| Name            | Hex       | Role                                        |
| --------------- | --------- | ------------------------------------------- |
| Mindaro         | `#D7FF81` | Primary accent — CTAs, active states, tags  |
| Lavender        | `#BC96FF` | Secondary — confirm buttons, the nav pill   |
| Persian Indigo  | `#371F7D` | Base screen background                       |
| Electric Violet | `#612AFF` | Vivid brand fill — logo tile, emphasis      |
| Pinkish Red     | `#FC4363` | Like/heart, destructive, unread badges      |
| White           | `#FFFFFF` | Primary text                                 |

### Elevation ramp

One continuous dark purple environment. **Depth is a step up this ramp,
never a shadow and never a gradient.**

| Token     | Hex       | Use                                        |
| --------- | --------- | ------------------------------------------ |
| `well`    | `#1B103B` | Recessed: inputs, slider tracks, scrims    |
| `base`    | `#371F7D` | The screen itself                           |
| `raised`  | `#4A2A8C` | Dividers, disabled fills                    |
| `card`    | `#522E98` | Cards, list rows, incoming message bubbles |
| `overlay` | `#5722A4` | Bottom sheets, modals, popovers            |

### CONTRAST RULE — read this twice

Mindaro and Lavender are **light** fills. Text and icons on them are
**dark** (`#371F7D`), never white.

```
bg-accent   → text-ink-dark  ✅        bg-accent → text-ink  ❌ unreadable
bg-lavender → text-ink-dark  ✅
bg-brand    → text-ink       ✅
bg-card     → text-ink       ✅
```

This will bite you. The existing codebase pairs its old accent with white
text in ~300 places because the old accent was dark magenta. After you
repoint the accent to Mindaro, **every one of those pairings is broken.**
Grep for them explicitly and fix each:

```bash
grep -rnE "bg-(accent|gold|lavender)\b" app components --include='*.tsx' | grep -E "text-white|text-ink\b"
```

Also check **icons**, not just text. `<Heart className="text-white" fill="white"/>`
inside a Mindaro circle is invisible, and grep for text colours won't
catch it.

### Typography

**Cabinet Grotesk**, weights 400/500/700/800.

It is **not on Google Fonts** — `next/font/google` cannot load it. Get it
from Fontshare (free for commercial use):

- Quickest: `<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap" rel="stylesheet">` in `app/layout.tsx`.
- Better for a Capacitor app, which must work offline: download the woff2
  files to `public/fonts` and use `next/font/local`. Do this if you can.

Scale — no uppercase, no letter-spacing on buttons. The outgoing theme
used `uppercase tracking-wide` on every button; the design uses neither.

| Token     | Size / line-height | Weight | Use                    |
| --------- | ------------------ | ------ | ---------------------- |
| `display` | 40 / 1.05          | 800    | "It's a match!", hero  |
| `title`   | 28 / 1.15          | 700    | Screen titles          |
| `heading` | 20 / 1.25          | 700    | Section headers, names |
| `body`    | 15 / 1.45          | 400    | Paragraphs, messages   |
| `label`   | 13 / 1.3           | 500    | Buttons, chips, nav    |
| `caption` | 11 / 1.3           | 500    | Timestamps, field labels |

### Radii

| Token    | Radius  | Applies to                          |
| -------- | ------- | ----------------------------------- |
| `pill`   | `999px` | Buttons, chips, tags, nav, inputs   |
| `card`   | `24px`  | Cards, list rows, sheets            |
| `photo`  | `20px`  | Photos, media thumbnails            |
| `tile`   | `16px`  | Small tiles, icon buttons           |
| Sheets   | `28px`  | Top two corners of bottom sheets    |

**Do not bulk-rewrite radii with a regex.** Mapping every `rounded-xl`
and `rounded-2xl` to 24px globally makes small elements — badges, 32px
avatars, tiny chips — look blobby and wrong. Set radii per component,
by looking at the element's size.

### Icons

`lucide-react` (already a dependency) at `strokeWidth={1.5}`, size 22.
The only filled glyph in the app is the heart on the like button.

## 4. Components — match the deck

- **Primary button** — Mindaro fill, dark text, pill, weight 700. Flat.
  No gradient, no glow, no animated border ring.
- **Secondary** — Lavender fill, dark text, pill.
- **Tertiary** — transparent, 1px Lavender border, white text.
- **Circular actions** — 56px, with the row's primary at 64px. Dismiss =
  `raised` fill + white glyph. Like = **Pinkish Red** fill + white heart.
  Play/pause = Mindaro fill + dark glyph.
- **Chips/tags** — pill, ~36px. Selected = solid Mindaro + dark text.
  Unselected = transparent + 1px Lavender border + white text.
- **Compatibility badge** — small solid Mindaro pill, dark glyph + `94%`.
- **Inputs** — filled `well`, no border at rest, Mindaro border on focus.
  The field label is a small caption **inside** the field, above the
  value. Not a floating label above the box.
- **Cards** — `card` fill, 24px radius, ~20px padding. **No border, no
  shadow.**
- **Bottom nav** — a floating **Lavender pill**, inset 16px from the
  screen edges, riding above `env(safe-area-inset-bottom)`. Icons only,
  no labels. The **active icon sits in a dark indigo (`base`) disc with a
  Mindaro glyph** — the pill is a light fill, so active reads by going
  *dark*, not lighter. Inactive glyphs are the same indigo at ~50%.
  It floats over content; it is not a bar welded to the bottom edge.

### Button sizing trap

Do **not** put `w-full` or a fixed `h-14` inside the `.btn-*` classes.
About 60 call sites already size themselves (`flex-1`, `text-sm px-4`,
`py-2.5`, `inline-block px-8 py-3`). Baking in width and height silently
overrides all of them and turns small inline buttons into full-width
slabs. Use padding plus `min-h-[52px]`, and let call sites set width.

## 5. Screens — compose these, don't just recolour

**This is the part that matters most.** A token swap gives you right
colours and wrong design. Each screen below has to be laid out to match
the deck.

- **Discover** — full-bleed photo card, `photo` radius. Story-style
  **segmented progress bar across the top**, one segment per photo,
  filled Mindaro. Compatibility pill top-right. Name + age and a pin +
  distance line overlaid bottom-left. **Circular action row overlapping
  the bottom edge of the card**: X, large centre action, red heart. The
  floating nav pill sits below.
- **Filters bottom sheet** — `overlay` fill, 28px top corners, title +
  round close button. Chip rows for "Looking for" and "Show me". Range
  sliders with Mindaro thumbs on a thin track. Full-width Lavender
  "Apply filters" pill.
- **Profile (own)** — round back and overflow buttons, centred square
  avatar with `photo` radius, name, small Lavender "Edit profile info"
  pill, then a **Mindaro subscription card** with decorative shapes and a
  red price circle, then plum settings rows with chevrons.
- **Profile edit** — avatar with a Mindaro circular edit badge, photo
  grid with red X badges and dashed `+` slots, then filled fields each
  with a caption label inside.
- **Chat list** — large "Chat" title with a round search button, a
  horizontal **story rail** of ringed avatars with a leading `+`, then
  **separated plum card rows** with gaps (not hairline dividers), each
  with avatar, name + age, preview line, and a Mindaro unread pill.
- **Conversation** — round back button, avatar, name + "Online". Outgoing
  bubbles **Mindaro with dark text**; incoming **plum with white**.
  Bubble corner nearest its author tucked to a smaller radius. Voice
  messages as a Mindaro play circle + waveform + duration. Composer is a
  single plum pill holding attach glyph, field, and a round send button.
- **Personality quiz** — "Skip" in Mindaro top-right, segmented Mindaro
  progress, large centred question, and a row of 5 circular
  agree/disagree options scaling red → neutral → teal, the selected one
  filled with a check.
- **Interests** — section headers with wrapped chip grids.
- **Match moment** — deep indigo, confetti geometry (circles, rounded
  triangles, four-point stars, blobs) **clustered above and below** the
  content, two tilted photo cards, headline, subline.

  The deck sets a Mindaro disc behind the headline — but it sits behind
  one short word, which is then rendered **dark** on the lime. Only copy
  that if your headline word is short and you flip that word to dark
  text. A big disc behind a long white headline is unreadable.

## 6. Backgrounds

Flat `base` fill. The outgoing theme painted a magenta radial glow over
near-black on every screen — remove all of it, including the duplicated
copies in `.screen-gradient` and `.page-container`.

Photo scrims may stay gradients (they do real work over imagery), but
fade to the base purple, not to black.

## 7. Method

1. **Branch first.** `git checkout -b redesign/dateasy`.
2. **Foundation before screens.** Rewrite `tailwind.config.js` tokens,
   `app/globals.css` component classes, and the font in `app/layout.tsx`.
   Keep the old token names (`gold`, `cream`, `surface`, `border`,
   `black`…) as **aliases pointing at the new palette** — that repoints
   ~470 existing call sites without editing them, and the previous theme
   migration in this repo used the same trick.
3. **Then sweep hardcoded colours.** There are ~455 hex literals across
   ~110 files, plus more in `rgba()` form that a hex grep will miss.
   Map them onto tokens. **Exclude `components/ui/GoogleButton.tsx`** —
   those four hexes are Google's brand colours and must stay exact.
4. **Then compose the screens**, one at a time, from section 5.
5. **Look at every screen you change.** See section 8.

## 8. Verification — non-negotiable

Do not judge this from CSS. Render it and look.

```bash
npx tsc --noEmit          # must be clean
npx vitest run            # 47 tests must stay green
npx next build            # all routes must compile
npm run dev               # then actually open the screens
```

Use browser tooling to screenshot each screen at iPhone width and compare
it against the corresponding deck page **side by side**. Fix, rebuild,
re-screenshot. A screen you have not looked at is not done.

Confirm the old palette is fully gone — remember Tailwind minifies hex to
space-separated `rgb()`, so grep the compiled CSS for `rgb(` triplets,
not hex:

```bash
grep -o "201 169 97\|192 38 211\|237 234 222\|142 142 147" .next/static/css/*.css   # expect zero
```

## 9. Known traps in this specific repo

- `components/discover/DiscoverCard.tsx` **has no callers.** The live
  Discover UI is inline in `app/discover/page.tsx`. Check for callers
  before restyling any component.
- `.git/index.lock` may be stale and block commits; remove it if so.
- `tests/unit/MatchMomentOverlay.test.tsx` asserts on the exact headline
  string — don't split that text node across elements.
- Some files have macOS-conflicted duplicates (`sw 2.js`, `sw 3.js`).
  Ignore them.
- Comments in this codebase explain real bugs. Never let a
  find-and-replace edit prose inside a comment. Check your diffs.

## 10. Deliverable

- A `DESIGN_SYSTEM.md` at the repo root documenting the final tokens.
- Commits grouped by concern: foundation, colour sweep, then one per
  screen group.
- A summary listing every screen you looked at, with anything you chose
  **not** to copy from the deck and why.
