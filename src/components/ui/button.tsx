import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-gradient-tech text-white hover:opacity-90 shadow-lg hover:shadow-xl btn-tech',
      secondary: 'border border-border bg-surface text-text-secondary hover:bg-surface-elevated',
      danger: 'border border-error/50 bg-error/20 text-error hover:bg-error/30',
      outline: 'border border-border bg-transparent text-foreground hover:bg-surface-elevated',
      ghost: 'text-text-secondary hover:bg-surface-elevated',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
