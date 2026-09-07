import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  GitBranch,
  BookOpen,
  CheckSquare,
  RefreshCw,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';

export const HeroSection: React.FC = () => {
  const { loadDemoLearner, isLoading } = useLearner();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    await loadDemoLearner();
    navigate('/dashboard');
  };

  const heroPipelineSteps = [
    { label: 'Career Goal', sub: 'NLP Parsed', icon: Target, active: true },
    { label: 'Skill Analysis', sub: 'Critical Gaps', icon: Compass, active: true },
    { label: 'Personalized Path', sub: 'DAG Topological', icon: GitBranch, active: true },
    { label: 'Learn', sub: 'Curated Matches', icon: BookOpen, active: true },
    { label: 'Assess', sub: 'Diagnostic Quiz', icon: CheckSquare, active: true },
    { label: 'Adapt', sub: 'Real-time Mutate', icon: RefreshCw, active: true },
    { label: 'Career Ready', sub: '85%+ Score', icon: Award, active: true },
  ];

  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[250px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-10 relative">
        {/* Brand Tag Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-sm text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI-Powered Career Learning Platform</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="text-emerald-400">Autonomous Roadmap Engine</span>
        </div>

        {/* Hero Title & Supporting Text */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-emerald-400 font-bold">
              PATHFINDER
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Your goal. Your gaps.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Your personalized path.
              </span>
            </h1>
          </div>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            An AI-powered learning companion that turns career goals into an adaptive roadmap built around your skills, time, and progress.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Button
            onClick={handleDemoClick}
            isLoading={isLoading}
            size="lg"
            variant="default"
            leftIcon={<Zap className="w-4 h-4 text-slate-950 fill-slate-950" />}
            className="w-full sm:w-auto shadow-lg shadow-emerald-500/20"
          >
            <span>Try Demo Learner (Alex — AI/ML)</span>
          </Button>

          <Button
            onClick={() => navigate('/onboarding')}
            size="lg"
            variant="secondary"
            rightIcon={<ArrowRight className="w-4 h-4 text-slate-400" />}
            className="w-full sm:w-auto"
          >
            <span>Build My Path</span>
          </Button>
        </div>

        {/* Visual Hero Roadmap Pipeline */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-xl text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Autonomous Learning Lifecycle
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                CLOSED-LOOP ADAPTIVE SYSTEM
              </span>
            </div>

            {/* Horizontal Step Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {heroPipelineSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="relative p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between space-y-2 group hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">0{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{step.label}</h4>
                      <p className="text-[10px] text-slate-400">{step.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Miniature Interactive Dashboard & Sample Skill Cards Preview */}
        <div className="pt-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 text-left">
          {/* Sample Skill Gap Breakdown */}
          <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Live Competency Mapping</h3>
                <p className="text-xs text-slate-400">Target Role: AI/ML Engineer (Alex Morgan)</p>
              </div>
              <Badge variant="warning" size="sm">
                4 Critical Gaps
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              {/* Python */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">Python Mastery</span>
                  <span className="font-mono text-emerald-400 font-semibold">80% / 85% (Met)</span>
                </div>
                <ProgressBar value={80} max={85} size="sm" variant="success" />
              </div>

              {/* Statistics */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">Applied Statistics</span>
                  <span className="font-mono text-rose-400 font-semibold">35% / 80% (-45% Gap)</span>
                </div>
                <ProgressBar value={35} max={80} size="sm" variant="warning" />
              </div>

              {/* Machine Learning */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">Machine Learning Core</span>
                  <span className="font-mono text-rose-400 font-semibold">20% / 85% (-65% Gap)</span>
                </div>
                <ProgressBar value={20} max={85} size="sm" variant="warning" />
              </div>

              {/* SQL */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">SQL & Relational Models</span>
                  <span className="font-mono text-emerald-400 font-semibold">60% / 70% (In Progress)</span>
                </div>
                <ProgressBar value={60} max={70} size="sm" variant="default" />
              </div>
            </div>
          </div>

          {/* Miniature Readiness Gauge & Next Action */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wide">Career Readiness</span>
                <span className="text-xs font-mono font-bold text-emerald-400">48.5%</span>
              </div>
              <ProgressBar value={48.5} size="md" variant="default" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Based on 5 factors: Technical skills (52%), Projects (35%), Assessments (60%), and Study Consistency (70%).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[10px] uppercase">
                <Zap className="w-3 h-3" />
                <span>Next Best Action:</span>
              </div>
              <h4 className="font-bold text-white text-xs">Applied Statistics Milestone</h4>
              <p className="text-[11px] text-slate-400">Takes 45 mins • Unlocks Machine Learning DAG phase</p>
            </div>

            <Button
              onClick={handleDemoClick}
              size="sm"
              variant="outline"
              className="w-full justify-between"
            >
              <span>Explore Active Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
