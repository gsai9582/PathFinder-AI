import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      default: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold shadow-sm active:translate-y-px',
      secondary: 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 shadow-sm active:translate-y-px',
      outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/80 active:translate-y-px',
      ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-100',
      destructive: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30',
      link: 'text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline p-0 h-auto'
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-9 px-4 text-xs rounded-xl gap-2',
      lg: 'h-11 px-5 text-sm rounded-xl gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-xl justify-center'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
