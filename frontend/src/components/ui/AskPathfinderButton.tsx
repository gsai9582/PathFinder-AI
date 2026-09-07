import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { cn } from '../../lib/utils';

export const AskPathfinderButton: React.FC<{ className?: string }> = ({ className }) => {
  const { toggleChat, isChatOpen } = useLearner();

  if (isChatOpen) return null;

  return (
    <button
      onClick={() => toggleChat(true)}
      className={cn(
        'fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-emerald-500/30 shadow-xl shadow-slate-950/80 backdrop-blur-md flex items-center space-x-2 text-xs font-semibold tracking-tight transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
        className
      )}
      title="Open AI Career Tutor (Ctrl+K or Ask PathFinder)"
    >
      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <span>Ask PathFinder</span>
      <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 ml-1">
        AI
      </span>
    </button>
  );
};
