import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';

const APP_DIR = path.join(__dirname, '../../app');

function findLayoutFiles(dir: string, base = dir): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findLayoutFiles(full, base));
    } else if (entry.name === 'layout.tsx') {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

// BottomNav used to be duplicated across 5 separate per-route layout.tsx
// files (discover, my-connections, messages, notifications, plus the
// shared (guest) group), so every tab switch fully unmounted and
// remounted it -- including tearing down and recreating its unread-count
// Supabase subscription on every navigation. Consolidated into the one
// (guest) layout; this guards against that regressing silently.
describe('BottomNav layout consolidation', () => {
  it('is rendered by exactly one layout.tsx in the whole app directory', () => {
    const layoutFiles = findLayoutFiles(APP_DIR);
    const layoutsRenderingBottomNav = layoutFiles.filter((f) =>
      readFileSync(path.join(APP_DIR, f), 'utf-8').includes('<BottomNav')
    );

    expect(layoutsRenderingBottomNav).toEqual(['(guest)/layout.tsx']);
  });

  it('does not have stray per-route layout.tsx files for the BottomNav routes', () => {
    // These directories no longer exist as their own route segments --
    // all seven moved under (guest)/ specifically so they share its one
    // layout instead of each mounting/unmounting BottomNav separately.
    for (const stray of [
      'discover/layout.tsx',
      'my-connections/layout.tsx',
      'messages/layout.tsx',
      'notifications/layout.tsx',
      'standard/builder/layout.tsx',
      'task/[matchId]/layout.tsx',
    ]) {
      expect(existsSync(path.join(APP_DIR, stray))).toBe(false);
    }
  });

  it('the BottomNav route pages exist under the shared (guest) group', () => {
    for (const page of [
      '(guest)/discover/page.tsx',
      '(guest)/my-connections/page.tsx',
      '(guest)/messages/page.tsx',
      '(guest)/messages/[connectionId]/page.tsx',
      '(guest)/notifications/page.tsx',
      '(guest)/standard/builder/page.tsx',
      '(guest)/task/[matchId]/page.tsx',
    ]) {
      expect(existsSync(path.join(APP_DIR, page))).toBe(true);
    }
  });
});
