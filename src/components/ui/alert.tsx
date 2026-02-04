import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    const variants = {
      error: 'rounded-lg bg-error/20 border border-error/50 p-3 text-sm text-error',
      success: 'rounded-lg bg-green-500/20 border border-green-500/50 p-3 text-sm text-green-400',
      warning: 'rounded-lg bg-yellow-500/20 border border-yellow-500/50 p-3 text-sm text-yellow-400',
      info: 'rounded-lg bg-primary/20 border border-primary/50 p-3 text-sm text-primary',
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
