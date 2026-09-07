import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  Sliders,
  User,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Calendar,
  Zap,
  Trophy,
  GitCompare,
  Printer
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { Dropdown } from '../ui/Dropdown';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const TopNav: React.FC<{ onMobileMenuToggle?: () => void }> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    profile,
    dashboard,
    toggleChat,
    toggleWhatIf,
    toggleDailyPlan,
    toggleFocusMode,
    toggleCareerCompare,
    toggleExportPath,
    toggleAchievements,
    toggleCommandPalette,
    isDemoMode,
    loadDemoLearner,
    resetToNewLearner
  } = useLearner();

  const getPageTitle = (pathname: string): { title: string; category: string } => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Overview & Performance', category: 'Dashboard' };
      case '/roadmap':
        return { title: 'Interactive Learning Roadmap', category: 'Curriculum' };
      case '/skill-gap':
        return { title: 'Skill-Gap Radar & Diagnostics', category: 'Analysis' };
      case '/recommendations':
        return { title: 'Personalized Learning Matches', category: 'Recommendations' };
      case '/assessments':
        return { title: 'Diagnostic Assessments & Test-Out', category: 'Verification' };
      case '/projects':
        return { title: 'Portfolio Capstone Projects', category: 'Milestones' };
      case '/analytics':
        return { title: 'Career Readiness Dashboard', category: 'Analytics' };
      case '/onboarding':
        return { title: 'Goal Calibration Wizard', category: 'Setup' };
      default:
        return { title: 'PathFinder AI', category: 'Navigation' };
    }
  };

  const pageInfo = getPageTitle(location.pathname);

  // Notification items generated from live AI insights
  const notificationItems = dashboard?.recent_insights?.slice(0, 3).map((ins) => ({
    id: `insight-${ins.id}`,
    label: ins.message.slice(0, 55) + '...',
    icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
    badge: ins.type,
    onClick: () => navigate('/dashboard')
  })) || [
    {
      id: 'welcome',
      label: 'Welcome to PathFinder Career Navigator',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      onClick: () => navigate('/dashboard')
    }
  ];

  const profileMenuItems = [
    {
      id: 'profile',
      label: profile ? profile.full_name : 'Learner Profile',
      icon: <User className="w-3.5 h-3.5" />,
      onClick: () => navigate('/dashboard')
    },
    {
      id: 'achievements',
      label: 'Milestone Achievements',
      icon: <Trophy className="w-3.5 h-3.5" />,
      onClick: () => toggleAchievements(true)
    },
    {
      id: 'export-path',
      label: 'Export My Path (PDF)',
      icon: <Printer className="w-3.5 h-3.5" />,
      onClick: () => toggleExportPath(true)
    },
    {
      id: 'goals',
      label: 'Recalibrate Goals',
      icon: <Sliders className="w-3.5 h-3.5" />,
      onClick: () => navigate('/onboarding')
    },
    { separator: true as const },
    {
      id: 'demo-toggle',
      label: isDemoMode ? 'Exit Demo Learner' : 'Load Demo (Alex Morgan)',
      onClick: isDemoMode ? resetToNewLearner : loadDemoLearner
    }
  ];

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
              {pageInfo.category}
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[160px] sm:max-w-xs">
              {pageInfo.title}
            </h2>
          </div>
        </div>

        {/* Demo Mode Pill Indicator */}
        {isDemoMode && (
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Demo Learner</span>
            <span className="sm:hidden">Demo</span>
          </div>
        )}
      </div>

      {/* Right: Search, Actions, Notifications & Profile */}
      <div className="flex items-center space-x-2">
        {/* Global Search & Command Center Trigger (Desktop) */}
        <button
          onClick={() => toggleCommandPalette(true)}
          className="hidden md:flex items-center space-x-2.5 h-8 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span>Search or type a command...</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Ctrl+K
          </span>
        </button>

        {/* Daily Plan Trigger */}
        <button
          onClick={() => toggleDailyPlan(true)}
          className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
          title="Open Today's 2-Hour Daily Learning Plan"
        >
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold">Daily Plan</span>
        </button>

        {/* Focus Mode Trigger */}
        <button
          onClick={() => toggleFocusMode(true)}
          className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-emerald-300 transition-colors"
          title="Enter Distraction-Free Focus Mode"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold">Focus Mode</span>
        </button>

        {/* What-If Simulation Trigger */}
        <button
          onClick={() => toggleWhatIf(true)}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          title="Simulate Weekly Hours Impact"
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium">Simulate Path</span>
        </button>

        {/* AI Assistant Quick Trigger Button */}
        <Button
          onClick={() => toggleChat(true)}
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
          className="hidden sm:inline-flex border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-200"
        >
          <span>Ask AI</span>
        </Button>

        {/* Notifications Dropdown */}
        <Dropdown
          trigger={
            <div className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors">
              <Bell className="w-4 h-4" />
              {dashboard?.recent_insights?.length ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              ) : null}
            </div>
          }
          items={notificationItems}
        />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Menu Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center space-x-2 pl-1 cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-bold">
                {profile ? profile.full_name.charAt(0) : 'L'}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
          }
          items={profileMenuItems}
        />
      </div>
    </header>
  );
};
