import React, { useState, useEffect } from 'react';
import { X, Sliders, Sparkles, Clock, Calendar, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { WhatIfResponse } from '../../types';

export const WhatIfDrawer: React.FC = () => {
  const { isWhatIfOpen, toggleWhatIf, profile } = useLearner();
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weekly_hours || 10);
  const [focusMode, setFocusMode] = useState<string>('balanced');
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setWeeklyHours(profile.weekly_hours || 10);
    }
  }, [profile]);

  useEffect(() => {
    if (isWhatIfOpen && profile) {
      runSimulation(weeklyHours, focusMode);
    }
  }, [isWhatIfOpen]);

  const runSimulation = async (hours: number, mode: string) => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await api.simulateWhatIf({
        profile_id: profile.id,
        weekly_hours: hours,
        focus_mode: mode
      });
      setResult(data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setWeeklyHours(val);
    runSimulation(val, focusMode);
  };

  const handleModeChange = (mode: string) => {
    setFocusMode(mode);
    runSimulation(weeklyHours, mode);
  };

  if (!isWhatIfOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Pathway Simulator</span>
            </div>
            <h2 className="text-lg font-bold text-white">Dynamic Timeline Simulation</h2>
            <p className="text-xs text-slate-400">See how study capacity recalibrates your roadmapped graduation date.</p>
          </div>
          <button
            onClick={() => toggleWhatIf(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-5 my-6">
          {/* Weekly Hours Slider */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Available Study Hours</span>
              <span className="text-base font-extrabold text-emerald-400">{weeklyHours} hrs / week</span>
            </div>
            <input
              type="range"
              min="2"
              max="35"
              step="1"
              value={weeklyHours}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2 hrs (Casual)</span>
              <span>10 hrs (Standard)</span>
              <span>25+ hrs (Intensive)</span>
            </div>
          </div>

          {/* Focus Mode Selection */}
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-300">Learning Track Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'balanced', label: 'Balanced Mastery', desc: 'Equal theory, code & projects' },
                { id: 'fast_track', label: 'Fast-Track', desc: 'Core essentials only' },
                { id: 'project_heavy', label: 'Project-First', desc: 'Milestone project focus' },
                { id: 'deep_mastery', label: 'Deep Theory', desc: 'Comprehensive mathematics' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    focusMode === m.id
                      ? 'bg-blue-500/15 border-blue-500 text-blue-300 font-medium'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{m.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation Results */}
        {result && (
          <div className="space-y-4">
            {/* Timeline Comparison Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-950 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-blue-300">Projected Completion</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  result.feasibility_status === 'Highly Realistic'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {result.feasibility_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-800 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Current Baseline</p>
                  <p className="text-xl font-black text-slate-300 mt-0.5">{result.current_estimated_months} <span className="text-xs font-normal text-slate-400">mo</span></p>
                  <p className="text-[10px] text-slate-500">at {result.current_weekly_hours} hrs/wk</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400 uppercase font-mono">Simulated Projection</p>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{result.simulated_estimated_months} <span className="text-xs font-normal text-emerald-400">mo</span></p>
                  <p className="text-[10px] text-slate-400">
                    {result.timeline_difference_months > 0
                      ? `+${result.timeline_difference_months} mo longer`
                      : `${result.timeline_difference_months} mo faster`}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{result.weekly_pacing_advice}</p>
            </div>

            {/* Phase Breakdown List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Phase Pacing Impact</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {result.phase_timeline_comparisons.map((p) => (
                  <div key={p.phase_number} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[200px]">{p.title}</span>
                    <div className="text-right text-[11px]">
                      <span className="font-mono text-white font-bold">{p.simulated_weeks} wks</span>
                      <span className="text-slate-500 text-[10px] ml-1.5">({p.estimated_hours}h)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation Adjustments */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <span className="font-bold text-slate-200">Simulation Adjustments:</span>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                {result.recommended_adjustments.map((adj, i) => (
                  <li key={i}>{adj}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 flex justify-end">
          <button
            onClick={() => toggleWhatIf(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
