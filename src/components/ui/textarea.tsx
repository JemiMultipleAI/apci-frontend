import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed resize-none',
          error && 'border-error focus:ring-error/50 focus:border-error',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
