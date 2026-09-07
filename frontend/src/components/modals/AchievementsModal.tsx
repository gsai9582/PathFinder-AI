import React, { useState, useEffect } from 'react';
import {
  X, Award, Flag, Target, FolderGit2, Compass, CheckCircle2, Lock,
  Sparkles, Trophy, Shield
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { AchievementResponse, AchievementItem } from '../../types';

export const AchievementsModal: React.FC = () => {
  const { isAchievementsOpen, toggleAchievements, profile } = useLearner();
  const [data, setData] = useState<AchievementResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isAchievementsOpen && profile) {
      const loadAchievements = async () => {
        setLoading(true);
        try {
          const res = await api.getAchievements(profile.id);
          setData(res);
        } catch (err) {
          console.error("Failed to load achievements:", err);
        } finally {
          setLoading(false);
        }
      };
      loadAchievements();
    }
  }, [isAchievementsOpen, profile]);

  if (!isAchievementsOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flag':
        return <Flag className="w-5 h-5 text-emerald-400" />;
      case 'Target':
        return <Target className="w-5 h-5 text-purple-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'FolderGit2':
        return <FolderGit2 className="w-5 h-5 text-cyan-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-blue-400" />;
      default:
        return <Trophy className="w-5 h-5 text-emerald-400" />;
    }
  };

  const renderTierBadge = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">PLATINUM</span>;
      case 'Gold':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">GOLD</span>;
      case 'Silver':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-300/20 text-slate-200 border border-slate-400/30">SILVER</span>;
      default:
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-800/30 text-amber-400 border border-amber-700/40">BRONZE</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Milestone Achievements</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {data?.unlocked_count || 4} of {data?.total_count || 5} UNLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rigorous competency badges earned through deliberate practice and project delivery.
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleAchievements(false)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievements List */}
        <div className="p-6 space-y-3.5 flex-1 overflow-y-auto max-h-[60vh]">
          {data?.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                ach.is_unlocked
                  ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ach.is_unlocked ? 'bg-slate-900 border border-slate-800 shadow-md' : 'bg-slate-900/50 border border-slate-800'}`}>
                  {ach.is_unlocked ? renderIcon(ach.icon_name) : <Lock className="w-4 h-4 text-slate-500" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                    {renderTierBadge(ach.tier)}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>
                  {ach.unlocked_at && (
                    <span className="text-[10px] text-emerald-400 font-semibold block pt-1">
                      ✓ Unlocked on {ach.unlocked_at}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {ach.progress}/{ach.max_progress}
                </span>
                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (ach.progress / Math.max(1, ach.max_progress)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => toggleAchievements(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
