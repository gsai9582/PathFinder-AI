import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  Map,
  Target,
  BookOpen,
  CheckSquare,
  FolderGit2,
  TrendingUp,
  Sparkles,
  Settings,
  User,
  Sliders,
  Award,
  ChevronRight,
  Flame,
  Briefcase
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { cn } from '../../lib/utils';
import { ProgressBar } from '../ui/ProgressBar';

export const AppSidebar: React.FC = () => {
  const { profile, dashboard, isDemoMode, loadDemoLearner, resetToNewLearner, toggleChat, toggleWhatIf } = useLearner();
  const location = useLocation();

  const mainNav = [
    { label: 'Overview', path: '/dashboard', icon: Compass },
    { label: 'My Roadmap', path: '/roadmap', icon: Map, badge: dashboard?.total_items_count ? `${dashboard.completed_items_count}/${dashboard.total_items_count}` : undefined },
    { label: 'Skill Gaps', path: '/skill-gap', icon: Target },
    { label: 'Recommendations', path: '/recommendations', icon: BookOpen },
    { label: 'Assessments', path: '/assessments', icon: CheckSquare },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Progress & Analytics', path: '/analytics', icon: TrendingUp },
  ];

  const secondaryNav = [
    { label: 'Career Goals', path: '/onboarding', icon: Briefcase },
    { label: 'Timeline Simulator', action: () => toggleWhatIf(true), icon: Sliders },
  ];

  const progressPct = dashboard?.overall_progress_percentage || 0;

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between select-none shrink-0 min-h-screen py-5 px-3">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-2.5 group">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-white">PATHFINDER</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Career Navigator</p>
            </div>
          </NavLink>
        </div>

        {/* Active Career Goal & Progress Widget */}
        {profile && (
          <div className="mx-2 p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <Briefcase className="w-3 h-3" />
                <span>Target Career</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {profile.target_timeline_months} mo
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white truncate">{profile.career_goal_title}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{profile.weekly_hours} hrs/week target</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Milestone Track</span>
                <span className="font-mono text-slate-300 font-semibold">{Math.round(progressPct)}%</span>
              </div>
              <ProgressBar value={progressPct} size="sm" />
            </div>
          </div>
        )}

        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Main Navigation
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* AI Assistant Quick Trigger */}
          <button
            onClick={() => toggleChat(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all duration-150 group"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span>AI Career Assistant</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live
            </span>
          </button>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Tools & Planning
          </div>
          {secondaryNav.map((item, idx) => {
            const Icon = item.icon;
            if (item.action) {
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all duration-150"
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={idx}
                to={item.path!}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                    isActive ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  )
                }
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Profile & Demo Mode Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        {/* Demo Switcher Pill */}
        <div className="px-2">
          {isDemoMode ? (
            <button
              onClick={resetToNewLearner}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-between transition-colors"
            >
              <span>Demo: Alex Morgan</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Exit</span>
            </button>
          ) : (
            <button
              onClick={loadDemoLearner}
              className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-400 font-semibold flex items-center justify-between transition-colors"
            >
              <span>Try Demo Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Small Profile Section */}
        {profile && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                {profile.full_name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">{profile.full_name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{profile.experience_level}</p>
              </div>
            </div>

            {dashboard?.current_streak_days ? (
              <div className="flex items-center space-x-1 text-amber-400 text-xs font-mono" title="Daily Study Streak">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{dashboard.current_streak_days}d</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
};
