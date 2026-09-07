import React from 'react';
import { ReadinessBreakdown } from '../../types';
import { Award, TrendingUp, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReadinessGaugeProps {
  score: number;
  breakdown: ReadinessBreakdown;
  howToIncrease?: string;
  careerGoalTitle?: string;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({
  score,
  breakdown,
  howToIncrease,
  careerGoalTitle = 'AI/ML Engineer'
}) => {
  const navigate = useNavigate();

  const factors = [
    { label: 'Technical Skills', value: breakdown.technical_skills, weight: '35%' },
    { label: 'Portfolio Projects', value: breakdown.projects, weight: '25%' },
    { label: 'Diagnostic Assessments', value: breakdown.assessments, weight: '20%' },
    { label: 'Learning Consistency', value: breakdown.consistency, weight: '10%' },
    { label: 'Career Goal Coverage', value: breakdown.goal_coverage, weight: '10%' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PathFinder Readiness Metric</span>
          </div>
          <h2 className="text-xl font-bold text-white">Career Readiness Score</h2>
          <p className="text-xs text-slate-400 mt-0.5">Calculated benchmark toward job-readiness as a {careerGoalTitle}.</p>
        </div>

        <div className="flex items-baseline space-x-2 shrink-0">
          <span className="text-4xl font-black text-emerald-400 tracking-tight">{Math.round(score)}%</span>
          <span className="text-xs text-slate-400 font-mono">/ 100%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/50"
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>

      {/* 5-Factor Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {factors.map((f, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{f.weight}</span>
            </div>
            <p className="font-semibold text-slate-200 truncate">{f.label}</p>
            <p className="text-base font-bold text-emerald-400">{Math.round(f.value)}%</p>
          </div>
        ))}
      </div>

      {/* How to increase advice */}
      {howToIncrease && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 flex items-start space-x-3 text-xs">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-emerald-300">How to Boost Your Readiness:</span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{howToIncrease}</p>
          </div>
        </div>
      )}

      {/* Disclaimers & Action */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
        <span>*PathFinder heuristic estimation based on target competency maps.</span>
        <button
          onClick={() => navigate('/roadmap')}
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
        >
          <span>Continue Roadmap</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
