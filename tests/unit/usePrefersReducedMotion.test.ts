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
