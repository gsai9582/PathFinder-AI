import React, { useState, useEffect } from 'react';
import {
  X, GitCompare, Sparkles, ArrowRight, CheckCircle2, AlertCircle,
  TrendingUp, Award, Layers, Target, Compass
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { CareerGoal, CareerGoalComparisonResponse } from '../../types';

export const CareerGoalComparisonModal: React.FC = () => {
  const { isCareerCompareOpen, toggleCareerCompare, profile } = useLearner();
  const [allCareers, setAllCareers] = useState<CareerGoal[]>([]);
  const [targetGoalId, setTargetGoalId] = useState<number>(2); // Default to Data Scientist (id: 2)
  const [comparison, setComparison] = useState<CareerGoalComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isCareerCompareOpen && profile) {
      const loadCareers = async () => {
        try {
          const list = await api.getCareers();
          setAllCareers(list);
          const other = list.find(c => c.id !== profile.career_goal_id) || list[0];
          if (other) setTargetGoalId(other.id);
        } catch (err) {
          console.error("Failed to load careers for comparison:", err);
        }
      };
      loadCareers();
    }
  }, [isCareerCompareOpen, profile]);

  useEffect(() => {
    if (isCareerCompareOpen && profile && targetGoalId) {
      const runCompare = async () => {
        setLoading(true);
        try {
          const res = await api.compareCareerGoals({
            profile_id: profile.id,
            target_goal_id: targetGoalId,
            current_goal_id: profile.career_goal_id
          });
          setComparison(res);
        } catch (err) {
          console.error("Failed to compare career goals:", err);
        } finally {
          setLoading(false);
        }
      };
      runCompare();
    }
  }, [isCareerCompareOpen, profile, targetGoalId]);

  if (!isCareerCompareOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-400 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GitCompare className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Career Goal Comparison Engine</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PIVOT ANALYSIS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Compare your current trajectory against alternative roles to measure skill overlap & transition effort.
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleCareerCompare(false)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Goal Selector Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Current Goal Display */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Current Learning Goal
              </span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>{comparison?.current_goal_title || profile?.career_goal_title || 'AI/ML Engineer'}</span>
              </div>
            </div>

            {/* Target Goal Selector */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
              <label className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                Compare Against Alternative Role
              </label>
              <select
                value={targetGoalId}
                onChange={(e) => setTargetGoalId(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-500/40 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
              >
                {allCareers
                  .filter(c => c.id !== profile?.career_goal_id)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Overlap & Metric Cards */}
          {comparison && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Overlap</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {comparison.skill_overlap_percentage}%
                </p>
                <span className="text-[10px] text-slate-400">Common Competencies</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shared Skills</span>
                <p className="text-2xl font-black text-white mt-1">
                  {comparison.shared_competencies_count}
                </p>
                <span className="text-[10px] text-slate-400">Transferable Skills</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Additional Gaps</span>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {comparison.additional_gaps_count}
                </p>
                <span className="text-[10px] text-slate-400">New Skills Required</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transition Pacing</span>
                <p className="text-2xl font-black text-cyan-400 mt-1">
                  ~{comparison.estimated_additional_weeks} wks
                </p>
                <span className="text-[10px] text-slate-400">To Job-Ready State</span>
              </div>
            </div>
          )}

          {/* AI Advice Callout */}
          {comparison && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-xs font-bold text-white">Transition Feasibility Assessment</h5>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {comparison.transition_feasibility}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{comparison.ai_transition_advice}</p>
              </div>
            </div>
          )}

          {/* Skills Breakdown Lists */}
          {comparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Shared Skills */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shared Competencies ({comparison.shared_skills.length})</span>
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comparison.shared_skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">{s.skill_name}</span>
                        <div className="text-[10px] text-slate-400">
                          Current: {s.current_proficiency}% • Target Req: {s.target_goal_required}%
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${s.status === 'Shared & Satisfied' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Required Skills */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Additional Skills for {comparison.target_goal_title} ({comparison.additional_skills.length})</span>
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comparison.additional_skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">{s.skill_name}</span>
                        <div className="text-[10px] text-slate-400">
                          Current: {s.current_proficiency}% • Target Req: {s.target_goal_required}%
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        New Requirement
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3">
          <button
            onClick={() => toggleCareerCompare(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
