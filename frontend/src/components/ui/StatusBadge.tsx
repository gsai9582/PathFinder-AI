import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className }) => {
  const getVariant = (s: string): 'success' | 'warning' | 'destructive' | 'info' | 'secondary' => {
    switch (s.toLowerCase()) {
      case 'completed':
      case 'strong':
      case 'top match':
      case 'passed':
        return 'success';

      case 'in progress':
      case 'developing':
      case 'high priority':
      case 'accelerated':
        return 'info';

      case 'available':
      case 'recommended':
      case 'needs attention':
        return 'warning';

      case 'critical':
      case 'critical gap':
      case 'remedial':
      case 'failed':
        return 'destructive';

      case 'locked':
      case 'optional':
      case 'beginner':
      case 'intermediate':
      case 'advanced':
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant(status)} size={size} className={cn('capitalize font-mono', className)}>
      {status}
    </Badge>
  );
};
