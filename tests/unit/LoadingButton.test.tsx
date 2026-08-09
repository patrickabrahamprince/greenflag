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
