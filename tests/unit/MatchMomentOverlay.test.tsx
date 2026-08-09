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
