import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  accentColor,
  onClick,
  className
}) => {
  return (
    <Card
      hoverEffect={!!onClick}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <CardContent className="p-5 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
          {Icon && (
            <div className={cn('p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300', accentColor)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</div>
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>

        {trend && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center space-x-1.5 text-[11px]">
            <span
              className={cn(
                'font-medium',
                trendPositive ? 'text-emerald-400' : 'text-slate-400'
              )}
            >
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
