import React, { useState, useEffect } from 'react';
import { ProjectDetailResponse, ProjectMilestone } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  ExternalLink,
  Code,
  ShieldCheck,
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ProjectDetailDrawerProps {
  detail: ProjectDetailResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToRoadmap?: (projectId: number) => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  detail,
  isOpen,
  onClose,
  onAddToRoadmap
}) => {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);

  useEffect(() => {
    if (detail?.milestones) {
      setMilestones(detail.milestones);
    }
  }, [detail]);

  if (!isOpen || !detail) return null;

  const { project, why_this_project, skills_developed, estimated_time, portfolio_value, prerequisites, readiness_status } = detail;

  const toggleMilestone = (id: number) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, is_completed: !m.is_completed } : m))
    );
  };

  const completedCount = milestones.filter(m => m.is_completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {project.skill_name || 'Engineering'} Milestone
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{readiness_status}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-white mt-2 leading-snug">{project.title}</h2>

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              <StatusBadge status={project.difficulty} size="sm" />
              <div className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>{portfolio_value}</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-mono flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{estimated_time}</span>
              </div>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6">
            {/* AI Recommendation: Why this project? */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Why this project for your roadmap?</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {why_this_project}
              </p>
            </div>

            {/* Problem Statement */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-slate-400" />
                <span>Problem Statement</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {project.problem_statement}
              </p>
            </div>

            {/* Prerequisites Status */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Prerequisites Verification</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prerequisites.map((pre, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      pre.is_satisfied
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-200'
                        : 'bg-amber-500/5 border-amber-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {pre.is_satisfied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-white">{pre.skill_name}</span>
                        <p className="text-[10px] text-slate-400">
                          Current: {pre.current_proficiency}% (Req: {pre.required_proficiency}%)
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        pre.is_satisfied ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {pre.is_satisfied ? 'Met' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Milestones Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Interactive Milestones Checklist</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {completedCount}/{milestones.length} Completed ({progressPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Milestone Items */}
              <div className="space-y-2 pt-1">
                {milestones.map(m => (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(m.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                      m.is_completed
                        ? 'bg-slate-950/80 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <button className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400">
                      {m.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <div className="space-y-0.5">
                      <h4
                        className={`text-xs font-bold ${
                          m.is_completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Developed */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Skills Developed</h3>
              <div className="flex flex-wrap gap-2">
                {skills_developed.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tech Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {project.tech_stack.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-400">Expected Outcome:</span>
              <p className="text-xs text-slate-300 leading-relaxed">{project.expected_outcome}</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 sticky bottom-0">
            {project.template_repo_url ? (
              <a
                href={project.template_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-2 transition-colors border border-slate-700"
              >
                <span>Starter Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : <div />}

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (onAddToRoadmap) onAddToRoadmap(project.id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5"
              >
                <span>Start Milestone</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
