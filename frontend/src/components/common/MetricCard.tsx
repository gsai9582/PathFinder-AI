import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: string;
  badge?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  badge,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</h3>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center text-xs font-medium mt-2.5 ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{trendPositive ? '↑' : '↓'} {trend}</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl border ${accentColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
