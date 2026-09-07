import React, { useEffect, useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { api } from '../services/api';
import { SkillGapResponse, SkillMomentumResponse } from '../types';
import { SkillGapRadar } from '../components/skill-gap/SkillGapRadar';
import { SkillGapTable } from '../components/skill-gap/SkillGapTable';
import { SkillDependencyGraph } from '../components/skill-gap/SkillDependencyGraph';
import { SkillDetailDrawer } from '../components/skill-gap/SkillDetailDrawer';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  HelpCircle,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SkillGapPage: React.FC = () => {
  const { profile } = useLearner();
  const [data, setData] = useState<SkillGapResponse | null>(null);
  const [momentum, setMomentum] = useState<SkillMomentumResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'table'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setLoading(true);
      Promise.all([
        api.getSkillGap(profile.id),
        api.getSkillMomentum(profile.id)
      ])
        .then(([gapData, momData]) => {
          setData(gapData);
          setMomentum(momData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [profile]);

  if (loading || !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">
          Executing Multi-Dimensional Skill-Gap Engine & Topological DAG Solver...
        </p>
      </div>
    );
  }

  const criticalGaps = data.critical_gaps || data.skill_gaps.filter((s) => s.status === 'Critical Gap');
  const strongSkills = data.strong_skills || data.skill_gaps.filter((s) => s.status === 'Strong');

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Page Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Taxonomy-Grounded Competency Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Skill-Gap Diagnostics — {data.career_goal_title}
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              PathFinder measures the multidimensional delta between your current proficiency, assessment evidence, and industry role benchmarks.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => navigate('/assessments')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <span>Take Diagnostic Quiz</span>
            </button>
            <button
              onClick={() => navigate('/recommendations')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
            >
              <span>View Recommended Path</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Gap Reduction Progress Bar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Target Role Benchmark Coverage:</span>
              <strong className="text-emerald-400 font-mono text-sm">
                {data.gap_reduction_progress || Math.max(10, 100 - Math.round(data.overall_gap_score))}%
              </strong>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Overall Weighted Gap Index: {Math.round(data.overall_gap_score)}%
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{
                width: `${data.gap_reduction_progress || Math.max(10, 100 - Math.round(data.overall_gap_score))}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span>Critical Gaps</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{data.critical_gaps_count}</p>
          <p className="text-[11px] text-slate-500">Prerequisite & high-weight deficits</p>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span>Needs Attention</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            {data.needs_attention_count || data.developing_skills_count}
          </p>
          <p className="text-[11px] text-slate-500">Moderate gap (25-45% delta)</p>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span>Developing</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400">{data.developing_skills_count}</p>
          <p className="text-[11px] text-slate-500">In progression trajectory</p>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span>Strong Skills</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{data.strong_skills_count}</p>
          <p className="text-[11px] text-slate-500">Benchmark satisfied (≥90%)</p>
        </div>
      </div>

      {/* Critical Gaps & Strong Skills Spotlight Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Blockers Spotlight */}
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-white">Critical Bottlenecks</h3>
            </div>
            <span className="text-[10px] font-mono text-rose-300">
              {criticalGaps.length} urgent blockers
            </span>
          </div>

          <div className="space-y-2">
            {criticalGaps.slice(0, 3).map((item) => (
              <div
                key={item.skill_id}
                onClick={() => setSelectedSkillId(item.skill_id)}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{item.skill_name}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                    <span>Current: <strong className="text-slate-200">{item.current_proficiency}%</strong></span>
                    <span>•</span>
                    <span>Target: <strong className="text-rose-400">{item.required_proficiency}%</strong></span>
                    <span>•</span>
                    <span className="text-rose-400 font-mono font-bold">-{item.gap}% Gap</span>
                  </div>
                </div>
                <button className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Strong Foundations Spotlight */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-white">Strong Bedrock Foundations</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-300">
              {strongSkills.length} verified competencies
            </span>
          </div>

          <div className="space-y-2">
            {strongSkills.slice(0, 3).map((item) => (
              <div
                key={item.skill_id}
                onClick={() => setSelectedSkillId(item.skill_id)}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{item.skill_name}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                    <span>Current: <strong className="text-emerald-400">{item.current_proficiency}%</strong></span>
                    <span>•</span>
                    <span>Required: {item.required_proficiency}%</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono font-bold">Benchmark Met</span>
                  </div>
                </div>
                <button className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Chart & AI Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Axis Competency Radar</h3>
              <p className="text-[11px] text-slate-400">
                Current Learner Proficiency vs Role Benchmark (0-100%)
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {data.radar_data.length} Dimensional Axes
            </span>
          </div>

          <SkillGapRadar data={data.radar_data} />

          <div className="flex items-center justify-center space-x-6 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-slate-300 font-medium">Your Current Proficiency</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              <span className="text-slate-300 font-medium">Target Role Benchmark</span>
            </div>
          </div>
        </div>

        {/* AI Strategic Explanation */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Strategic Explanation</span>
            </div>
            <h3 className="text-base font-bold text-white leading-tight">
              Topological Diagnostic Analysis
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {data.ai_analysis_summary}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Prerequisite Rule Active:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              PathFinder strictly blocks downstream recommendations (e.g. Deep Learning & MLOps) until parent prerequisites in Statistics and Machine Learning reach verified threshold mastery.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Skill Momentum Metric Strip */}
      {momentum && momentum.skills.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Skill Momentum (Continuous Competency Velocity)</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Avg Growth: +{momentum.average_growth_delta}% / cycle
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {momentum.skills.map((item) => (
              <div
                key={item.skill_id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate">{item.skill_name}</span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.trend_direction === 'up'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-400 bg-slate-800'
                    }`}
                  >
                    {item.trend_display}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Current: <strong className="text-slate-200">{item.current_proficiency}%</strong>
                  </span>
                  <span className="text-[10px] text-slate-500">Prev: {item.previous_proficiency}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Skill Dependency Graph */}
      <SkillDependencyGraph
        graph={data.dependency_graph}
        onSelectSkill={(skillId) => setSelectedSkillId(skillId)}
        selectedSkillId={selectedSkillId}
      />

      {/* Full Skill Gap Table with Momentum Indicators */}
      <SkillGapTable
        skills={data.skill_gaps}
        onSelectSkill={(skillId) => setSelectedSkillId(skillId)}
        selectedSkillId={selectedSkillId}
        momentumMap={
          momentum?.skills.reduce((acc, curr) => {
            acc[curr.skill_name] = {
              current: curr.current_proficiency,
              previous: curr.previous_proficiency,
              delta: curr.trend_delta,
              trend_display: curr.trend_display
            };
            return acc;
          }, {} as Record<string, { current: number; previous: number; delta: number; trend_display: string }>)
        }
      />

      {/* Skill Detail Slide-out Drawer */}
      <SkillDetailDrawer
        skillId={selectedSkillId}
        profileId={profile?.id}
        onClose={() => setSelectedSkillId(null)}
      />
    </div>
  );
};
