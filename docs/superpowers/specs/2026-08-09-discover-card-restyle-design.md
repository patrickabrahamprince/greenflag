# Discover Card Restyle — Phase 1 (Design Spec)

## Context

Full brief: a multi-phase design pass (Discover restyle, then a shared button/icon/app-icon/animation system) using two Behance dating-app case studies as reference — Flare (primary visual/system reference) and Dateasy (one pattern only: the compatibility badge). This spec covers **Phase 1 only**: the Discover screen and its card component (`app/discover/page.tsx`). Phase 2 (shared design system) is explicitly out of scope until this phase is reviewed and approved.

## References — what's actually being taken from each

**Flare** (`Flare-Dating-Mobile-App-UIUX-Design.pdf`): full-bleed, edge-to-edge single-card photo layout with no visible card border in its own swipe/home screen — this already matches how GreenFlag's Discover is built today (`snap-start snap-always h-dvh w-full`, true full-bleed). A small, *tight* "Vibe Match" pill badge sits at the card's top corner (icon + short label, not a wide bar). The accent color (orange/coral) is used sparingly — on badges and primary CTAs, not washing the screen. Typography carries hierarchy through size/weight contrast alone (Roboto, no display-font pairing) — not being adopted here, since GreenFlag already has its own type identity (`font-serif` for names, `font-display` elsewhere) and copying Flare's font would erase brand distinctiveness rather than build it.

**Dateasy** (`Dateasy-Dating-Mobile-App-Ronas-IT.pdf`): exactly one pattern is in scope per the brief — the compatibility badge is a *small pill anchored to a card corner* (icon + percentage), not a wide banner. Everything else about Dateasy (purple/lime/pink palette, blob shapes, comic-style match bubble) is explicitly out of scope and not referenced further.

**Not adopted from either**: color palette. GreenFlag keeps its existing tokens (`black-deep: #0A0A0A`, `gold: #C026D3`/`gold-light: #E879F9`/`gold-dark: #86198F` — the "gold" token names are historical; the actual color family is magenta/violet, confirmed in `tailwind.config.js`).

## Current state (verified against `app/discover/page.tsx`)

- Card: full-bleed `h-dvh w-full`, no rounded corners, bottom gradient scrim (`from-black via-black/75 to-transparent`) + a masked backdrop-blur strip for legibility. This already matches Flare's own full-bleed swipe screen — **no structural layout change needed here**.
- Match badge (lines 397–411): a `glass-surface` pill containing a `◆` character glyph + `"{percentage}% Greenflag Alignment"` in `font-display font-bold text-sm`. This is the one piece that doesn't match either reference: it reads as a wide, wordy bar rather than a tight badge.
- Typography audit: name is `font-serif text-4xl font-semibold` — already a confident, high-contrast display treatment against the `text-sm uppercase tracking-wide` age/city line below it. Job/height/interest-chip sizing follows the same restrained scale. **No structural typography issues found** — hierarchy already reads as intentional, not a generic default stack.
- Action row (Pass / Gift / Meet Her Standard for men, View Profile / Nudge for women): already rebuilt this session with `min-w-0` overflow fixes and consistent sizing. Out of scope for restyling here — Phase 2's shared button component will formalize these variants without needing a visual change to this row first.

## Phase 1 changes

### 1. Match badge — shrink and re-anchor

Replace the wide `"◆ 87% Greenflag Alignment"` bar with a tight corner pill: small flag icon + bare percentage number only (no "Greenflag Alignment" text), matching Dateasy's compactness and corner placement, Flare's restraint (no wall-to-wall color), GreenFlag's own palette (`glass-surface` background retained, magenta/violet accent on the icon only). The `persona === 'woman'` interest-count sub-badge stays as a second, smaller pill directly below it — unchanged. (The icon itself is specified in the next section — this section is about the badge's overall shape/content, not the specific glyph.)

### 2. Signature element — flag-mark icon

The `◆` diamond glyph in the badge is replaced with an actual flag icon (`lucide-react`'s `Flag`, already a project dependency — no new icon library added). This is the one deliberate, distinctive choice: every card, every session, carries a literal flag mark tying the badge back to the app's own name — something neither reference does (Flare uses a flame, Dateasy a compass/heart-ring icon). Small and quiet, not a redesign of the mark's prominence — same size/weight as the current `◆`, just a different glyph.

### 3. What's explicitly NOT changing in Phase 1

- Card shape, full-bleed photo treatment, gradient scrim — already correct.
- Typography scale/weights — audited, no issues found.
- Action row button styling — Phase 2 territory.
- Any animation/transition — Phase 2 territory.
- Backend/ranking/payment logic — never in scope per the original brief.

## Component boundaries

No new component needed. The badge markup (lines 397–411) is a small, self-contained JSX block already; changing its icon and text content is a contained edit, not a refactor. If Phase 2's shared design system later wants a reusable `<MatchBadge>` component (e.g., if the same badge needs to appear on the profile detail screen too), that's a Phase 2 decision, not Phase 1.

## Testing / verification

This is a visual-only change with no new logic branches — verified by: `tsc --noEmit`, `npm run build`, and a live screenshot/description of the rendered card (badge placement, icon, size) for review, since this repo doesn't have visual regression tooling and the change is small enough that a direct look is more reliable than a snapshot test.

## Self-critique (per the design skill's process)

Does this read as a distinctive GreenFlag identity, or generic dark-mode-plus-accent-color? Honest answer: the *card layout* was already close to right before this pass (full-bleed, restrained accent, confident type) — the real risk of "generic" was concentrated entirely in that one wordy, catch-all badge. Narrowing Phase 1 to fixing exactly that (plus the flag-mark signature) is a smaller change than the original brief implied, but it's the accurate scope once the references are checked against what's actually on screen today — padding out Phase 1 with unnecessary rework elsewhere would violate the brief's own instruction not to over-build.
