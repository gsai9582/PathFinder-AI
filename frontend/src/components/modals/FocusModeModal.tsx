import React, { useState, useEffect } from 'react';
import {
  X, Play, Pause, RotateCcw, CheckCircle2, BookOpen, ExternalLink,
  Sparkles, Maximize2, Minimize2, Clock, Zap, ArrowRight
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export const FocusModeModal: React.FC = () => {
  const { isFocusModeOpen, toggleFocusMode, focusTaskTitle, dashboard } = useLearner();

  const [selectedDuration, setSelectedDuration] = useState<number>(45); // minutes
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(45 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (isFocusModeOpen) {
      setTimeLeftSeconds(selectedDuration * 60);
      setIsRunning(false);
      setIsCompleted(false);
    }
  }, [isFocusModeOpen, selectedDuration]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds(prev => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeftSeconds]);

  if (!isFocusModeOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.round(((selectedDuration * 60 - timeLeftSeconds) / (selectedDuration * 60)) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col text-slate-100 animate-fade-in select-none">
      {/* Top minimal bar */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">FOCUS SPRINT</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                DISTRACTION-FREE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Deep Work Engine</p>
          </div>
        </div>

        <button
          onClick={() => toggleFocusMode(false)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center items-center text-center space-y-8">
        {/* Active Task Name */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Target Objective</span>
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight max-w-xl">
            {focusTaskTitle || 'Decision Trees & Information Gain'}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Focus solely on understanding cost splitting metrics and scikit-learn tree construction.
          </p>
        </div>

        {/* Circular Countdown Timer Display */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-64 h-64 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-900/60 shadow-2xl shadow-emerald-500/5 relative overflow-hidden">
            {/* Background progress ring fill */}
            <div
              className="absolute inset-0 bg-emerald-500/10 transition-all duration-1000"
              style={{ clipPath: `inset(${100 - progressPercentage}% 0 0 0)` }}
            />
            
            <span className="text-5xl font-black text-white tracking-tighter z-10 font-mono">
              {formatTime(timeLeftSeconds)}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1 z-10">
              {progressPercentage}% Elapsed
            </span>
          </div>

          {/* Quick preset duration buttons */}
          <div className="flex items-center gap-2 mt-4">
            {[25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setSelectedDuration(mins);
                  setTimeLeftSeconds(mins * 60);
                  setIsRunning(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedDuration === mins
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(prev => !prev)}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all"
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pause Timer' : 'Start Session'}</span>
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeftSeconds(selectedDuration * 60);
            }}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsCompleted(true);
              setIsRunning(false);
            }}
            className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark Complete</span>
          </button>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-scale-in flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>🎉 Deep work sprint completed! +15 impact points credited to your Smart Streak.</span>
          </div>
        )}

        {/* Scratchpad for Quick Notes */}
        <div className="w-full max-w-lg text-left">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Session Scratchpad & Key Formula Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write key algorithmic points or questions for the AI assistant here..."
            className="w-full h-20 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-sans"
          />
        </div>
      </div>
    </div>
  );
};
