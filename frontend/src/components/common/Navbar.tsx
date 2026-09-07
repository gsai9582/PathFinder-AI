import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Sliders, MessageSquare, User, Zap } from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { profile, loadDemoLearner, toggleChat, toggleWhatIf, isLoading } = useLearner();
  const isLanding = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-emerald-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-black tracking-tight text-white">PATHFINDER</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Intelligent Learning Navigator</p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick Demo Learner Button */}
          <button
            onClick={() => loadDemoLearner()}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold transition-all shadow-sm shadow-emerald-950"
            title="Load realistic demo profile: Alex (AI/ML Engineer)"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Try Demo Learner</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* What-If Simulator Trigger */}
          <button
            onClick={() => toggleWhatIf(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white text-xs font-medium transition-all"
            title="Open What-If Timeline Simulator"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">What-If Simulator</span>
          </button>

          {/* AI Assistant Chat Trigger */}
          <button
            onClick={() => toggleChat(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* User Profile Pill */}
          {!isLanding && profile && (
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {profile.full_name.charAt(0)}
              </div>
              <span className="hidden lg:inline font-medium text-slate-200">{profile.full_name}</span>
            </Link>
          )}

          {isLanding && (
            <Link
              to="/onboarding"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
