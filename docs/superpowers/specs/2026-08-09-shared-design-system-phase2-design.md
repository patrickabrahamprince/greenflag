# Shared Design System — Phase 2 (Design Spec)

## Context

Phase 2 of the multi-phase design pass, following Phase 1 (`2026-08-09-discover-card-restyle-design.md`, approved). Covers buttons, icon-library audit, app icon, and animation/motion — visual/interaction layer only, no backend/ranking/payment logic changes. Both mockups reviewed and approved via published artifacts.

## 1. Buttons

**Kept as-is** (already distinctive, not generic): `.btn-primary`'s gradient fill (`#E879F9 → #C026D3 → #86198F`), sheen overlay, and the slow animated conic-gradient light traveling its border (`app/globals.css` lines 133–191). `.btn-secondary`'s glass-surface treatment and `.btn-ghost`. Press feedback (`active:scale-[0.98]`, ~100ms) is already correct on all three.

**New: icon-only variant.** A circular button (`46×46px`, `glass-surface`-style background, `active:scale-[0.92]` on press — slightly more pronounced than the pill buttons' 0.98 since it's a smaller target and benefits from more visible feedback) for card actions. This formalizes a pattern that already exists ad hoc (Discover's Pass/Gift buttons use inline `glass-surface size-11 rounded-full` styling) into a reusable variant.

**New: standardized loading state.** Currently hand-rolled per call site — verified 3+ separate instances of the same `{loading ? <Loader2 className="animate-spin" /> + 'Verb-ing...' : 'Label'}` ternary (`components/guest/PackageCard.tsx:58-62`, `components/connection/SubmitSheet.tsx:622`, and others). Replacing with one `<LoadingButton>` wrapper (or a `loading` prop on the existing button classes) that: shows a small spinner before the label, switches the label to present-continuous with no ellipsis ("Processing" not "Processing..."), holds the button's width steady (no layout shift), and disables interaction — same visual result everywhere, one implementation instead of several. This directly addresses a real, concrete problem from earlier in this session (payment/review actions with unclear pending states).

**Disabled state**: already present via `disabled:opacity-50 disabled:cursor-not-allowed` on `.btn-primary`; extending the same to `.btn-secondary`/`.btn-ghost` for consistency (currently only present on primary).

## 2. Icon library

Audited: `lucide-react` is already the **only** icon dependency in the project (confirmed via `package.json` and a repo-wide grep for `react-icons`/`heroicons`/other icon packages — none found). No consolidation needed. No action item here.

## 3. App icon

Three concepts designed and reviewed at real 60×60px scale (the actual iOS home-screen minimum):

- **A — Flowing flag** (recommended): an asymmetric, wave-shaped pennant, not a rigid clipart triangle — a single bold white silhouette on the app's gradient background. Holds up cleanly at 60px since it's one uninterrupted shape with no fine internal strokes.
- **B — Check-flag hybrid**: a checkmark whose rising stroke flares into a small flag shape, fusing "approved" with the brand name. More conceptually distinctive than A, but its two-stroke construction reads slightly noisy at 60px with the stroke weight shown — would need a bolder stroke to survive further scaling to a notification-badge size.
- **C — Furled G monogram**: included for completeness. Explicitly not recommended — the loop reads ambiguous at a glance (closer to a stray "e" than a flag) at small scale.

**Decision**: proceed with **Concept A**. Deliverables at implementation time: SVG source, then rasterized via `rsvg-convert`/`sips` (both confirmed available locally) into the full required size set — PWA (`192×192`, `512×512`) and iOS native (`Assets.xcassets` full Apple-required set).

## 4. Animation

**The match moment** (the one place explicitly worth genuine delight, per the original brief): GreenFlag currently has **no** celebration screen on a successful match — `handleBegin` in `app/discover/page.tsx` either routes straight to `/task/[matchId]` or shows a plain `toast.success("You've met her Standard")`. New sequence, total under 1.1s:
1. Two profile-photo cards settle in at a slight opposing angle (620ms, overshoot ease, staggered 100ms between the two)
2. The flag mark (same glyph as the app icon and the Discover badge — the signature element now appears in three places) pops with a soft glow at the point where the cards overlap (620ms, delayed 280ms)
3. Title/subtitle fades up last (delayed 480ms)

**Everything else — specified as timing, not individually demoed:**

| Interaction | Timing / easing | Note |
|---|---|---|
| Button press | 100ms, ease-out, scale 0.98 | Already correct, no change |
| Screen transition | iOS native push/pop | Defer to Capacitor's native navigation rather than a custom JS transition — matches Apple HIG, doesn't fight the platform's gesture-driven back-swipe |
| Discover card entry | 220ms, ease-out, fade + 10px rise | |
| Feed/task skeleton | 1.4s, ease-in-out, loop | Replace bare spinners on Discover's initial load and task submission with a shimmer skeleton shaped like the real card, so layout doesn't jump when content arrives |
| Reduced motion | — | Every animation above gated behind `prefers-reduced-motion: no-preference`, matching the app's existing convention (see `AppLockGate`/`OnboardingBackground` for precedent) |

## Out of scope (both phases)

Wider rollout of the button/icon/animation system to every remaining screen — primitives get built and reviewed here first; a broader rollout is a separate future pass, not automatic. Backend logic, ranking algorithm, payment flow, match state machine — untouched throughout.

## Testing / verification

Visual-only changes with the loading-state/icon-button additions being the only new interactive logic (a boolean prop, no new data flow). Verified by `tsc --noEmit`, `npm run build`, and direct visual review (screenshots/description) — same rationale as Phase 1: this repo has no visual regression tooling, and changes are small enough that direct review is more reliable than a snapshot test.

## Self-critique

Same honest-scope check as Phase 1: the temptation with a "design system" phase is to invent problems to look thorough. Real audit results here were mixed on purpose — icon library needed *zero* changes, button press-feedback needed *zero* changes, and the two genuinely missing pieces (icon-only variant, loading state) are both traceable to concrete gaps already observed in this codebase, not manufactured. The app icon and match-moment are the two places actual new design work happens, and both were reviewed against real constraints (60px legibility, current match-flow code) rather than judged on a full-size preview alone.
