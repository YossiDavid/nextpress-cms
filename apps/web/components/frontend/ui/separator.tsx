import * as React from 'react';
import { cn } from '@/lib/utils';

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <hr
      ref={ref}
      className={cn(
        'shrink-0 border-border',
        orientation === 'horizontal' ? 'border-t w-full' : 'border-l h-full',
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = 'Separator';
