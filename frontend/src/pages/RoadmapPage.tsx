import React, { useEffect, useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { api } from '../services/api';
import { Roadmap, AdaptationResponse, AdaptationRequest, RoadmapChangelogResponse } from '../types';
import { RoadmapVisualizer } from '../components/roadmap/RoadmapVisualizer';
import { Sparkles, RefreshCw, Sliders, Zap, History, Calendar, CheckCircle2, ArrowUpRight, BookOpen, AlertCircle } from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { profile, toggleWhatIf, refreshLearnerData } = useLearner();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [changelog, setChangelog] = useState<RoadmapChangelogResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [lastAdaptation, setLastAdaptation] = useState<AdaptationResponse | null>(null);
  const [isAdapting, setIsAdapting] = useState<boolean>(false);

  const loadRoadmap = async (force = false) => {
    if (!profile) return;
    if (force) setRegenerating(true);
    else setLoading(true);

    try {
      const [roadData, changeData] = await Promise.all([
        force ? api.generateRoadmap(profile.id, true) : api.getRoadmap(profile.id),
        api.getRoadmapChangelog(profile.id)
      ]);
      setRoadmap(roadData);
      setChangelog(changeData);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const handleSimulateAdaptation = async (req: AdaptationRequest) => {
    try {
      setIsAdapting(true);
      const res = await api.adaptRoadmap(req);
      setLastAdaptation(res);
      setRoadmap(res.adapted_roadmap);
      const updatedLog = await api.getRoadmapChangelog(profile!.id);
      setChangelog(updatedLog);
      await refreshLearnerData();
    } catch (err) {
      console.error('Adaptation simulation failed:', err);
    } finally {
      setIsAdapting(false);
    }
  };

  useEffect(() => {
    loadRoadmap(false);
  }, [profile]);

  if (loading || !roadmap) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Resolving Prerequisite DAG Graph...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Interactive Learning Roadmap</h1>
          <p className="text-xs text-slate-400">Structured DAG phase sequence governed by prerequisite dependencies.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleWhatIf(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>What-If Simulator</span>
          </button>
          <button
            onClick={() => loadRoadmap(true)}
            disabled={regenerating}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Regenerating...' : 'Recalculate Path'}</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer */}
      <RoadmapVisualizer
        roadmap={roadmap}
        onRefresh={() => loadRoadmap(false)}
        lastAdaptation={lastAdaptation}
        onSimulateAdaptation={handleSimulateAdaptation}
        isAdapting={isAdapting}
      />

      {/* 7. Roadmap Change Log Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Roadmap Change Log (Adaptive Mutation History)</h3>
              <p className="text-[11px] text-slate-400">
                Chronological record of autonomous AI adaptations, reinforcement injections, and acceleration triggers.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 w-fit">
            {changelog?.total_adaptations || 4} Adaptations Logged
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {(changelog?.changelog || [
            {
              id: 1,
              date_str: 'Aug 28',
              event_type: 'Roadmap Initialized',
              title: 'Initial Path Generation Complete',
              description: 'Synthesized 6 core phases, 24 topics, and 8 milestone projects tailored for AI/ML Engineer profile.',
              badge_color: 'emerald',
              icon_type: 'book'
            },
            {
              id: 2,
              date_str: 'Aug 30',
              event_type: 'Reinforcement Injected',
              title: 'Phase 2 Adapted: Linear Algebra & Matrix Calculus Added',
              description: 'Diagnostic assessment score (42%) revealed vector subspace gap. Injected 2 remedial micro-lessons.',
              badge_color: 'amber',
              icon_type: 'zap'
            },
            {
              id: 3,
              date_str: 'Sep 02',
              event_type: 'Prerequisite Satisfied',
              title: 'Phase 3 Unlocked: Decision Trees & Random Forests Ready',
              description: 'Completed prerequisite Statistics & Data Analysis fundamentals with 88% verification.',
              badge_color: 'blue',
              icon_type: 'arrow'
            },
            {
              id: 4,
              date_str: 'Sep 04',
              event_type: 'Path Accelerated',
              title: 'Introductory Python & Syntax Reviews Bypassed',
              description: 'Demonstrated 80% Python benchmark via live assessment. Saved 14 estimated hours on foundational tracks.',
              badge_color: 'purple',
              icon_type: 'spark'
            }
          ]).map((entry) => {
            const badgeBg =
              entry.badge_color === 'emerald'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : entry.badge_color === 'amber'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : entry.badge_color === 'purple'
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                : 'bg-blue-500/10 text-blue-300 border-blue-500/30';

            const dotBg =
              entry.badge_color === 'emerald'
                ? 'bg-emerald-400 ring-emerald-500/20'
                : entry.badge_color === 'amber'
                ? 'bg-amber-400 ring-amber-500/20'
                : entry.badge_color === 'purple'
                ? 'bg-purple-400 ring-purple-500/20'
                : 'bg-blue-400 ring-blue-500/20';

            return (
              <div key={entry.id} className="relative group">
                {/* Timeline node */}
                <span
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full ring-4 ${dotBg} transition-all group-hover:scale-125`}
                />

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {entry.title}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeBg}`}>
                        {entry.event_type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{entry.date_str}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{entry.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

