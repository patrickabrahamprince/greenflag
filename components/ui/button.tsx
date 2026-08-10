import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // No uppercase/tracking-wide -- the design system's buttons use plain
  // sentence-case labels.
  'inline-flex items-center justify-center rounded-pill font-medium transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px]',
  {
    variants: {
      variant: {
        // Crimson is dark/saturated, so it needs white text (was Mindaro,
        // a light fill needing dark text -- the opposite contrast need).
        primary: 'bg-gold text-ink hover:bg-[#E8324F]',
        secondary: 'bg-transparent text-ink border border-border hover:border-gold',
        ghost: 'text-ink/50 hover:text-ink hover:bg-well',
        danger: 'bg-[#D2042D]/15 text-[#D2042D] hover:bg-[#D2042D]/25',
      },
      size: {
        sm: 'px-4 py-1.5 text-[11px]',
        default: 'px-8 py-3 text-xs',
        lg: 'px-8 py-4 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
