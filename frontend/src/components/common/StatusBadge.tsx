import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium'
  };

  const getStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case 'strong':
      case 'completed':
      case 'passed':
      case 'top match':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'developing':
      case 'in progress':
      case 'available':
      case 'high priority':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'needs attention':
      case 'recommended':
      case 'medium':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'critical gap':
      case 'locked':
      case 'failed':
      case 'critical':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium tracking-wide ${sizeClasses[size]} ${getStyle(status)} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
};
