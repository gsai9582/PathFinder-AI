import React from 'react';
import {
  Target,
  GitBranch,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Sliders,
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export const FeaturesGrid: React.FC = () => {
  return (
    <div className="space-y-24 py-12 max-w-6xl mx-auto px-4 sm:px-6">
      {/* 1. How It Works Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="default" size="sm">
            HOW IT WORKS
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            From Ambitious Goal to Verified Career Readiness
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A 4-step autonomous pipeline designed to eliminate decision fatigue and optimize study time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="relative p-5 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-white">Stated Goal & NLP Extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Describe your target career in plain English. Our NLP extractor identifies target tracks, timeline constraints, and prior skills.
            </p>
          </Card>

          <Card className="relative p-5 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-white">Skill-Gap & DAG Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates your delta against verified industry role benchmarks and resolves topological prerequisite dependencies with NetworkX.
            </p>
          </Card>

          <Card className="relative p-5 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-white">Explainable Recommendations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every course, project, and tutorial is scored on an 8-factor formula with transparent "Why this?" explanations.
            </p>
          </Card>

          <Card className="relative p-5 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
              04
            </div>
            <h3 className="text-sm font-bold text-white">Adaptive Learning Loop</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quizzes mutate your active roadmap: score &lt;60% triggers remedial revision; score ≥85% accelerates you past intro courses.
            </p>
          </Card>
        </div>
      </section>

      {/* 2. Core Pillars Dual Feature Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Skill Gap Intelligence */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase">
              <Target className="w-4 h-4" />
              <span>Skill Gap Intelligence</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Deterministic Competency Math, Not Vague Suggestions
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PathFinder measures the exact gap between your current proficiency and verified role benchmarks (e.g. AI/ML Engineer vs Data Scientist). Skills are prioritized by weight and prerequisite graph position.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-slate-300">Statistics Competency Gap</span>
              <span className="text-rose-400 font-mono font-bold">-45% Critical Gap</span>
            </div>
            <ProgressBar value={35} max={80} size="sm" variant="warning" />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Current: 35%</span>
              <span>Required Benchmark: 80%</span>
            </div>
          </div>
        </div>

        {/* Adaptive Learning Engine */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase">
              <RefreshCw className="w-4 h-4" />
              <span>Closed-Loop Adaptivity</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Dynamic Roadmap Mutation in Real Time
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Static syllabi waste time on concepts you know and leave you stranded when you struggle. PathFinder mutates your active roadmap after every assessment attempt and difficulty feedback event.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase">Score &lt; 60%</span>
              <h5 className="font-bold text-white text-xs">Remedial Action</h5>
              <p className="text-[11px] text-slate-400">Injects focused revision checkpoint</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Score ≥ 85%</span>
              <h5 className="font-bold text-white text-xs">Fast-Track Unlock</h5>
              <p className="text-[11px] text-slate-400">Bypasses redundant prerequisites</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Explainable AI & Progress Intelligence */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Explainable Recommendations */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase">
              <HelpCircle className="w-4 h-4" />
              <span>Radical Explainability</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              "Why This?" 8-Factor Transparent Rationale
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never wonder why a 40-hour course is recommended. Every item breaks down its match score across Skill Gap (30%), Goal Relevance (20%), Prerequisite State (15%), Difficulty (10%), and Learning Style.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Linear Algebra & Matrix Decompositions</span>
              <span className="text-emerald-400 font-mono font-bold">92% Match</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              "Targeted to close your Mathematics gap (45% $\rightarrow$ 75%) before starting Machine Learning. Fits your 10 hrs/week schedule."
            </p>
          </div>
        </div>

        {/* What-If Simulator & AI Assistant */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase">
              <Sliders className="w-4 h-4" />
              <span>What-If Timeline Simulation</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Instant Simulation of Study Commitment
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Life changes. Slide your weekly study capacity from 10 hours to 5 hours or 20 hours to instantly recalculate your graduation date and pacing feasibility.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500">10 hrs/week</span>
              <p className="text-white font-bold">6.0 Months</p>
            </div>
            <span className="text-slate-600">→</span>
            <div>
              <span className="text-slate-500">5 hrs/week</span>
              <p className="text-amber-400 font-bold">9.2 Months</p>
            </div>
            <span className="text-slate-600">→</span>
            <div>
              <span className="text-slate-500">20 hrs/week</span>
              <p className="text-emerald-400 font-bold">3.5 Months</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why PathFinder Comparison Matrix */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="default" size="sm">
            THE PATHFINDER DIFFERENCE
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Traditional Course Sites Fail Career Changers
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="p-4">Capability</th>
                <th className="p-4 text-slate-500">Traditional Course Sites</th>
                <th className="p-4 text-emerald-400">PathFinder AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="p-4 font-semibold text-white">Curriculum Structure</td>
                <td className="p-4 text-slate-400">Static, linear playlists</td>
                <td className="p-4 text-emerald-400 font-semibold">Prerequisite-aware DAG graph</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Recommendations</td>
                <td className="p-4 text-slate-400">Popularity & sales tags</td>
                <td className="p-4 text-emerald-400 font-semibold">Deterministic skill-gap delta math</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Recommendation Explainability</td>
                <td className="p-4 text-slate-400">Black box ("You might like")</td>
                <td className="p-4 text-emerald-400 font-semibold">8-factor "Why this?" score breakdown</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Handling Failures</td>
                <td className="p-4 text-slate-400">Ignore quiz results</td>
                <td className="p-4 text-emerald-400 font-semibold">Adaptive remedial checkpoint insertion</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Time & Capacity Planning</td>
                <td className="p-4 text-slate-400">Fixed hour estimates</td>
                <td className="p-4 text-emerald-400 font-semibold">Live What-If weekly hour simulator</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Career Readiness</td>
                <td className="p-4 text-slate-400">Generic certificates</td>
                <td className="p-4 text-emerald-400 font-semibold">5-factor objective readiness score</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
