import React, { useState } from 'react';
import { SkillGapItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Target, CheckCircle2, Lock, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SkillGapBarsProps {
  skills: SkillGapItem[];
}

export const SkillGapBars: React.FC<SkillGapBarsProps> = ({ skills }) => {
  const [filter, setFilter] = useState<string>('All');
  const navigate = useNavigate();

  const filteredSkills = skills.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Critical Gap') return item.priority === 'Critical Gap';
    if (filter === 'Needs Attention') return item.priority === 'Needs Attention';
    if (filter === 'Developing') return item.priority === 'Developing';
    if (filter === 'Strong') return item.priority === 'Strong';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Category Filter Chips */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Critical Gap', 'Needs Attention', 'Developing', 'Strong'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                filter === cat
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredSkills.length} of {skills.length} skills
        </span>
      </div>

      {/* Skill Gap Cards List */}
      <div className="space-y-3">
        {filteredSkills.map((item) => (
          <div
            key={item.skill_id}
            className="p-4 rounded-xl glass-panel border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white">{item.skill_name}</h4>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/80">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span>
                    Current: <strong className="text-slate-200">{item.current_proficiency}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Required: <strong className="text-emerald-400">{item.required_proficiency}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Gap: <strong className="text-rose-400">{item.gap}%</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <StatusBadge status={item.priority} size="sm" />
                <button
                  onClick={() => navigate(`/recommendations?skill_id=${item.skill_id}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 text-xs font-medium border border-slate-700 transition-colors hidden sm:block"
                >
                  View Resources
                </button>
              </div>
            </div>

            {/* Proficiency Comparison Bar */}
            <div className="space-y-1">
              <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                {/* Target marker */}
                <div
                  className="absolute top-0 bottom-0 bg-blue-500/40 rounded-full"
                  style={{ width: `${item.required_proficiency}%` }}
                />
                {/* Current progress */}
                <div
                  className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${
                    item.priority === 'Strong'
                      ? 'bg-emerald-500'
                      : item.priority === 'Critical Gap'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${item.current_proficiency}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0%</span>
                <span className="text-slate-400">Target: {item.required_proficiency}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Confidence & Prerequisite Indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500">Confidence:</span>
                <span className="font-semibold text-slate-300">{Math.round(item.confidence * 100)}%</span>
              </div>
              <div className="flex items-center space-x-1">
                {item.prerequisites_met ? (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Prerequisites satisfied</span>
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Prerequisites pending</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
