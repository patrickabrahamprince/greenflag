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
