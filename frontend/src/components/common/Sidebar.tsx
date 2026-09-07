import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  GitFork,
  BookOpen,
  CheckSquare,
  FolderGit2,
  LineChart,
  Settings,
  Sparkles,
  Award
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export const Sidebar: React.FC = () => {
  const { profile, dashboard } = useLearner();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/skill-gap', label: 'Skill-Gap Radar', icon: Target, badge: dashboard?.career_readiness_score ? `${Math.round(dashboard.career_readiness_score)}%` : undefined },
    { to: '/roadmap', label: 'Adaptive Roadmap', icon: GitFork },
    { to: '/recommendations', label: 'Curated Resources', icon: BookOpen },
    { to: '/assessments', label: 'Skill Assessments', icon: CheckSquare },
    { to: '/projects', label: 'Portfolio Projects', icon: FolderGit2 },
    { to: '/analytics', label: 'Career Readiness', icon: LineChart },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] p-4 hidden md:flex">
      <div className="space-y-6">
        {/* Learner Active Goal Badge */}
        {profile && (
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800/80 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>TARGET CAREER</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {profile.experience_level}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate">
              {profile.career_goal_title || 'AI/ML Engineer'}
            </h4>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>{profile.weekly_hours} hrs/wk</span>
              <span>{profile.target_timeline_months} mo target</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* AI Readiness Card */}
      <div className="p-3.5 rounded-xl glass-panel border-slate-800 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PathFinder AI Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Autonomous prerequisite validation and real-time roadmap adaptation enabled.
        </p>
      </div>
    </aside>
  );
};
