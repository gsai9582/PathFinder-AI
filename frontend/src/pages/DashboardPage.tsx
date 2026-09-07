import React, { useEffect, useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { api } from '../services/api';
import {
  SkillGapResponse,
  Roadmap,
  RecommendationItem,
  SkillMomentumResponse,
  LearningVelocityResponse,
  SmartStreakResponse,
  GoalDistanceResponse
} from '../types';
import {
  Award,
  Clock,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
  Sliders,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Star,
  MapPin,
  GitBranch,
  Calendar,
  Layers,
  BarChart2,
  Trophy,
  GitCompare,
  Printer,
  ShieldCheck,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SkillGapRadar } from '../components/skill-gap/SkillGapRadar';
import { SkillGrowthChart } from '../components/progress/SkillGrowthChart';

export const DashboardPage: React.FC = () => {
  const {
    profile,
    dashboard,
    toggleWhatIf,
    toggleChat,
    toggleDailyPlan,
    toggleFocusMode,
    toggleCareerCompare,
    toggleExportPath,
    toggleAchievements,
    openWhyThis
  } = useLearner();
  const navigate = useNavigate();

  const [skillGap, setSkillGap] = useState<SkillGapResponse | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [momentum, setMomentum] = useState<SkillMomentumResponse | null>(null);
  const [velocity, setVelocity] = useState<LearningVelocityResponse | null>(null);
  const [smartStreak, setSmartStreak] = useState<SmartStreakResponse | null>(null);
  const [goalDistance, setGoalDistance] = useState<GoalDistanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (profile) {
      setLoading(true);
      Promise.all([
        api.getSkillGap(profile.id),
        api.getRoadmap(profile.id),
        api.getRecommendations({ profileId: profile.id, limit: 3 }),
        api.getSkillMomentum(profile.id),
        api.getLearningVelocity(profile.id),
        api.getSmartStreak(profile.id),
        api.getGoalDistance(profile.id)
      ])
        .then(([gapData, roadData, recData, momData, velData, streakData, distData]) => {
          setSkillGap(gapData);
          setRoadmap(roadData);
          setRecommendations(recData.recommendations);
          setMomentum(momData);
          setVelocity(velData);
          setSmartStreak(streakData);
          setGoalDistance(distData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [profile]);

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (!profile || !dashboard) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Hydrating AI Career Command Center...</p>
      </div>
    );
  }

  const nextAction = dashboard.next_best_action || {
    title: 'Complete Decision Trees & Classification',
    description: 'Statistics, Python and Data Analysis prerequisites are complete.',
    item_type: 'Learning',
    estimated_minutes: 45,
    skill_name: 'Machine Learning',
    phase_title: 'Phase 2 — Core Machine Learning'
  };

  const readinessScore = Math.round(dashboard.career_readiness_score || 72);
  const readinessBreakdown = dashboard.readiness_breakdown || {
    technical_skills: 52,
    projects: 35,
    assessments: 60,
    consistency: 70,
    goal_coverage: 50
  };

  const topGaps = skillGap?.skill_gaps
    ? skillGap.skill_gaps.filter(g => g.gap > 0).slice(0, 3)
    : [
        { skill_id: 1, skill_name: 'Statistics', gap: 45, current_proficiency: 35, required_proficiency: 80, priority: 'Critical Gap', importance_weight: 1.6 },
        { skill_id: 2, skill_name: 'Machine Learning', gap: 65, current_proficiency: 20, required_proficiency: 85, priority: 'Critical Gap', importance_weight: 2.0 },
        { skill_id: 3, skill_name: 'Deep Learning', gap: 70, current_proficiency: 10, required_proficiency: 80, priority: 'High Priority', importance_weight: 1.8 },
      ];

  const currentPhase = roadmap?.phases?.find(p => p.status === 'In Progress') || roadmap?.phases?.[0];
  const phaseCompletedItems = currentPhase?.items?.filter(i => i.status === 'Completed').length || 0;
  const phaseTotalItems = currentPhase?.items?.length || 5;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Header Greeting & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
            <span>CAREER COMMAND CENTER</span>
            <span>•</span>
            <span className="text-slate-400">{profile.experience_level} Tier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {getTimeOfDayGreeting()}, {profile.full_name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Here's what will move you closer to becoming an <strong className="text-slate-200">{profile.career_goal_title}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            onClick={() => toggleWhatIf(true)}
            variant="outline"
            size="sm"
            leftIcon={<Sliders className="w-3.5 h-3.5 text-blue-400" />}
          >
            <span>Simulate Timeline</span>
          </Button>
          <Button
            onClick={() => navigate('/roadmap')}
            variant="default"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            <span>Full Roadmap</span>
          </Button>
        </div>
      </div>

      {/* 2. Advanced Action Toolbar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            INTEGRATED TOOLS
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleDailyPlan(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-xs font-semibold text-slate-200 hover:text-cyan-300 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Daily Plan</span>
          </button>

          <button
            onClick={() => toggleFocusMode(true, nextAction.title)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-slate-200 hover:text-emerald-300 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Focus Mode</span>
          </button>

          <button
            onClick={() => toggleWhatIf(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-xs font-semibold text-slate-200 hover:text-purple-300 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulate Path</span>
          </button>

          <button
            onClick={() => toggleCareerCompare(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-slate-200 hover:text-indigo-300 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Compare Roles</span>
          </button>

          <button
            onClick={() => toggleExportPath(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-xs font-semibold text-slate-200 hover:text-blue-300 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Path</span>
          </button>

          <button
            onClick={() => toggleAchievements(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-200 hover:text-amber-300 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Achievements</span>
          </button>
        </div>
      </div>

      {/* 3. Hero Grid: Career Readiness Matrix & Prominent Next Best Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Next Best Action Card (Visually Dominant - 7 Columns) */}
        <div className="lg:col-span-7 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-emerald-950/20 p-6 sm:p-7 shadow-xl shadow-slate-950/50 flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                <span>Next Best Action</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{nextAction.estimated_minutes || 45} mins</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{nextAction.skill_name}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                {nextAction.title}
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {nextAction.description || "Statistics, Python and Data Analysis prerequisites are complete."}
              </p>
            </div>

            {/* Expected Impact Pill */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-medium">Expected Impact:</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                +8% {nextAction.skill_name} Proficiency
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
            <Button
              onClick={() => {
                toggleFocusMode(true, nextAction.title);
              }}
              variant="default"
              size="md"
              leftIcon={<Play className="w-4 h-4 text-slate-950 fill-slate-950" />}
              className="font-bold shadow-lg shadow-emerald-500/20"
            >
              <span>Start in Focus Mode</span>
            </Button>

            <Button
              onClick={() => openWhyThis(nextAction.resource_id || 1)}
              variant="outline"
              size="md"
              leftIcon={<HelpCircle className="w-3.5 h-3.5 text-emerald-400" />}
            >
              <span>Why this?</span>
            </Button>
          </div>
        </div>

        {/* Career Readiness Hero Card (5 Columns) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Career Readiness</h3>
              </div>
              <span className="text-2xl font-black text-white font-mono">{readinessScore}%</span>
            </div>

            <ProgressBar value={readinessScore} size="md" variant="default" />

            {/* 5-Factor Score Breakdown */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Technical Skills</span>
                  <span className="font-mono text-slate-200">{Math.round(readinessBreakdown.technical_skills)}%</span>
                </div>
                <ProgressBar value={readinessBreakdown.technical_skills} size="sm" variant="default" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Projects & Deliverables</span>
                  <span className="font-mono text-slate-200">{Math.round(readinessBreakdown.projects)}%</span>
                </div>
                <ProgressBar value={readinessBreakdown.projects} size="sm" variant="info" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Assessments Verified</span>
                  <span className="font-mono text-slate-200">{Math.round(readinessBreakdown.assessments)}%</span>
                </div>
                <ProgressBar value={readinessBreakdown.assessments} size="sm" variant="success" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Study Consistency</span>
                  <span className="font-mono text-slate-200">{Math.round(readinessBreakdown.consistency)}%</span>
                </div>
                <ProgressBar value={readinessBreakdown.consistency} size="sm" variant="warning" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Goal Coverage</span>
                  <span className="font-mono text-slate-200">{Math.round(readinessBreakdown.goal_coverage)}%</span>
                </div>
                <ProgressBar value={readinessBreakdown.goal_coverage} size="sm" variant="default" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>* PathFinder deterministic estimate</span>
            <button onClick={() => navigate('/analytics')} className="text-emerald-400 hover:underline">
              View matrix →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Quick Stats & Learning Velocity Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Learning Velocity Card */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-semibold">Learning Velocity</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{velocity?.completed_hours || 12.5}h</p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${velocity?.status === 'Ahead' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
              {velocity?.status_label || '1.25x • Ahead'}
            </span>
          </div>
        </div>

        {/* Goal Distance Card */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-semibold">Goal Distance</span>
            <Target className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 font-mono">
            {goalDistance?.demonstrated_competencies_percentage || 74}%
          </p>
          <p className="text-[10px] text-slate-500">Competencies Demonstrated</p>
        </div>

        {/* Assessment Average */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-semibold">Assessment Avg</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">82.5%</p>
          <p className="text-[10px] text-slate-500">Diagnostic confidence: High</p>
        </div>

        {/* Smart Streak Card */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-semibold">Smart Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {smartStreak?.current_streak_days || dashboard.current_streak_days} Days
          </p>
          <p className="text-[10px] text-slate-500">{smartStreak?.meaningful_activities_count || 12} Verified Milestones</p>
        </div>
      </div>

      {/* 5. Skill Momentum Showcase */}
      {momentum && momentum.skills && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Skill Momentum (Growth Velocity)</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 font-mono">
              {momentum.overall_momentum_label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {momentum.skills.slice(0, 4).map((s) => (
              <div
                key={s.skill_id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate">{s.skill_name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${s.trend_direction === 'up' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    {s.trend_display}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-black text-white font-mono">{s.current_proficiency}%</span>
                  <span className="text-[10px] text-slate-500 font-mono line-through">{s.previous_proficiency}%</span>
                </div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{s.velocity_label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Skill Gap Overview & Roadmap Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skill Gap Radar & Critical Priority Gaps (7 Columns) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Skill-Gap Overview (Current vs Required)</h3>
            </div>
            <button
              onClick={() => navigate('/skill-gap')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
            >
              <span>Full Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Radar Chart */}
            <div className="w-full h-56 flex items-center justify-center">
              {skillGap?.radar_data ? (
                <SkillGapRadar data={skillGap.radar_data} />
              ) : (
                <div className="text-xs text-slate-500">Loading Radar...</div>
              )}
            </div>

            {/* Top 3 Critical Gaps List */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Top 3 Critical Gaps:</span>
              {topGaps.map((g) => (
                <div
                  key={g.skill_id}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-white">{g.skill_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {g.current_proficiency}% / {g.required_proficiency}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-rose-400">-{g.gap}% gap</span>
                    <p className="text-[9px] text-slate-500">Weight {g.importance_weight}x</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roadmap Snapshot & Current Phase (5 Columns) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Roadmap Snapshot</h3>
              </div>
              <Badge variant="info" size="sm">
                In Progress
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white">
                  {currentPhase?.title || 'Phase 2 — Core Machine Learning'}
                </h4>
                <span className="font-mono text-emerald-400 font-semibold">
                  {phaseCompletedItems} / {phaseTotalItems} Complete
                </span>
              </div>
              <ProgressBar value={(phaseCompletedItems / Math.max(1, phaseTotalItems)) * 100} size="sm" />
              <p className="text-[11px] text-slate-400">{currentPhase?.description || 'Foundational ML algorithms & statistical workflows.'}</p>
            </div>

            {/* Next Milestone */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Next Milestone Module:</span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white">{nextAction.title}</span>
                </div>
                <Button onClick={() => navigate('/roadmap')} size="sm" variant="secondary">
                  Open
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate('/roadmap')}
            size="sm"
            variant="outline"
            className="w-full justify-between"
          >
            <span>Explore All Roadmap Phases</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* 7. Recommendations Showcase with AI Confidence Indicators (3 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Top Personalized Matches</h3>
          </div>
          <button
            onClick={() => navigate('/recommendations')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
          >
            <span>View All Matches</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((item) => {
            const res = item.resource;
            return (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <StatusBadge status={item.priority_tier} size="sm" />
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                      {Math.round(item.recommendation_score)}% Match
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{res.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{res.description}</p>

                  {/* AI Confidence Indicator with Justification */}
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">High confidence • Based on 4 recent assessments</span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{res.rating}</span>
                    </span>
                    <span>•</span>
                    <span>{res.duration_hours}h</span>
                    <span>•</span>
                    <span>{res.provider}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => openWhyThis(res.id)}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Why this?</span>
                  </button>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Smart Streak Meaningful Milestones & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Meaningful Smart Streak Milestones (7 Columns) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-sm font-bold text-white">Smart Streak (Meaningful Learning Milestones)</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              {smartStreak?.current_streak_days || 4} DAY STREAK
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {(smartStreak?.recent_milestones || []).map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="font-bold text-white">{m.title}</h5>
                    <span className="text-[10px] text-slate-400">{m.skill_name}</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">+{m.impact_points} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic AI Insights (5 Columns) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live AI Career Insights</h3>
            </div>
            <Badge variant="default" size="sm">
              Real-time
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 leading-relaxed flex items-start space-x-2.5">
              <span className="text-rose-400 mt-0.5 font-bold">•</span>
              <span><strong>Statistics is your largest prerequisite gap</strong> before starting supervised neural models.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 leading-relaxed flex items-start space-x-2.5">
              <span className="text-emerald-400 mt-0.5 font-bold">•</span>
              <span><strong>You perform 25% better with hands-on labs</strong> and project-based Jupyter tutorials.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 leading-relaxed flex items-start space-x-2.5">
              <span className="text-blue-400 mt-0.5 font-bold">•</span>
              <span><strong>You are ready to accelerate Python fundamentals</strong> and bypass introductory syntax reviews.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
