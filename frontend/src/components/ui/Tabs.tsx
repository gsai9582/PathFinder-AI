import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant?: 'underline' | 'pills';
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'underline' | 'pills';
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  variant = 'underline',
  children,
  className
}) => {
  const [currentTab, setCurrentTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : currentTab;

  const handleTabChange = (newTab: string) => {
    if (value === undefined) setCurrentTab(newTab);
    onValueChange?.(newTab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, variant }}>
      <div className={cn('w-full space-y-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = useContext(TabsContext);
  const isPills = context?.variant === 'pills';

  return (
    <div
      className={cn(
        'flex items-center space-x-2',
        isPills ? 'p-1 rounded-xl bg-slate-900 border border-slate-800' : 'border-b border-slate-800',
        className
      )}
    >
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  className?: string;
}> = ({ value, children, icon, badge, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.activeTab === value;
  const isPills = context.variant === 'pills';

  if (isPills) {
    return (
      <button
        onClick={() => context.setActiveTab(value)}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 select-none',
          isActive
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'text-slate-400 hover:text-slate-200',
          className
        )}
      >
        {icon}
        <span>{children}</span>
        {badge !== undefined && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-150 flex items-center space-x-2 select-none -mb-px',
        isActive
          ? 'border-emerald-500 text-emerald-400'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700',
        className
      )}
    >
      {icon}
      <span>{children}</span>
      {badge !== undefined && (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
          {badge}
        </span>
      )}
    </button>
  );
};

export const TabsContent: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({
  value,
  children,
  className
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.activeTab !== value) return null;
  return <div className={cn('animate-fade-in focus:outline-none', className)}>{children}</div>;
};
