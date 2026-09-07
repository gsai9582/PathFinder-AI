import React from 'react';
import { cn } from '../../lib/utils';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

export interface PageHeaderProps {
  title: string;
  description?: string;
  tag?: string;
  tagIcon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  tag,
  tagIcon,
  breadcrumbs,
  actions,
  className
}) => {
  return (
    <div className={cn('flex flex-col space-y-3 pb-6 border-b border-slate-800/80', className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-1" />}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {tag && (
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              {tagIcon}
              <span>{tag}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
          {description && <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">{description}</p>}
        </div>

        {actions && <div className="flex items-center space-x-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
