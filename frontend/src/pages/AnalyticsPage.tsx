import React from 'react';
import { useLearner } from '../context/LearnerContext';
import { ReadinessGauge } from '../components/progress/ReadinessGauge';
import { SkillGrowthChart } from '../components/progress/SkillGrowthChart';
import {
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { profile, dashboard } = useLearner();

  if (!dashboard) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Computing Career Readiness Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Longitudinal Performance Analytics</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Career Readiness Dashboard</h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Comprehensive readiness diagnostics synthesizing technical competency scores, portfolio progress, assessment history, and study consistency.
        </p>
      </div>

      {/* Main Readiness Score Gauge */}
      <ReadinessGauge
        score={dashboard.career_readiness_score}
        breakdown={dashboard.readiness_breakdown}
        howToIncrease={dashboard.how_to_increase_readiness}
        careerGoalTitle={dashboard.career_goal}
      />

      {/* Growth Over Time Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Skill Proficiency Velocity (Last 4 Weeks)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tracking skill acquisition trajectory and prerequisite satisfaction.</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            +18% MOMENTUM
          </span>
        </div>

        <SkillGrowthChart data={dashboard.skill_growth_timeline} />

        <div className="flex items-center justify-center space-x-6 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Python Proficiency</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>SQL Foundations</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Statistics Mastery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
