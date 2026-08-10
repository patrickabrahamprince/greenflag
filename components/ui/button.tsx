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
        // Was bg-gold (Mindaro) + text-white, the exact unreadable
        // pairing the design system's contrast rule warns about, plus a
        // hover fill from the old dark-magenta palette.
        primary: 'bg-gold text-ink-dark hover:bg-[#E4FFA3]',
        secondary: 'bg-transparent text-ink border border-border hover:border-gold',
        ghost: 'text-ink/50 hover:text-ink hover:bg-well',
        danger: 'bg-[#FC4363]/15 text-[#FC4363] hover:bg-[#FC4363]/25',
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
