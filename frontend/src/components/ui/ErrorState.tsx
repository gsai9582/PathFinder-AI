import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this section. You can retry or return to your dashboard.',
  onRetry,
  className
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-4',
        className
      )}
    >
      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="secondary"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-2"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
