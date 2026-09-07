import React from 'react';
import { Compass, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-300">PATHFINDER</span>
          <span>— Intelligent Career-Learning Navigator</span>
        </div>

        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          <Link to="/skill-gap" className="hover:text-slate-300 transition-colors">Skill-Gap Radar</Link>
          <Link to="/roadmap" className="hover:text-slate-300 transition-colors">Roadmap</Link>
          <Link to="/analytics" className="hover:text-slate-300 transition-colors">Career Readiness</Link>
        </div>

        <p className="text-[11px] text-slate-600">
          Built for Competitive AI Hackathon • 100% Offline-Capable Prototype
        </p>
      </div>
    </footer>
  );
};
