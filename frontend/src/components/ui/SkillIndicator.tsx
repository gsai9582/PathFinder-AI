import React from 'react';
import { cn } from '../../lib/utils';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';

export interface SkillIndicatorProps {
  name: string;
  currentProficiency: number;
  requiredProficiency: number;
  priority?: string;
  gap?: number;
  className?: string;
}

export const SkillIndicator: React.FC<SkillIndicatorProps> = ({
  name,
  currentProficiency,
  requiredProficiency,
  priority,
  gap,
  className
}) => {
  const isSatisfied = currentProficiency >= requiredProficiency;

  return (
    <div className={cn('p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 space-y-2.5', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-white tracking-tight">{name}</h4>
          <p className="text-[11px] text-slate-400">
            Proficiency: <span className="text-slate-200 font-mono font-medium">{Math.round(currentProficiency)}%</span> / {Math.round(requiredProficiency)}%
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {priority && <StatusBadge status={priority} size="sm" />}
          {gap !== undefined && (
            <span
              className={cn(
                'text-[11px] font-mono font-bold',
                isSatisfied ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {isSatisfied ? 'Met' : `-${Math.round(gap)}%`}
            </span>
          )}
        </div>
      </div>

      <div className="relative pt-1">
        <ProgressBar
          value={currentProficiency}
          max={100}
          size="sm"
          variant={isSatisfied ? 'success' : 'default'}
        />
        {/* Benchmark Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-400 shadow-sm"
          style={{ left: `${Math.min(100, requiredProficiency)}%` }}
          title={`Benchmark: ${requiredProficiency}%`}
        />
      </div>
    </div>
  );
};
