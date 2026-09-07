import React, { useState } from 'react';
import {
  Roadmap,
  RoadmapPhase,
  RoadmapItem,
  AdaptationResponse,
  AdaptationRequest
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Award,
  Zap,
  BookOpen,
  Code2,
  ArrowRight,
  Check,
  GitBranch,
  Layers,
  X
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface RoadmapVisualizerProps {
  roadmap: Roadmap;
  onRefresh?: () => void;
  lastAdaptation?: AdaptationResponse | null;
  onSimulateAdaptation?: (req: AdaptationRequest) => Promise<void>;
  isAdapting?: boolean;
}

export const RoadmapVisualizer: React.FC<RoadmapVisualizerProps> = ({
  roadmap,
  onRefresh,
  lastAdaptation: initialAdaptation,
  onSimulateAdaptation,
  isAdapting = false
}) => {
  const { profile, openWhyThis, openFeedback } = useLearner();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<'timeline' | 'dag'>('dag');
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const [adaptationDiff, setAdaptationDiff] = useState<AdaptationResponse | null>(initialAdaptation || null);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [simScenario, setSimScenario] = useState<string>('low_score');
  const [simScore, setSimScore] = useState<number>(45);

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases(prev => ({ ...prev, [phaseNumber]: !prev[phaseNumber] }));
  };

  const handleMarkComplete = async (item: RoadmapItem) => {
    try {
      await api.updateItemStatus(item.id, 'Completed');
      if (item.resource_id) {
        openFeedback(item.resource_id);
      }
      onRefresh?.();
      if (selectedItem?.id === item.id) {
        setSelectedItem(prev => prev ? { ...prev, status: 'Completed' } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleStartItem = async (item: RoadmapItem) => {
    try {
      if (item.status === 'Available') {
        await api.updateItemStatus(item.id, 'In Progress');
        onRefresh?.();
      }
      if (item.item_type === 'Assessment') {
        navigate('/assessments');
      } else if (item.item_type === 'Project') {
        navigate('/projects');
      } else if (item.resource_url) {
        window.open(item.resource_url, '_blank');
      }
    } catch (err) {
      console.error('Failed to start item:', err);
    }
  };

  const executeSimulation = async (scenarioKey: string, customScore?: number) => {
    if (!profile) return;
    let req: AdaptationRequest;

    if (scenarioKey === 'low_score') {
      req = {
        profile_id: profile.id,
        trigger_type: 'assessment',
        skill_name: 'Machine Learning',
        score: customScore !== undefined ? customScore : 45,
        mistakes_identified: ['Decision Trees Gini Impurity', 'Overfitting Regularization']
      };
    } else if (scenarioKey === 'high_score') {
      req = {
        profile_id: profile.id,
        trigger_type: 'assessment',
        skill_name: 'Machine Learning',
        score: customScore !== undefined ? customScore : 95
      };
    } else if (scenarioKey === 'too_hard') {
      req = {
        profile_id: profile.id,
        trigger_type: 'feedback',
        skill_name: 'Statistics & Probability',
        difficulty_feedback: 'Too Hard',
        score: 48
      };
    } else {
      req = {
        profile_id: profile.id,
        trigger_type: 'inactivity',
        skill_name: 'Python for AI',
        days_inactive: 16
      };
    }

    try {
      if (onSimulateAdaptation) {
        await onSimulateAdaptation(req);
      } else {
        const res = await api.adaptRoadmap(req);
        setAdaptationDiff(res);
        onRefresh?.();
      }
      setShowSimModal(false);
    } catch (err) {
      console.error('Adaptation simulation failed:', err);
    }
  };

  const getItemTypeBadge = (type: string) => {
    switch (type) {
      case 'Assessment':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center space-x-1">
            <Award className="w-3 h-3" />
            <span>Assessment</span>
          </span>
        );
      case 'Project':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center space-x-1">
            <Code2 className="w-3 h-3" />
            <span>Project</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
            <BookOpen className="w-3 h-3" />
            <span>Learning</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl glass-panel-glow border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAG Prerequisite Learning Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white">{roadmap.title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{roadmap.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveView('dag')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeView === 'dag' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>DAG Path</span>
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeView === 'timeline' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>
          <button
            onClick={() => setShowSimModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Adaptation</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Overall Progress</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">{Math.round(roadmap.completion_percentage)}%</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, roadmap.completion_percentage))}%` }} />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Total Estimated Effort</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{roadmap.total_estimated_hours}</span>
            <span className="text-xs text-slate-400">hours</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Total Phases</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-400">{roadmap.phases.length}</span>
            <span className="text-xs text-slate-400">DAG tiers</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Adaptive Status</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            <span className="text-sm font-bold text-emerald-400">Live Continuous</span>
          </div>
        </div>
      </div>

      {/* BEFORE -> AFTER ADAPTATION SHOWCASE (When an adaptation occurs) */}
      {adaptationDiff && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/40 shadow-xl space-y-4 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <button
              onClick={() => setAdaptationDiff(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">{adaptationDiff.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {adaptationDiff.trigger_type === 'assessment' ? `Assessment: ${adaptationDiff.score}%` : adaptationDiff.trigger_type}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{adaptationDiff.summary}</p>
            </div>
          </div>

          {/* Visual Step Transformation Flow */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2">Live Transformation Sequence</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                {adaptationDiff.skill_name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className={`px-2.5 py-1 rounded-lg font-bold border ${
                (adaptationDiff.score || 0) >= 90
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : (adaptationDiff.score || 0) < 50
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>
                Score: {adaptationDiff.score !== undefined ? `${adaptationDiff.score}%` : 'Evaluation'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {adaptationDiff.changes.map((chg, cIdx) => (
                <React.Fragment key={cIdx}>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center space-x-1 ${
                    chg.badge_color === 'rose'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : chg.badge_color === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : chg.badge_color === 'blue'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : chg.badge_color === 'purple'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {chg.action === 'added' && <span>[+ Added]</span>}
                    {chg.action === 'delayed' && <span>[⏱️ Delayed]</span>}
                    {chg.action === 'accelerated' && <span>[⚡ Accelerated]</span>}
                    {chg.action === 'completed' && <span>[✓ Credited]</span>}
                    <span>{chg.title}</span>
                  </span>
                  {cIdx < adaptationDiff.changes.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Before vs After Summary Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Before Adaptation</span>
              <p className="text-slate-300 mt-1">{adaptationDiff.before_state_summary}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">After Adaptation</span>
              <p className="text-emerald-200 mt-1">{adaptationDiff.after_state_summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: INTERACTIVE DAG PIPELINE VIEW */}
      {activeView === 'dag' && (
        <div className="space-y-6">
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[900px] flex items-start space-x-6 relative">
              {roadmap.phases.map((phase) => {
                const isCompleted = phase.status === 'Completed';
                const isInProgress = phase.status === 'In Progress';

                return (
                  <div key={phase.id} className="w-72 shrink-0 space-y-3 relative">
                    {/* Phase Header Capsule */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : isInProgress
                        ? 'bg-blue-950/30 border-blue-500/40 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          Phase {phase.phase_number}
                        </span>
                        <StatusBadge status={phase.status} />
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{phase.title}</h4>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{phase.items.length} items</span>
                        <span>{phase.estimated_hours}h total</span>
                      </div>
                    </div>

                    {/* Items List in Phase */}
                    <div className="space-y-2.5">
                      {phase.items.map((item) => {
                        const itemCompleted = item.status === 'Completed';
                        const itemInProgress = item.status === 'In Progress';

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                              item.is_remedial
                                ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400 shadow-md shadow-rose-500/10'
                                : item.is_accelerated
                                ? 'bg-purple-950/30 border-purple-500/40 hover:border-purple-400'
                                : item.is_delayed
                                ? 'bg-slate-900/60 border-amber-500/30 opacity-75'
                                : itemCompleted
                                ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-400'
                                : itemInProgress
                                ? 'bg-slate-900 border-blue-500/50 hover:border-blue-400 shadow-md shadow-blue-500/10'
                                : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-65'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              {getItemTypeBadge(item.item_type)}
                              <StatusBadge status={item.status} />
                            </div>

                            <h5 className="text-xs font-bold text-white line-clamp-2 mt-1.5">{item.title}</h5>

                            {item.is_remedial && (
                              <div className="mt-1 flex items-center space-x-1 text-[10px] text-rose-400 font-semibold">
                                <Zap className="w-3 h-3" />
                                <span>Reinforcement Injected</span>
                              </div>
                            )}

                            {item.is_delayed && (
                              <div className="mt-1 flex items-center space-x-1 text-[10px] text-amber-400 font-semibold">
                                <Clock className="w-3 h-3" />
                                <span>Delayed for Prerequisites</span>
                              </div>
                            )}

                            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{item.estimated_minutes}m</span>
                              </span>
                              <span className="text-emerald-400 hover:text-emerald-300 font-semibold">Details →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DETAILED TIMELINE ACCORDION VIEW */}
      {activeView === 'timeline' && (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
          {roadmap.phases.map((phase) => {
            const isExpanded = expandedPhases[phase.phase_number] !== false;
            const isCompleted = phase.status === 'Completed';
            const isInProgress = phase.status === 'In Progress';
            const isLocked = phase.status === 'Locked';

            return (
              <div key={phase.id} className="relative group">
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
                      : isInProgress
                      ? 'bg-blue-500 border-blue-400 text-white animate-pulse shadow-lg shadow-blue-500/30'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <span className="text-[10px] font-bold">{phase.phase_number}</span>
                  )}
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/90 transition-all hover:border-slate-700 shadow-md">
                  <div
                    onClick={() => togglePhase(phase.phase_number)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <button className="text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-white">{phase.title}</h3>
                          {phase.is_remedial && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                              <Zap className="w-2.5 h-2.5" />
                              <span>Remedial Injected</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{phase.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono text-slate-300">{phase.estimated_hours} hrs</span>
                        <p className="text-[10px] text-slate-400">{phase.items.length} items</p>
                      </div>
                      <StatusBadge status={phase.status} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 space-y-3 border-t border-slate-800/40 mt-3">
                      {phase.items.map((item) => {
                        const itemCompleted = item.status === 'Completed';
                        const itemInProgress = item.status === 'In Progress';
                        const itemLocked = item.status === 'Locked';

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              item.is_remedial
                                ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400'
                                : item.is_delayed
                                ? 'bg-slate-900/40 border-amber-500/20 opacity-75'
                                : itemCompleted
                                ? 'bg-slate-900/60 border-emerald-500/30'
                                : itemInProgress
                                ? 'bg-slate-900 border-blue-500/40 shadow-sm'
                                : 'bg-slate-900/30 border-slate-800/60'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <button
                                onClick={() => handleMarkComplete(item)}
                                disabled={itemLocked}
                                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                  itemCompleted
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : itemInProgress
                                    ? 'border-blue-400 hover:bg-blue-500/20 text-blue-400'
                                    : 'border-slate-700 text-transparent hover:border-slate-500'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </button>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-white">{item.title}</span>
                                  {getItemTypeBadge(item.item_type)}
                                  <StatusBadge status={item.status} />
                                </div>

                                {item.objective && (
                                  <p className="text-xs text-slate-400 mt-1 max-w-xl">{item.objective}</p>
                                )}

                                {item.prerequisites_summary && (
                                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                    <span className="text-slate-400 font-semibold">Prerequisites: </span>
                                    {item.prerequisites_summary}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                              >
                                Details
                              </button>

                              {!itemCompleted && !itemLocked && (
                                <button
                                  onClick={() => handleStartItem(item)}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center space-x-1"
                                >
                                  <span>Start</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NODE DETAIL MODAL / DRAWER */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-panel-glow rounded-2xl border border-slate-800 p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {getItemTypeBadge(selectedItem.item_type)}
                  <StatusBadge status={selectedItem.status} />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedItem.difficulty || 'Intermediate'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Learning Objective</p>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {selectedItem.objective || 'Master fundamental principles, core implementation syntax, and practical problem-solving.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Prerequisite Dependencies</p>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                {selectedItem.prerequisites_summary || 'None (Foundational Module)'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Estimated Duration</span>
                <p className="text-sm font-bold text-white mt-0.5">{selectedItem.estimated_minutes} minutes</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Skill Domain</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{selectedItem.skill_name || 'Core Domain'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {selectedItem.resource_id ? (
                <button
                  onClick={() => {
                    openWhyThis(selectedItem.resource_id || null);
                    setSelectedItem(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Why this?</span>
                </button>
              ) : <div />}

              <div className="flex items-center space-x-2">
                {selectedItem.status !== 'Completed' && selectedItem.status !== 'Locked' && (
                  <button
                    onClick={() => {
                      handleMarkComplete(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700"
                  >
                    Mark Complete
                  </button>
                )}

                {selectedItem.status !== 'Locked' && (
                  <button
                    onClick={() => {
                      handleStartItem(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <span>{selectedItem.item_type === 'Assessment' ? 'Take Quiz' : 'Start Learning'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATION TRIGGER MODAL FOR HACKATHON DEMO */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel-glow rounded-2xl border border-emerald-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Zap className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Simulate Adaptive Mutation</h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Test how PathFinder's adaptive engine dynamically rewrites learning roadmaps in response to performance events.
            </p>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400 font-bold uppercase">Select Adaptive Scenario</label>

              <div
                onClick={() => {
                  setSimScenario('low_score');
                  setSimScore(45);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  simScenario === 'low_score'
                    ? 'bg-rose-950/40 border-rose-500/50 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">1. Low Assessment Score (45%)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Remediation</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Injects reinforcement review, foundational practice set, and delays advanced ML modules.
                </p>
              </div>

              <div
                onClick={() => {
                  setSimScenario('high_score');
                  setSimScore(95);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  simScenario === 'high_score'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">2. High Mastery Score (95%)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Acceleration</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fast-tracks upcoming phases, credits introductory modules, and injects advanced production challenge.
                </p>
              </div>

              <div
                onClick={() => setSimScenario('too_hard')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  simScenario === 'too_hard'
                    ? 'bg-amber-950/40 border-amber-500/50 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">3. Learner Feedback: "Too Hard"</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Scaffolding</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Injects step-by-step walkthrough practice and buffers upcoming pacing.
                </p>
              </div>

              <div
                onClick={() => setSimScenario('inactivity')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  simScenario === 'inactivity'
                    ? 'bg-blue-950/40 border-blue-500/50 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">4. Inactivity Streak (14+ Days)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">Reactivation</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Injects 15-minute quick recap to reactivate mental models.
                </p>
              </div>
            </div>

            {/* Score Slider */}
            {(simScenario === 'low_score' || simScenario === 'high_score') && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Simulated Score:</span>
                  <span className="font-bold text-white">{simScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simScore}
                  onChange={(e) => setSimScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowSimModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => executeSimulation(simScenario, simScore)}
                disabled={isAdapting}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isAdapting ? 'Adapting Roadmap...' : 'Execute Adaptation Engine'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
