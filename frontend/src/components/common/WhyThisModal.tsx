import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2, Clock, Target, BookOpen, Layers, Zap, Sliders } from 'lucide-react';
import { api } from '../../services/api';
import { WhyThisResponse } from '../../types';
import { useLearner } from '../../context/LearnerContext';

export const WhyThisModal: React.FC = () => {
  const { activeWhyThisId, openWhyThis, profile } = useLearner();
  const [data, setData] = useState<WhyThisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (activeWhyThisId) {
      setLoading(true);
      api.explainRecommendation(activeWhyThisId, profile?.id)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [activeWhyThisId, profile?.id]);

  if (!activeWhyThisId) return null;

  const breakdown = data?.score_breakdown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-glow rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative border border-slate-700 text-slate-100 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={() => openWhyThis(null)}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Generating Explainable AI Analysis...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PathFinder Recommendation Explainability</span>
              </div>
              <h2 className="text-xl font-bold text-white pr-8">{data.resource_title}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Transparent multi-factor rationale for your {data.learner_goal} trajectory.
              </p>
            </div>

            {/* AI Narrative Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-300 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Recommendation Rationale</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{data.ai_narrative_explanation}</p>
            </div>

            {/* 10-Factor Scoring Breakdown (if available) */}
            {breakdown && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Algorithmic Fit Factor Breakdown</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">100-Point Normalized Model</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Skill Gap Delta:</span>
                      <strong className="text-slate-200">{breakdown.skill_gap_weight} / 25 pts</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(breakdown.skill_gap_weight / 25) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Goal Relevance:</span>
                      <strong className="text-slate-200">{breakdown.goal_relevance} / 15 pts</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(breakdown.goal_relevance / 15) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Prerequisites Match:</span>
                      <strong className="text-slate-200">{breakdown.prerequisite_match} / 15 pts</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(breakdown.prerequisite_match / 15) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Difficulty Match:</span>
                      <strong className="text-slate-200">{breakdown.difficulty_match} / 10 pts</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(breakdown.difficulty_match / 10) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Learning Style Fit:</span>
                      <strong className="text-slate-200">{breakdown.learning_style_match} / 10 pts</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(breakdown.learning_style_match / 10) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Time Fit:</span>
                      <strong className="text-slate-200">{breakdown.time_fit} / 5 pts</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(breakdown.time_fit / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Factor Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Skill Gap */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <Target className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-semibold uppercase text-[10px]">Identified Skill Gap</span>
                </div>
                <p className="text-sm font-bold text-white">{data.target_skill}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Current: <span className="text-slate-200">{data.current_proficiency}%</span> → Target: <span className="text-emerald-400">{data.required_proficiency}%</span> (Gap: <span className="text-rose-400">{data.gap}%</span>)
                </p>
              </div>

              {/* Prerequisites Status */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold uppercase text-[10px]">Prerequisites State</span>
                </div>
                <p className="text-sm font-bold text-emerald-400">Validated & Unlocked</p>
                <p className="text-xs text-slate-400 mt-1">{data.prerequisites_status}</p>
              </div>

              {/* Learning Style */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold uppercase text-[10px]">Format & Style Fit</span>
                </div>
                <p className="text-sm font-bold text-white">High Style Alignment</p>
                <p className="text-xs text-slate-400 mt-1">{data.learning_style_fit}</p>
              </div>

              {/* Estimated Time */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold uppercase text-[10px]">Estimated Duration</span>
                </div>
                <p className="text-sm font-bold text-white">{data.estimated_time}</p>
                <p className="text-xs text-slate-400 mt-1">Optimized for your weekly schedule</p>
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3 text-xs">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">Expected Learning Outcome:</span>
                <p className="text-slate-400 mt-0.5">{data.expected_outcome}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => openWhyThis(null)}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Understood, Continue
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
