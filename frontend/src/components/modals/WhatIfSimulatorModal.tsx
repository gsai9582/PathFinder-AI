import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Sliders, Calendar, Clock, Layers, ArrowRight,
  TrendingUp, CheckCircle2, AlertTriangle, RefreshCw, BarChart2, BookOpen, Target
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { WhatIfResponse } from '../../types';

export const WhatIfSimulatorModal: React.FC = () => {
  const { isWhatIfOpen, toggleWhatIf, profile } = useLearner();
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weekly_hours || 10);
  const [targetMonths, setTargetMonths] = useState<number>(profile?.target_timeline_months || 6);
  const [learningStyle, setLearningStyle] = useState<string>('Hands-on');
  const [projectPref, setProjectPref] = useState<string>('balanced');
  const [difficulty, setDifficulty] = useState<string>('Adaptive');
  const [focusMode, setFocusMode] = useState<string>('balanced');

  const [simulation, setSimulation] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runSimulation = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const res = await api.simulateWhatIf({
        profile_id: profile.id,
        weekly_hours: weeklyHours,
        target_timeline_months: targetMonths,
        preferred_learning_style: learningStyle,
        project_preference: projectPref,
        difficulty: difficulty,
        focus_mode: focusMode
      });
      setSimulation(res);
    } catch (err) {
      console.error('Failed to simulate roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWhatIfOpen && profile) {
      setWeeklyHours(profile.weekly_hours || 10);
      setTargetMonths(profile.target_timeline_months || 6);
      runSimulation();
    }
  }, [isWhatIfOpen, profile]);

  // Re-run simulation on slider/preference changes with a debounced effect
  useEffect(() => {
    if (isWhatIfOpen && profile) {
      const timer = setTimeout(() => {
        runSimulation();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [weeklyHours, targetMonths, learningStyle, projectPref, difficulty, focusMode]);

  if (!isWhatIfOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sliders className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">What-If Roadmap Simulator</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME RECALCULATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore how changing your study hours, projects, and deadlines transforms your trajectory.
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleWhatIf(false)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            {/* Weekly Hours */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Weekly Study Commitment</span>
                </label>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {weeklyHours} hrs/week
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2h (Casual)</span>
                <span>10h (Standard)</span>
                <span>30h (Intensive)</span>
              </div>
            </div>

            {/* Target Deadline */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Graduation Goal</span>
                </label>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {targetMonths} months
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="18"
                step="1"
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2 mo (Fast)</span>
                <span>6 mo (Standard)</span>
                <span>18 mo (Paced)</span>
              </div>
            </div>

            {/* Project Preference */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Project Preference</span>
              </label>
              <select
                value={projectPref}
                onChange={(e) => setProjectPref(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="theory_focused">Theory & Fast Concepts</option>
                <option value="balanced">Balanced (Theory + Practice)</option>
                <option value="project_heavy">Project-Heavy (Portfolio First)</option>
              </select>
            </div>
          </div>

          {/* Comparative Cards: Current Path vs Simulated Path */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Current Path Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Current Path</h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Baseline Plan</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Weekly Commitment:</span>
                  <span className="font-semibold text-white">{simulation?.current_weekly_hours || 10} hrs/week</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Duration:</span>
                  <span className="font-semibold text-white">{simulation?.current_estimated_months || 6} months</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Weekly Tasks Pacing:</span>
                  <span className="font-semibold text-white">{simulation?.current_weekly_tasks || 4} modules / week</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Portfolio Capstones:</span>
                  <span className="font-semibold text-white">{simulation?.current_project_count || 5} Flagship Projects</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Skill Competency Coverage:</span>
                  <span className="font-semibold text-white">{simulation?.current_skill_coverage || 72}%</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Estimated Graduation:</span>
                  <span className="font-bold text-slate-200">{simulation?.current_completion_date || 'August 2026'}</span>
                </div>
              </div>
            </div>

            {/* Simulated Path Card */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Simulated Path</h4>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {simulation?.feasibility_status || 'Highly Realistic'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Weekly Commitment:</span>
                  <span className="font-bold text-emerald-300">{simulation?.simulated_weekly_hours || weeklyHours} hrs/week</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Estimated Duration:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-300">{simulation?.simulated_estimated_months || 4.5} months</span>
                    {simulation && simulation.timeline_difference_months !== 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${simulation.timeline_difference_months < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {simulation.timeline_difference_months < 0 ? `${simulation.timeline_difference_months} mo` : `+${simulation.timeline_difference_months} mo`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Weekly Tasks Pacing:</span>
                  <span className="font-bold text-white">{simulation?.simulated_weekly_tasks || 6} modules / week</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Portfolio Capstones:</span>
                  <span className="font-bold text-purple-300">{simulation?.simulated_project_count || 7} Projects</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Skill Competency Coverage:</span>
                  <span className="font-bold text-emerald-300">{simulation?.simulated_skill_coverage || 85}%</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-emerald-500/20">
                  <span className="text-slate-300">Target Graduation:</span>
                  <span className="font-bold text-emerald-400">{simulation?.simulated_completion_date || 'May 2026'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feasibility Advice Alert */}
          {simulation && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white mb-1">PathFinder Simulation Insight</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{simulation.weekly_pacing_advice}</p>
              </div>
            </div>
          )}

          {/* Phase-by-Phase Timeline Comparison Table */}
          {simulation && simulation.phase_timeline_comparisons && simulation.phase_timeline_comparisons.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Phase Timeline Comparisons</h5>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3.5">Phase</th>
                      <th className="py-2.5 px-3.5">Estimated Hours</th>
                      <th className="py-2.5 px-3.5">Current Pace</th>
                      <th className="py-2.5 px-3.5">Simulated Pace</th>
                      <th className="py-2.5 px-3.5">Timeline Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {simulation.phase_timeline_comparisons.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-slate-200">
                          {p.title}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400">{p.estimated_hours}h</td>
                        <td className="py-2.5 px-3.5 text-slate-300">{p.current_weeks} wks</td>
                        <td className="py-2.5 px-3.5 font-semibold text-emerald-300">{p.simulated_weeks} wks</td>
                        <td className="py-2.5 px-3.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.difference_weeks <= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {p.difference_weeks <= 0 ? `${p.difference_weeks} wks` : `+${p.difference_weeks} wks`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => {
              setWeeklyHours(profile?.weekly_hours || 10);
              setTargetMonths(profile?.target_timeline_months || 6);
              setProjectPref('balanced');
            }}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleWhatIf(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                toggleWhatIf(false);
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-colors flex items-center space-x-1.5"
            >
              <span>Apply Simulated Pace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
