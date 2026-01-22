import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-error focus:ring-error/50 focus:border-error',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;
