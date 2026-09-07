import React, { useRef } from 'react';
import {
  X, Printer, Download, Share2, Compass, CheckCircle2, Award,
  Sparkles, Layers, BookOpen, Target, Calendar
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export const ExportPathModal: React.FC = () => {
  const { isExportPathOpen, toggleExportPath, profile, dashboard } = useLearner();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isExportPathOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in print:p-0 print:bg-white print:static print:z-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Toolbar (hidden on print) */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Export & Print Personalized Path</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={() => toggleExportPath(false)}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printAreaRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950 print:bg-white print:text-slate-900 text-slate-100">
          {/* Document Header */}
          <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Compass className="w-6 h-6 text-emerald-500" />
                <span className="text-lg font-black tracking-tight uppercase">PathFinder AI</span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600">Personalized Learning Roadmap & Career Readiness Audit</p>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-slate-600 space-y-0.5">
              <p>Generated for: <strong className="text-white print:text-black">{profile?.full_name || 'Alex Morgan'}</strong></p>
              <p>Target Career Goal: <strong className="text-emerald-400 print:text-emerald-700">{profile?.career_goal_title || 'AI/ML Engineer'}</strong></p>
              <p>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Executive Career Readiness Snapshot */}
          <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <div className="text-center border-r border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Career Readiness</span>
              <p className="text-3xl font-black text-emerald-400 print:text-emerald-600 mt-1">
                {Math.round(dashboard?.career_readiness_score || 72)}%
              </p>
              <span className="text-[10px] text-slate-400 print:text-slate-600">Demonstrated Competency</span>
            </div>

            <div className="text-center border-r border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Pacing & Hours</span>
              <p className="text-3xl font-black text-white print:text-slate-900 mt-1">
                {profile?.weekly_hours || 10}h / wk
              </p>
              <span className="text-[10px] text-slate-400 print:text-slate-600">Target: {profile?.target_timeline_months || 6} Months</span>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Curriculum Progress</span>
              <p className="text-3xl font-black text-cyan-400 print:text-cyan-700 mt-1">
                {Math.round(dashboard?.overall_progress_percentage || 45)}%
              </p>
              <span className="text-[10px] text-slate-400 print:text-slate-600">Roadmap Completion</span>
            </div>
          </div>

          {/* Phase Roadmap Overview */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              Personalized Multi-Phase Roadmap
            </h4>
            <div className="space-y-2.5 text-xs">
              {[
                { num: 1, title: 'Foundations & Mathematical Tooling', status: 'Completed', hours: '20h', skills: 'Python, Git, Linear Algebra' },
                { num: 2, title: 'Statistics, Hypothesis Testing & Data Analysis', status: 'Completed', hours: '35h', skills: 'Inferential Stats, Pandas, SQL' },
                { num: 3, title: 'Machine Learning Algorithms & Optimization', status: 'In Progress (Active)', hours: '45h', skills: 'Decision Trees, XGBoost, Scikit-Learn' },
                { num: 4, title: 'Deep Learning & Neural Architectures', status: 'Upcoming', hours: '50h', skills: 'PyTorch, CNNs, Transformers' },
                { num: 5, title: 'MLOps, Deployment & Production Pipelines', status: 'Upcoming', hours: '40h', skills: 'Docker, FastAPI, Drift Monitoring' },
                { num: 6, title: 'Industry Portfolio Capstone & Review', status: 'Upcoming', hours: '30h', skills: 'End-to-End System Design' }
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/60 print:bg-white border border-slate-800 print:border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {p.num}
                    </span>
                    <div>
                      <h5 className="font-bold text-white print:text-black">{p.title}</h5>
                      <span className="text-[10px] text-slate-400 print:text-slate-600">Target Skills: {p.skills}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 print:bg-slate-100 text-slate-300 print:text-slate-800">
                      {p.status}
                    </span>
                    <p className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">{p.hours}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Portfolio Capstones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              Verified Portfolio Capstones
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 print:bg-white border border-slate-800 print:border-slate-200">
                <h5 className="font-bold text-white print:text-black">Customer Churn Prediction & Explainability</h5>
                <p className="text-[11px] text-slate-400 print:text-slate-600 mt-1">XGBoost, SHAP Interpretability, Dockerized FastAPI</p>
                <span className="text-[9px] font-bold text-emerald-400 print:text-emerald-700 mt-2 block">High Portfolio Impact</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 print:bg-white border border-slate-800 print:border-slate-200">
                <h5 className="font-bold text-white print:text-black">Production RAG Document Assistant</h5>
                <p className="text-[11px] text-slate-400 print:text-slate-600 mt-1">LangChain, Chroma Vector Index, Hugging Face</p>
                <span className="text-[9px] font-bold text-purple-400 print:text-purple-700 mt-2 block">Cutting-Edge GenAI Piece</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-[10px] text-slate-500 print:text-slate-600">
            <span>PathFinder AI Certification & Learning Architecture Engine</span>
            <span>https://pathfinder.ai</span>
          </div>
        </div>
      </div>
    </div>
  );
};
