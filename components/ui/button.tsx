import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium uppercase tracking-wide transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px]',
  {
    variants: {
      variant: {
        primary: 'bg-gold text-white hover:bg-[#86198F]',
        secondary: 'bg-transparent text-ink border border-border hover:border-gold',
        ghost: 'text-ink/50 hover:text-ink hover:bg-[#1C1C1E]',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100',
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
