import React from 'react';
import { NextBestAction } from '../../types';
import { PlayCircle, Sparkles, Clock, ArrowRight, BookOpen, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NextActionBannerProps {
  action: NextBestAction;
}

export const NextActionBanner: React.FC<NextActionBannerProps> = ({ action }) => {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (action.item_type === 'Assessment') {
      navigate('/assessments');
    } else if (action.item_type === 'Project') {
      navigate('/projects');
    } else if (action.action_url) {
      window.open(action.action_url, '_blank');
    } else {
      navigate('/roadmap');
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
      <div className="flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
          <Sparkles className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
            <span>Your Next Best Action</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              {action.estimated_minutes} min
            </span>
          </div>
          <h3 className="text-base font-bold text-white">{action.title}</h3>
          <p className="text-xs text-slate-300 mt-0.5">{action.description}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
        <button
          onClick={handleActionClick}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch Next Action</span>
        </button>
      </div>
    </div>
  );
};
