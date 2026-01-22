import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'rounded-xl border border-border bg-card p-6 shadow-sm',
      elevated: 'rounded-xl border border-border bg-surface-elevated p-6 shadow-sm',
      glass: 'rounded-xl border border-border bg-card backdrop-blur-md glass p-6 shadow-sm',
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

Card.displayName = 'Card';

export default Card;
