import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Map,
  Target,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { cn } from '../../lib/utils';

export const MobileBottomNav: React.FC = () => {
  const { toggleChat } = useLearner();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: Compass },
    { label: 'Roadmap', path: '/roadmap', icon: Map },
    { label: 'Skill Gaps', path: '/skill-gap', icon: Target },
    { label: 'Matches', path: '/recommendations', icon: BookOpen },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <button
        onClick={() => toggleChat(true)}
        className="flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium text-purple-400 hover:text-purple-300"
      >
        <Sparkles className="w-4 h-4 mb-0.5" />
        <span>Ask AI</span>
      </button>
    </div>
  );
};
