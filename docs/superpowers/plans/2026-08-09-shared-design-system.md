# Shared Design System (Phase 1 + 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement both approved design specs — the Discover match-badge restyle (Phase 1) and the shared button/icon/app-icon/animation system (Phase 2) — as reviewed in the approved mockup artifacts.

**Architecture:** Small, focused shared components (`LoadingButton`, `IconButton`, `MatchMomentOverlay`) and one shared hook (`usePrefersReducedMotion`) added under `components/shared/` and `lib/hooks/`, then wired into the three existing call sites named in the spec (`app/discover/page.tsx`, `components/guest/PackageCard.tsx`, `components/connection/SubmitSheet.tsx`, `components/discovery/DiscoverySkeleton.tsx`). New Tailwind keyframes are added alongside (never modifying) the existing shared `fade-in` animation, since that class is used in 40+ files. The app icon is a hand-authored SVG rasterized directly to each consumed target size with `rsvg-convert` (no intermediate raster resize needed — the vector source renders cleanly at every target resolution).

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Vitest + `@testing-library/react` for component/hook tests, `lucide-react` for icons, `rsvg-convert` for SVG→PNG rasterization (confirmed installed locally).

## Global Constraints

- Brand colors are locked: primary gradient `#E879F9 → #C026D3 → #86198F`, background `#0B0614`/`#0A0A0A`. No new colors introduced.
- No new icon dependency — `lucide-react` only (already the sole icon library in the project).
- Every new decorative/choreographed animation (card entry, skeleton shimmer, match-moment) must be gated behind `usePrefersReducedMotion`. Button press feedback and instant state swaps are NOT gated (they're not the kind of motion `prefers-reduced-motion` targets, and the existing `active:scale-*` press feedback across the app is already ungated).
- Never modify the shared `fade-in` / `fadeIn` Tailwind animation or keyframe — it's used in 40+ files outside this plan's scope. New animations get their own distinct names.
- Deploy pipeline for every task that touches shipped code: `npx tsc --noEmit -p .` → `npm run build` → `git add <explicit paths>` (never `-A`) → commit → (push/deploy only when the user asks for it — this plan stops at committed, build-clean code on the local branch).
- Test runner: `npx vitest run <path>` (project already has `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` installed but JSX transform in Vitest is currently broken — Task 2 fixes this before any component test is written).
- New component/hook tests live in `tests/unit/`, matching this repo's existing convention (`tests/unit/coins.test.ts`, `tests/unit/stores.test.ts`, etc.) — not co-located with the component.

---

### Task 1: Discover badge restyle (Phase 1)

**Files:**
- Modify: `app/discover/page.tsx:5` (import), `app/discover/page.tsx:397-411` (badge JSX)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks (visual-only leaf change).

- [ ] **Step 1: Add the `Flag` icon import**

In `app/discover/page.tsx`, line 5 currently reads:

```tsx
import { Loader2, Coins, X, Heart, Lock, Instagram, Briefcase, Ruler, Bell, ImageOff, ChevronLeft, ChevronRight, Gift } from 'lucide-react'
```

Change to:

```tsx
import { Loader2, Coins, X, Heart, Lock, Instagram, Briefcase, Ruler, Bell, ImageOff, ChevronLeft, ChevronRight, Gift, Flag } from 'lucide-react'
```

- [ ] **Step 2: Replace the wide alignment bar with the tight badge**

Find (lines 397-411):

```tsx
                    {typeof p.match_percentage === 'number' && (
                      <div className="absolute top-12 left-3 z-10 flex flex-col items-start gap-1">
                        <div className="glass-surface flex items-center gap-1.5 rounded-full px-3 py-1.5">
                          <span className="text-gold text-xs">◆</span>
                          <span className="font-display font-bold text-white text-sm whitespace-nowrap">
                            {p.match_percentage}% Greenflag Alignment
                          </span>
                        </div>
                        {persona === 'woman' && !!interestCounts[p.id] && (
                          <span className="glass-surface rounded-full px-3 py-1 text-white/80 text-[11px] whitespace-nowrap">
                            Intention from {interestCounts[p.id]} {interestCounts[p.id] === 1 ? 'person' : 'people'}
                          </span>
                        )}
                      </div>
                    )}
```

Replace with:

```tsx
                    {typeof p.match_percentage === 'number' && (
                      <div className="absolute top-12 left-3 z-10 flex flex-col items-start gap-1">
                        <div className="glass-surface flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1">
                          <Flag className="w-3 h-3 text-gold" fill="currentColor" />
                          <span className="font-display font-bold text-white text-xs whitespace-nowrap">
                            {p.match_percentage}%
                          </span>
                        </div>
                        {persona === 'woman' && !!interestCounts[p.id] && (
                          <span className="glass-surface rounded-full px-3 py-1 text-white/80 text-[11px] whitespace-nowrap">
                            Intention from {interestCounts[p.id]} {interestCounts[p.id] === 1 ? 'person' : 'people'}
                          </span>
                        )}
                      </div>
                    )}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit -p .
npm run build
```

Expected: both succeed with no errors. Then visually confirm in a dev server (`npm run dev` → `/discover`) that the badge now reads as a small pill with a flag glyph and just the percentage.

- [ ] **Step 4: Commit**

```bash
git add app/discover/page.tsx
git commit -m "feat: restyle Discover match badge to a compact flag pill"
```

---

### Task 2: Fix Vitest JSX transform + add `usePrefersReducedMotion`

**Context:** `tsconfig.json` sets `"jsx": "preserve"` (required for Next.js's own compiler). Vitest's default esbuild-based transform refuses to strip JSX when it sees that tsconfig setting and no plugin is registered to handle it — confirmed by writing a throwaway `.tsx` test file and running it: it fails with `Failed to parse source for import analysis because the content contains invalid JS syntax`. No component or hook test can be written until this is fixed. The standard fix is `@vitejs/plugin-react`, which transforms JSX via Babel independent of the tsconfig `jsx` setting.

**Files:**
- Modify: `package.json` (new devDependency), `vitest.config.ts`
- Create: `lib/hooks/usePrefersReducedMotion.ts`
- Test: `tests/unit/usePrefersReducedMotion.test.ts`

**Interfaces:**
- Produces: `usePrefersReducedMotion(): boolean` — consumed by Task 7 (card entry), Task 8 (skeleton), Task 10 (match moment).

- [ ] **Step 1: Install the plugin**

```bash
npm install -D @vitejs/plugin-react
```

- [ ] **Step 2: Wire it into Vitest**

`vitest.config.ts` currently reads:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/e2e/**', '**/node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

Change to:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/e2e/**', '**/node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Write the failing test for the hook**

Create `tests/unit/usePrefersReducedMotion.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

function mockMatchMedia(initialMatches: boolean) {
  let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;
  const mql = {
    matches: initialMatches,
    addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
      changeHandler = handler;
    },
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    fireChange: (matches: boolean) => {
      mql.matches = matches;
      changeHandler?.({ matches } as MediaQueryListEvent);
    },
  };
}

describe('usePrefersReducedMotion', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects the current matchMedia value on mount', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the OS setting changes', () => {
    const { fireChange } = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => {
      fireChange(true);
    });
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tests/unit/usePrefersReducedMotion.test.ts`
Expected: FAIL with "Failed to resolve import" or "no such file" (the hook doesn't exist yet).

- [ ] **Step 5: Implement the hook**

Create `lib/hooks/usePrefersReducedMotion.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// No matchMedia call during render (SSR-safe, avoids a hydration
// mismatch) -- state starts false and syncs to the real value in an
// effect, then stays live if the user flips the OS setting mid-session.
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/unit/usePrefersReducedMotion.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/hooks/usePrefersReducedMotion.ts tests/unit/usePrefersReducedMotion.test.ts
git commit -m "feat: fix Vitest JSX transform and add usePrefersReducedMotion hook"
```

---

### Task 3: `LoadingButton` component

**Files:**
- Create: `components/shared/LoadingButton.tsx`
- Test: `tests/unit/LoadingButton.test.tsx`

**Interfaces:**
- Consumes: nothing new (uses existing `.btn-primary`/`.btn-secondary` classes from `app/globals.css`).
- Produces: `LoadingButton({ loading: boolean; loadingLabel: string; icon?: ReactNode; variant?: 'primary' | 'secondary'; disabled?: boolean; onClick?: () => void; className?: string; children: ReactNode; type?: 'button' | 'submit' })` — consumed by Task 4.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/LoadingButton.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingButton } from '@/components/shared/LoadingButton';

describe('LoadingButton', () => {
  it('shows the idle label and calls onClick when not loading', () => {
    const onClick = vi.fn();
    render(
      <LoadingButton loading={false} loadingLabel="Processing" onClick={onClick}>
        Buy
      </LoadingButton>
    );
    const button = screen.getByRole('button', { name: /buy/i });
    expect(button).not.toBeDisabled();
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disables the button and shows the loading label while loading', () => {
    render(
      <LoadingButton loading={true} loadingLabel="Processing" onClick={() => {}}>
        Buy
      </LoadingButton>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/LoadingButton.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `components/shared/LoadingButton.tsx`:

```tsx
'use client';

import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface LoadingButtonProps {
  loading: boolean;
  loadingLabel: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  type?: 'button' | 'submit';
}

// Stacks the idle and loading content in the same grid cell (both
// col-start-1 row-start-1, grid sizing to whichever is larger) so the
// button's footprint is fixed as soon as both states exist in the DOM --
// toggling `loading` crossfades in place instead of reflowing the
// button (and whatever sits next to it) the way a plain text-swap
// ternary does.
export function LoadingButton({
  loading,
  loadingLabel,
  icon,
  variant = 'primary',
  disabled,
  onClick,
  className = '',
  children,
  type = 'button',
}: LoadingButtonProps) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} grid ${className}`}
    >
      <span
        className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-opacity duration-150 ${loading ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden={loading}
      >
        {icon}
        {children}
      </span>
      <span
        className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-opacity duration-150 ${loading ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden={!loading}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {loadingLabel}
      </span>
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/LoadingButton.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/shared/LoadingButton.tsx tests/unit/LoadingButton.test.tsx
git commit -m "feat: add shared LoadingButton component"
```

---

### Task 4: Wire `LoadingButton` into `PackageCard` and `SubmitSheet`, extend disabled state

**Files:**
- Modify: `app/globals.css:158-198` (`.btn-secondary`, `.btn-ghost`)
- Modify: `components/guest/PackageCard.tsx` (full file)
- Modify: `components/connection/SubmitSheet.tsx:616-623`

**Interfaces:**
- Consumes: `LoadingButton` from Task 3.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Extend disabled styling to `.btn-secondary` and `.btn-ghost`**

In `app/globals.css`, `.btn-secondary` currently reads:

```css
  .btn-secondary {
    @apply glass-surface relative text-ink font-display font-bold rounded-full px-8 py-3
           text-xs uppercase tracking-wide
           transition-all duration-300 ease-out
           hover:border-gold active:scale-[0.98];
  }
```

Change to:

```css
  .btn-secondary {
    @apply glass-surface relative text-ink font-display font-bold rounded-full px-8 py-3
           text-xs uppercase tracking-wide
           transition-all duration-300 ease-out
           hover:border-gold active:scale-[0.98]
           disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100;
  }
```

`.btn-ghost` currently reads:

```css
  .btn-ghost {
    @apply text-ink/50 font-medium rounded-xl px-4 py-2
           text-xs uppercase tracking-wide
           transition-all duration-300 ease-out
           hover:text-ink active:scale-[0.98];
  }
```

Change to:

```css
  .btn-ghost {
    @apply text-ink/50 font-medium rounded-xl px-4 py-2
           text-xs uppercase tracking-wide
           transition-all duration-300 ease-out
           hover:text-ink active:scale-[0.98]
           disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100;
  }
```

- [ ] **Step 2: Replace `PackageCard`'s hand-rolled ternary**

Replace the full contents of `components/guest/PackageCard.tsx` with:

```tsx
import { Crown, Zap, ShoppingCart } from 'lucide-react';
import { LoadingButton } from '@/components/shared/LoadingButton';

interface Package {
  coins: number;
  price: number;
  popular?: boolean;
  best?: boolean;
  test?: boolean;
}

interface PackageCardProps {
  pkg: Package;
  // Real StoreKit price string (e.g. "₹399.00") once App Store Connect
  // pricing has loaded -- falls back to the guessed INR figure in
  // PACKAGES while that's still in flight.
  displayPrice?: string;
  purchasing: boolean;
  isPurchasingThis: boolean;
  onBuy: () => void;
}

export function PackageCard({ pkg, displayPrice, purchasing, isPurchasingThis, onBuy }: PackageCardProps) {
  return (
    <div className="card relative overflow-hidden">
      {pkg.popular && (
        <span className="absolute top-2 right-2 text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
          Most Popular
        </span>
      )}
      {pkg.best && (
        <span className="absolute top-2 right-2 text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
          Best Value
        </span>
      )}
      {pkg.test && (
        <span className="absolute top-2 right-2 text-[10px] font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
          Test
        </span>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {pkg.coins >= 150 ? (
            <Crown className="w-6 h-6 text-gold" />
          ) : (
            <Zap className="w-6 h-6 text-gold" />
          )}
          <div>
            <p className="text-ink font-medium">{pkg.coins} Coins</p>
            <p className="text-xs text-muted">{displayPrice || `₹${pkg.price}`}</p>
          </div>
        </div>
        <LoadingButton
          loading={isPurchasingThis}
          loadingLabel="Processing"
          icon={<ShoppingCart className="w-3.5 h-3.5" />}
          onClick={onBuy}
          disabled={purchasing}
          className="text-sm py-2 px-4"
        >
          Buy
        </LoadingButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Replace `SubmitSheet`'s hand-rolled ternary**

Add the import near the top of `components/connection/SubmitSheet.tsx` (after the existing `lucide-react` import on line 5):

```tsx
import { LoadingButton } from '@/components/shared/LoadingButton';
```

Find (lines 616-623):

```tsx
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
```

Replace with:

```tsx
        <LoadingButton
          loading={submitting}
          loadingLabel="Submitting"
          icon={<Upload className="w-4 h-4" />}
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full mt-5"
        >
          Submit
        </LoadingButton>
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit -p .
npm run build
npx vitest run
```

Expected: all three succeed (build compiles, all existing + new tests pass). Then in `npm run dev`, visually confirm the Coins page's "Buy" buttons and a task's "Submit" button still work and show a spinner without changing width when clicked.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/guest/PackageCard.tsx components/connection/SubmitSheet.tsx
git commit -m "refactor: standardize button loading states on LoadingButton"
```

---

### Task 5: `IconButton` component

**Files:**
- Create: `components/shared/IconButton.tsx`
- Test: `tests/unit/IconButton.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `IconButton({ icon: ReactNode; label: string } & ButtonHTMLAttributes<HTMLButtonElement>)` — consumed by Task 6.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/IconButton.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconButton } from '@/components/shared/IconButton';

describe('IconButton', () => {
  it('renders with an accessible label and forwards click', () => {
    const onClick = vi.fn();
    render(<IconButton icon={<span data-testid="icon" />} label="Pass" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Pass' });
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is set', () => {
    render(<IconButton icon={<span />} label="Pass" disabled />);
    expect(screen.getByRole('button', { name: 'Pass' })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/IconButton.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `components/shared/IconButton.tsx`:

```tsx
'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
}

// 46x46px circular glass-surface button for card-level icon actions
// (pass, gift, etc). active:scale-[0.92] is more pronounced than the
// pill buttons' 0.98 -- a 46px target needs more visible press feedback
// than a full-width pill does. Formalizes the ad-hoc
// `glass-surface size-11 rounded-full` pattern already used inline on
// Discover into one reusable component.
export function IconButton({ icon, label, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`glass-surface w-[46px] h-[46px] rounded-full flex items-center justify-center active:scale-[0.92] transition-all duration-200 disabled:opacity-50 ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/IconButton.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/shared/IconButton.tsx tests/unit/IconButton.test.tsx
git commit -m "feat: add shared IconButton component"
```

---

### Task 6: Wire `IconButton` into Discover's Pass / Send Gift buttons

**Files:**
- Modify: `app/discover/page.tsx` (import line 5, and lines 573-586)

**Interfaces:**
- Consumes: `IconButton` from Task 5.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the import**

In `app/discover/page.tsx`, add alongside the other `@/components` imports (near line 8-9, after the `InsufficientCoinsDialog` import):

```tsx
import { IconButton } from '@/components/shared/IconButton'
```

- [ ] **Step 2: Replace the two ad-hoc icon buttons**

Find (lines 573-586):

```tsx
                    <button
                      onClick={() => { hapticTap(); scrollToNext(i) }}
                      aria-label="Pass"
                      className="glass-surface size-11 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
                    >
                      <X className="w-5 h-5 text-ink/60" />
                    </button>
                    <button
                      onClick={() => { hapticTap(); openGiftPicker(p.id) }}
                      aria-label="Send Gift"
                      className="glass-surface size-11 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
                    >
                      <Gift className="w-5 h-5 text-ink/60" />
                    </button>
```

Replace with:

```tsx
                    <IconButton
                      icon={<X className="w-5 h-5 text-ink/60" />}
                      label="Pass"
                      onClick={() => { hapticTap(); scrollToNext(i) }}
                      className="shrink-0"
                    />
                    <IconButton
                      icon={<Gift className="w-5 h-5 text-ink/60" />}
                      label="Send Gift"
                      onClick={() => { hapticTap(); openGiftPicker(p.id) }}
                      className="shrink-0"
                    />
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit -p .
npm run build
```

Expected: both succeed. Visually confirm on `/discover` (male-facing card variant) that Pass and Send Gift still work and show the same press feedback.

- [ ] **Step 4: Commit**

```bash
git add app/discover/page.tsx
git commit -m "refactor: use shared IconButton for Discover Pass/Send Gift actions"
```

---

### Task 7: Discover card entry animation (fade + rise)

**Files:**
- Modify: `tailwind.config.js` (add `card-enter` animation/keyframe)
- Modify: `app/discover/page.tsx` (import + line 308 className)

**Interfaces:**
- Consumes: `usePrefersReducedMotion` from Task 2.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add a dedicated `card-enter` animation**

In `tailwind.config.js`, the `animation` block currently ends with:

```js
        'logo-pulse': 'logoPulse 1.4s ease-in-out infinite',
      },
```

Change to:

```js
        'logo-pulse': 'logoPulse 1.4s ease-in-out infinite',
        'card-enter': 'cardEnter 220ms ease-out',
      },
```

The `keyframes` block currently ends with:

```js
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
```

Change to:

```js
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
```

(This is intentionally a new, separate animation from `fade-in` — `fade-in` is used in 40+ other files and must not change.)

- [ ] **Step 2: Apply it to the Discover card, gated by reduced motion**

In `app/discover/page.tsx`, add the hook import alongside the other `@/lib` imports (near line 15, after `useFirstTimeHint`):

```tsx
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion'
```

Inside the `DiscoverPage` component body, add near the other top-level hook calls (after the `useNudge`/`useGifting`/`usePhotoUnlock` calls, before the `return`):

```tsx
  const prefersReducedMotion = usePrefersReducedMotion()
```

Find (line 308):

```tsx
            className="snap-start snap-always h-dvh w-full relative overflow-hidden animate-fade-in"
```

Replace with:

```tsx
            className={`snap-start snap-always h-dvh w-full relative overflow-hidden ${prefersReducedMotion ? '' : 'animate-card-enter'}`}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit -p .
npm run build
```

Expected: both succeed. Visually confirm on `/discover` that cards fade + rise in as you scroll to them (and, with macOS's "Reduce motion" accessibility setting on, that they appear instantly with no animation).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js app/discover/page.tsx
git commit -m "feat: add fade+rise entry animation to Discover cards"
```

---

### Task 8: Shimmer skeleton for `DiscoverySkeleton`

**Files:**
- Modify: `tailwind.config.js:44` (retime the unused `shimmer` animation to 1.4s ease-in-out)
- Modify: `components/discovery/DiscoverySkeleton.tsx` (full file)
- Test: `tests/unit/DiscoverySkeleton.test.tsx`

**Interfaces:**
- Consumes: `usePrefersReducedMotion` from Task 2.
- Produces: nothing consumed by later tasks. `DiscoverySkeleton`'s exported signature (`DiscoverySkeleton(): JSX.Element`, no props) is unchanged, so its one call site in `app/discover/page.tsx:284` needs no edit.

- [ ] **Step 1: Retime the `shimmer` animation**

Confirmed via `grep -rn "animate-shimmer" components app` that this animation is defined but currently unused anywhere in the app, so retiming it is safe. In `tailwind.config.js`, find:

```js
        'shimmer': 'shimmer 2s infinite linear',
```

Replace with:

```js
        'shimmer': 'shimmer 1.4s ease-in-out infinite',
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/DiscoverySkeleton.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false,
}));

import { DiscoverySkeleton } from '@/components/discovery/DiscoverySkeleton';

describe('DiscoverySkeleton', () => {
  it('renders a full-height card-shaped skeleton', () => {
    const { container } = render(<DiscoverySkeleton />);
    expect(container.querySelector('.screen-gradient')).toBeInTheDocument();
    // Photo block, badge chip, and the two bottom action placeholders.
    expect(container.querySelectorAll('[class*="animate-"]').length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/DiscoverySkeleton.test.tsx`
Expected: FAIL (current `DiscoverySkeleton` renders `<LoadingLogo />`, no `.screen-gradient` element, no `animate-*` blocks matching the count).

- [ ] **Step 4: Implement the shimmer skeleton**

Replace the full contents of `components/discovery/DiscoverySkeleton.tsx` with:

```tsx
'use client';

import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// Shimmer needs an explicit oversized background-size for the
// background-position sweep to have room to travel -- 200% width means
// the gradient slides fully off-screen and back, producing the sweep
// instead of a static two-tone split.
function ShimmerBlock({ className }: { className: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shimmerClass = prefersReducedMotion
    ? 'animate-pulse bg-surface-light'
    : 'bg-[length:200%_100%] bg-gradient-to-r from-surface-light via-white/10 to-surface-light animate-shimmer';
  return <div className={`${shimmerClass} ${className}`} />;
}

// Mirrors the real Discover card's layout (full-bleed photo, top-left
// badge chip, bottom info bar + action row) so the initial-load state
// doesn't jump when real content replaces it -- previously this was a
// bare centered spinner with no relation to the content about to
// appear.
export function DiscoverySkeleton() {
  return (
    <div className="relative screen-gradient min-h-dvh max-w-app mx-auto overflow-hidden">
      <div className="h-dvh w-full relative">
        <ShimmerBlock className="absolute inset-0" />
        <ShimmerBlock className="absolute top-12 left-3 w-16 h-7 rounded-full" />
        <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3">
          <ShimmerBlock className="h-6 w-2/3 rounded-lg" />
          <ShimmerBlock className="h-4 w-1/3 rounded-lg" />
          <div className="flex gap-3 mt-2">
            <ShimmerBlock className="h-11 flex-1 rounded-full" />
            <ShimmerBlock className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/DiscoverySkeleton.test.tsx`
Expected: PASS.

- [ ] **Step 6: Verify build**

```bash
npx tsc --noEmit -p .
npm run build
```

Expected: both succeed. Visually confirm on a throttled connection (or by adding a temporary artificial delay) that Discover's first load shows the card-shaped shimmer instead of a spinner.

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.js components/discovery/DiscoverySkeleton.tsx tests/unit/DiscoverySkeleton.test.tsx
git commit -m "feat: replace Discover's loading spinner with a card-shaped shimmer skeleton"
```

---

### Task 9: App icon — SVG source + asset generation

**Context:** Concept A ("flowing flag") from the spec, iterated three times and verified by rendering both a 1024px and a true 60px PNG and visually inspecting each — the first two attempts read as a heart/leaf due to a double-curve pennant silhouette; the third (below) simplified to exactly two quadratic Bezier curves and reads as an unambiguous flag at both sizes. There are exactly two real consumers of this asset in the repo: `app/icon.png` (Next.js's auto-detected site icon, currently 662×662) and `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (the single 1024×1024 "universal" image Xcode's modern single-size icon format uses — confirmed via that folder's `Contents.json`). There is no `manifest.json` in this project and no other icon file referenced anywhere, so no separate 192×192/512×512 PWA files are generated — creating them would produce orphaned, unreferenced assets.

**Files:**
- Create: `design/app-icon-source.svg`
- Modify (regenerate, binary): `app/icon.png`, `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks (both consumers are already-existing, unrelated asset pipelines — Next.js's icon auto-detection and Xcode's asset catalog).

- [ ] **Step 1: Write the SVG source**

Create `design/app-icon-source.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E879F9"/>
      <stop offset="45%" stop-color="#C026D3"/>
      <stop offset="100%" stop-color="#86198F"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <!-- pole -->
  <rect x="432" y="200" width="40" height="624" rx="8" fill="#ffffff"/>
  <!-- flowing pennant: one convex top curve, one concave bottom curve, single clean taper to a point -->
  <path d="M 472 220
           Q 680 232, 820 340
           Q 680 448, 472 460
           Z"
        fill="#ffffff"/>
</svg>
```

- [ ] **Step 2: Rasterize directly to each consumer's exact size**

```bash
rsvg-convert -w 1024 -h 1024 design/app-icon-source.svg -o ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
rsvg-convert -w 512 -h 512 design/app-icon-source.svg -o app/icon.png
```

- [ ] **Step 3: Verify dimensions and format**

```bash
file app/icon.png ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
```

Expected output: `app/icon.png: PNG image data, 512 x 512, ...` and `AppIcon-512@2x.png: PNG image data, 1024 x 1024, ...`. Neither should report an alpha channel that leaves transparency at the edges (the SVG's background `rect` fills the full canvas, so both should render fully opaque) — App Store Connect rejects app icons with transparency.

- [ ] **Step 4: Visual confirmation**

Read both PNG files (or open in Preview) at their real rendered size and at a scaled-down ~60px equivalent, and confirm the pennant reads as an unambiguous flag, not a heart/leaf, at both sizes.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: succeeds (Next.js re-picks-up `app/icon.png` automatically; no code references need updating).

- [ ] **Step 6: Commit**

```bash
git add design/app-icon-source.svg app/icon.png "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
git commit -m "feat: replace app icon with flowing-flag mark (Concept A)"
```

---

### Task 10: `MatchMomentOverlay` — the match celebration

**Files:**
- Modify: `tailwind.config.js` (4 new keyframes/animations)
- Create: `components/shared/MatchMomentOverlay.tsx`
- Test: `tests/unit/MatchMomentOverlay.test.tsx`
- Modify: `app/discover/page.tsx` (imports, new state, `handleBegin`, JSX)

**Interfaces:**
- Consumes: `usePrefersReducedMotion` from Task 2; `useUserStore` from `lib/store.ts` (existing, `{ user: Profile | null }`); `Profile.photos: string[] | null` from `types/index.ts` (existing).
- Produces: `MatchMomentOverlay({ open: boolean; myPhoto: string | null; theirPhoto: string | null; onContinue: () => void })` — consumed only within `app/discover/page.tsx` in this task.

- [ ] **Step 1: Add the choreography keyframes**

In `tailwind.config.js`, extend the `animation` block (added in Task 7) with:

```js
        'card-enter': 'cardEnter 220ms ease-out',
        'match-card-left': 'matchCardInLeft 620ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'match-card-right': 'matchCardInRight 620ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms both',
        'match-glow': 'matchGlowPop 620ms cubic-bezier(0.34, 1.56, 0.64, 1) 280ms both',
        'match-text': 'matchTextUp 300ms ease-out 480ms both',
      },
```

And extend the `keyframes` block (added in Task 7) with:

```js
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        matchCardInLeft: {
          '0%': { opacity: '0', transform: 'translate(-40px, 20px) rotate(-16deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translate(-18px, 0) rotate(-6deg) scale(1)' },
        },
        matchCardInRight: {
          '0%': { opacity: '0', transform: 'translate(40px, 20px) rotate(16deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translate(18px, 0) rotate(6deg) scale(1)' },
        },
        matchGlowPop: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { opacity: '1', transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        matchTextUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
```

(`both` fill-mode keeps each element at its 0% state during its own `animation-delay`, so nothing flashes at full opacity before its turn.)

- [ ] **Step 2: Write the failing test**

Create `tests/unit/MatchMomentOverlay.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false,
}));

import { MatchMomentOverlay } from '@/components/shared/MatchMomentOverlay';

describe('MatchMomentOverlay', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <MatchMomentOverlay open={false} myPhoto={null} theirPhoto={null} onContinue={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the celebration content and calls onContinue on tap', () => {
    const onContinue = vi.fn();
    render(
      <MatchMomentOverlay open={true} myPhoto={null} theirPhoto={null} onContinue={onContinue} />
    );
    expect(screen.getByText("You've Met Her Standard")).toBeInTheDocument();
    screen.getByText('Tap to continue').click();
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('auto-dismisses after the sequence completes', () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();
    render(
      <MatchMomentOverlay open={true} myPhoto={null} theirPhoto={null} onContinue={onContinue} />
    );
    vi.advanceTimersByTime(1800);
    expect(onContinue).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/MatchMomentOverlay.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the component**

Create `components/shared/MatchMomentOverlay.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { Flag } from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

interface MatchMomentOverlayProps {
  open: boolean;
  myPhoto: string | null;
  theirPhoto: string | null;
  onContinue: () => void;
}

const AUTO_DISMISS_MS = 1800;

// The one place in the app with a dedicated celebration sequence: two
// photo cards settle at opposing angles, the flag mark (same glyph as
// the app icon and the Discover badge -- the signature element now
// appears in three places) pops with a glow where they overlap, then
// the title fades up last. Reduced motion drops straight to the settled
// end-state with a plain fade instead of the choreographed entrance.
// Auto-dismisses like CelebrationInterstitial (components/shared/
// CelebrationInterstitial.tsx) but is also tap-to-continue at any time.
export function MatchMomentOverlay({ open, myPhoto, theirPhoto, onContinue }: MatchMomentOverlayProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onContinue, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [open, onContinue]);

  if (!open) return null;

  const leftCardAnim = prefersReducedMotion ? 'animate-fade-in -rotate-6' : 'animate-match-card-left';
  const rightCardAnim = prefersReducedMotion ? 'animate-fade-in rotate-6' : 'animate-match-card-right';
  const glowAnim = prefersReducedMotion ? 'animate-fade-in' : 'animate-match-glow';
  const textAnim = prefersReducedMotion ? 'animate-fade-in' : 'animate-match-text';

  return (
    <div
      onClick={onContinue}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 cursor-pointer"
      style={{
        background: 'radial-gradient(ellipse 120% 80% at 20% 20%, rgba(192, 38, 211, 0.55) 0%, transparent 55%), radial-gradient(ellipse 100% 90% at 90% 85%, rgba(124, 58, 237, 0.5) 0%, transparent 60%), #0B0614',
      }}
    >
      <div className="relative w-full max-w-[280px] h-[200px] mb-10">
        <div className={`absolute left-0 top-0 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl ${leftCardAnim}`}>
          {myPhoto ? (
            <img src={myPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-light" />
          )}
        </div>
        <div className={`absolute right-0 top-0 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl ${rightCardAnim}`}>
          {theirPhoto ? (
            <img src={theirPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-light" />
          )}
        </div>
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center ${glowAnim}`}
          style={{ background: 'linear-gradient(135deg, #E879F9 0%, #C026D3 45%, #86198F 100%)', boxShadow: '0 0 40px 10px rgba(192, 38, 211, 0.6)' }}
        >
          <Flag className="w-7 h-7 text-white" fill="white" />
        </div>
      </div>
      <div className={`text-center ${textAnim}`}>
        <h1 className="font-display text-3xl font-bold text-ink leading-tight mb-2">You&apos;ve Met Her Standard</h1>
        <p className="text-ink/70 text-sm">Your connection is on its way</p>
      </div>
      <p className="text-ink/40 text-xs mt-10 uppercase tracking-wide">Tap to continue</p>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/MatchMomentOverlay.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Wire it into `handleBegin`**

In `app/discover/page.tsx`, add imports alongside the existing ones:

```tsx
import { MatchMomentOverlay } from '@/components/shared/MatchMomentOverlay'
import { useUserStore } from '@/lib/store'
```

Add a state declaration and a store read near the other `useState` calls at the top of `DiscoverPage` (after `insufficientCoinsMessage`):

```tsx
  const [matchMoment, setMatchMoment] = useState<{ theirPhoto: string | null; nextPath: string | null } | null>(null)
  const currentUser = useUserStore((s) => s.user)
```

Find the current `handleBegin` (lines 230-270):

```tsx
  async function handleBegin(profileId: string) {
    if (likingId) return
    setLikingId(profileId)
    try {
      if (persona === 'woman') {
        hapticTap()
        router.push(`/profile/${profileId}`)
        return
      }
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: profileId })
      })
      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'insufficient_funds') {
          setInsufficientCoinsMessage('You need more coins to meet her Standard. Top up to keep going.')
          return
        }
        throw new Error(err.error || 'Failed to like profile')
      }
      const { matchId } = await res.json()
      deductCoins(MEET_STANDARD_COST)
      setProfiles(prev => {
        const next = prev.filter(p => p.id !== profileId)
        setCached(PROFILES_CACHE_KEY, next)
        return next
      })
      hapticSuccess()
      if (matchId) {
        router.push(`/task/${matchId}`)
      } else {
        toast.success("You've met her Standard")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLikingId(null)
    }
  }
```

Replace with:

```tsx
  async function handleBegin(profileId: string) {
    if (likingId) return
    setLikingId(profileId)
    try {
      if (persona === 'woman') {
        hapticTap()
        router.push(`/profile/${profileId}`)
        return
      }
      const theirPhoto = profiles.find(p => p.id === profileId)?.photos?.[0] ?? null
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: profileId })
      })
      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'insufficient_funds') {
          setInsufficientCoinsMessage('You need more coins to meet her Standard. Top up to keep going.')
          return
        }
        throw new Error(err.error || 'Failed to like profile')
      }
      const { matchId } = await res.json()
      deductCoins(MEET_STANDARD_COST)
      setProfiles(prev => {
        const next = prev.filter(p => p.id !== profileId)
        setCached(PROFILES_CACHE_KEY, next)
        return next
      })
      hapticSuccess()
      setMatchMoment({ theirPhoto, nextPath: matchId ? `/task/${matchId}` : null })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLikingId(null)
    }
  }

  function handleMatchMomentContinue() {
    const nextPath = matchMoment?.nextPath ?? null
    setMatchMoment(null)
    if (nextPath) {
      router.push(nextPath)
    }
  }
```

Finally, render the overlay. Add it near the other modal-style renders at the bottom of the component's JSX (alongside wherever `InsufficientCoinsDialog` is currently rendered):

```tsx
      <MatchMomentOverlay
        open={!!matchMoment}
        myPhoto={currentUser?.photos?.[0] ?? null}
        theirPhoto={matchMoment?.theirPhoto ?? null}
        onContinue={handleMatchMomentContinue}
      />
```

- [ ] **Step 7: Verify**

```bash
npx tsc --noEmit -p .
npm run build
npx vitest run
```

Expected: all three succeed. Manually walk through Meet Her Standard on `/discover` (male-facing flow) and confirm the celebration overlay appears in place of the old toast/immediate redirect, and that tapping it (or waiting) navigates to `/task/[matchId]` exactly like before when a match occurs, or simply dismisses when it doesn't.

- [ ] **Step 8: Commit**

```bash
git add tailwind.config.js components/shared/MatchMomentOverlay.tsx tests/unit/MatchMomentOverlay.test.tsx app/discover/page.tsx
git commit -m "feat: add match-moment celebration overlay to Meet Her Standard flow"
```

---

## Self-Review

**Spec coverage:**
- Phase 1 badge restyle → Task 1. ✅
- Buttons: loading state → Tasks 3-4; icon-only variant → Tasks 5-6; disabled state parity → Task 4 Step 1. ✅
- Icon library → confirmed already consolidated in the original spec, no task needed (verified again via the same grep during planning). ✅
- App icon → Task 9. ✅
- Match-moment animation → Task 10. ✅
- Card entry (fade + rise) → Task 7. ✅
- Feed skeleton (shimmer, 1.4s) → Task 8. ✅
- Reduced motion → `usePrefersReducedMotion` (Task 2) is consumed by every decorative-animation task (7, 8, 10). Note: the original spec cited `AppLockGate`/`OnboardingBackground` as existing reduced-motion precedent — on inspection neither file actually implements a `prefers-reduced-motion` gate (confirmed via grep across `components`, `lib`, `app`), so Task 2 builds this as new shared infrastructure rather than reusing a nonexistent pattern.
- Screen transitions (native push/pop) → explicitly deferred to Capacitor per the spec; no task, by design.
- Out-of-scope items (wider rollout of `LoadingButton`/`IconButton` beyond the named call sites, ranking/payment/backend logic) → untouched, matching the spec's own scope boundary.

**Placeholder scan:** No "TBD"/"similar to Task N"/vague-handling placeholders — every step has complete, copy-pasteable code or an exact shell command with expected output.

**Type consistency:** `usePrefersReducedMotion(): boolean` (Task 2) is called identically (no args) in Tasks 7, 8, 10. `LoadingButton`'s prop names (`loading`, `loadingLabel`, `icon`, `onClick`, `disabled`, `className`) are used identically in both Task 4 call sites. `IconButton`'s prop names (`icon`, `label`, `onClick`, `className`) match between its Task 5 definition and Task 6 usage. `MatchMomentOverlay`'s props (`open`, `myPhoto`, `theirPhoto`, `onContinue`) match between Task 10's definition and its `app/discover/page.tsx` usage, and `matchMoment.nextPath: string | null` is set and read consistently within `handleBegin`/`handleMatchMomentContinue`.

**Scope correction from the spec:** the Phase 2 spec listed PWA icon sizes (192×192, 512×512) as a deliverable; Task 9 does not generate them because this project has no `manifest.json` or any other reference to such files — they would be dead assets. Flagged explicitly in Task 9 rather than silently dropped.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-09-shared-design-system.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
