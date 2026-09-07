import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, CheckCircle2, Circle, ArrowRight, Sparkles,
  Zap, Play, BookOpen, Award, Layers
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { DailyPlanResponse, DailyPlanItem } from '../../types';

export const DailyPlanModal: React.FC = () => {
  const { isDailyPlanOpen, toggleDailyPlan, profile, toggleFocusMode } = useLearner();
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResponse | null>(null);
  const [items, setItems] = useState<DailyPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isDailyPlanOpen && profile) {
      const loadPlan = async () => {
        setLoading(true);
        try {
          const res = await api.getDailyPlan(profile.id);
          setDailyPlan(res);
          setItems(res.items);
        } catch (err) {
          console.error("Failed to fetch daily plan:", err);
        } finally {
          setLoading(false);
        }
      };
      loadPlan();
    }
  }, [isDailyPlanOpen, profile]);

  if (!isDailyPlanOpen) return null;

  const toggleItemCompletion = (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_completed: !i.is_completed } : i));
  };

  const completedCount = items.filter(i => i.is_completed).length;
  const totalCompletedMinutes = items.filter(i => i.is_completed).reduce((acc, i) => acc + i.duration_minutes, 0);
  const totalMinutes = dailyPlan?.total_minutes || 120;

  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case 'Core Lesson':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">LESSON</span>;
      case 'Interactive Practice':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">PRACTICE</span>;
      case 'Diagnostic Assessment':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">ASSESSMENT</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">REVIEW</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Daily Learning Plan</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {dailyPlan?.date_formatted || 'TODAY'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                A high-efficiency 2-hour learning itinerary tailored to your active roadmap milestone.
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleDailyPlan(false)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Quote */}
        <div className="px-6 py-4 bg-slate-950/50 border-b border-slate-800/80 flex flex-col space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Today's Progress ({completedCount}/{items.length} tasks completed)</span>
            <span className="font-bold text-emerald-400">{totalCompletedMinutes} / {totalMinutes} mins</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(totalCompletedMinutes / Math.max(1, totalMinutes)) * 100}%` }}
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="p-6 space-y-3.5 flex-1 overflow-y-auto max-h-[50vh]">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                item.is_completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-65'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleItemCompletion(item.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {item.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.duration_minutes} min
                    </span>
                    {renderCategoryBadge(item.category)}
                  </div>
                  <h4 className={`text-xs font-bold ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {!item.is_completed && (
                <button
                  onClick={() => {
                    toggleDailyPlan(false);
                    toggleFocusMode(true, item.title);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[11px] font-bold shrink-0 flex items-center space-x-1 transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start in Focus</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{dailyPlan?.focus_quote || 'Consistent daily execution yields high skill retention.'}</span>
          </div>

          <button
            onClick={() => toggleDailyPlan(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
