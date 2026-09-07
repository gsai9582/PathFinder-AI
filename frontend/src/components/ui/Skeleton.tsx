import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-800/60', className)}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3 rounded', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};

export const SkeletonMetric: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-3', className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 rounded" />
      <Skeleton className="h-3 w-32 rounded" />
    </div>
  );
};
