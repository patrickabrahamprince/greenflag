import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted transition-all duration-300 ease-out focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-muted text-xs mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
