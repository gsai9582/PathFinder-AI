import React, { useEffect, useState } from 'react';
import { SkillDetailResponse } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink,
  BookOpen,
  Code2,
  Award,
  Clock,
  Star,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SkillDetailDrawerProps {
  skillId: number | null;
  profileId?: number;
  onClose: () => void;
}

export const SkillDetailDrawer: React.FC<SkillDetailDrawerProps> = ({
  skillId,
  profileId,
  onClose
}) => {
  const [detail, setDetail] = useState<SkillDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (skillId) {
      setLoading(true);
      api
        .getSkillDetail(skillId, profileId)
        .then(setDetail)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setDetail(null);
    }
  }, [skillId, profileId]);

  if (!skillId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden animate-slide-left">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {detail?.category || 'Skill Competency'}
              </span>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                {detail?.difficulty_tier || 'Intermediate'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {detail?.skill_name || 'Loading Skill Details...'}
            </h2>
            {detail?.description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {detail.description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading || !detail ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">
                Fetching verified competency diagnostics...
              </p>
            </div>
          ) : (
            <>
              {/* Proficiency Gauge & Gap Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Proficiency Benchmark Status</span>
                  <StatusBadge status={detail.status} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Current</span>
                    <p className="text-lg font-black text-white">{detail.current_proficiency}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Target</span>
                    <p className="text-lg font-black text-blue-400">{detail.required_proficiency}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Gap</span>
                    <p className="text-lg font-black text-rose-400">{detail.gap}%</p>
                  </div>
                </div>

                {/* Meter */}
                <div className="space-y-1">
                  <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-blue-500/30 rounded-full"
                      style={{ width: `${detail.required_proficiency}%` }}
                    />
                    <div
                      className={`absolute top-0 bottom-0 rounded-full ${
                        detail.status === 'Strong'
                          ? 'bg-emerald-500'
                          : detail.status === 'Critical Gap'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${detail.current_proficiency}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Baseline (0%)</span>
                    <span>Confidence: {Math.round(detail.confidence * 100)}%</span>
                    <span>Benchmark ({detail.required_proficiency}%)</span>
                  </div>
                </div>

                {/* Evidence & Verification Metadata */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-slate-300">Verification Source:</span>
                      <span className="capitalize">{detail.source.replace('_', ' ')}</span>
                    </div>
                    {detail.last_assessed_at && (
                      <div className="flex items-center space-x-1 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(detail.last_assessed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {detail.evidence && (
                    <p className="text-[11px] text-slate-300 font-sans italic bg-slate-950/60 p-2 rounded border border-slate-800/60">
                      "{detail.evidence}"
                    </p>
                  )}
                </div>
              </div>

              {/* AI Strategic Recommendation Box */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Strategic Prescription</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {detail.ai_recommendation}
                </p>
              </div>

              {/* Prerequisites Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Prerequisite Dependency Status</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {detail.prerequisites_met ? 'All Met' : 'Unmet Blockers'}
                  </span>
                </div>

                {detail.prerequisites.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
                    No foundational prerequisites required. This is a Tier 1 bedrock skill.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detail.prerequisites.map((p) => (
                      <div
                        key={p.prerequisite_skill_id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          p.is_satisfied
                            ? 'bg-emerald-950/10 border-emerald-800/30 text-slate-300'
                            : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {p.is_satisfied ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <p className="font-bold text-white">{p.prerequisite_name}</p>
                            <span className="text-[10px] text-slate-400">
                              Requires {p.min_proficiency_required}% (Current: {p.current_proficiency}%)
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            p.is_satisfied
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {p.is_satisfied ? 'Satisfied' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Downstream Skills Unlocked */}
              {detail.unlocks_skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Downstream Skills Unlocked ({detail.unlocks_skills.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.unlocks_skills.map((u) => (
                      <span
                        key={u.skill_id}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center space-x-1"
                      >
                        <span>{u.skill_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (min {u.min_proficiency_required}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Learning Resources */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Curated Resources for this Skill</span>
                  </h3>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/recommendations?skill_id=${detail.skill_id}`);
                    }}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {detail.related_resources.length === 0 ? (
                  <p className="text-xs text-slate-500">No resources matched for this skill.</p>
                ) : (
                  <div className="space-y-2">
                    {detail.related_resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                              {res.type}
                            </span>
                            <span className="text-slate-600 text-[10px]">•</span>
                            <span className="text-[10px] text-slate-400">{res.provider}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {res.title}
                          </h4>
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{res.duration_hours}h</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>{res.rating}</span>
                            </span>
                            <span className="text-slate-500">{res.difficulty}</span>
                          </div>
                        </div>

                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center space-x-1 shrink-0"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Projects */}
              {detail.related_projects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Applied Proof-of-Work Projects</span>
                  </h3>
                  <div className="space-y-2">
                    {detail.related_projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5"
                      >
                        <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {proj.problem_statement}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-wrap gap-1">
                            {proj.tech_stack.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              onClose();
                              navigate('/projects');
                            }}
                            className="text-xs text-purple-400 hover:underline font-medium"
                          >
                            View Project
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/assessments');
            }}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Take Skill Assessment</span>
          </button>

          <button
            onClick={() => {
              if (detail) {
                onClose();
                navigate(`/recommendations?skill_id=${detail.skill_id}`);
              }
            }}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Start Learning Path</span>
          </button>
        </div>
      </div>
    </div>
  );
};
