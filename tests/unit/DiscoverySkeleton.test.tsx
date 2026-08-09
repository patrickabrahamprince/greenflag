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
