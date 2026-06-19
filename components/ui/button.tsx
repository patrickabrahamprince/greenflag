import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
  {
    variants: {
      variant: {
        primary: 'bg-gold text-black hover:bg-gold-light',
        secondary: 'bg-surface text-white border border-border hover:bg-surface-light',
        ghost: 'text-muted hover:text-white hover:bg-surface',
        danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        default: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg',
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
