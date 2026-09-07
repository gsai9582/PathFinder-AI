import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLearner } from '../context/LearnerContext';
import { api } from '../services/api';
import { RecommendationItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Star,
  Clock,
  Filter,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Lock,
  ThumbsUp,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Video,
  FileText,
  Code2,
  Award,
  Layers,
  Zap,
  Target
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { profile, openWhyThis, openFeedback } = useLearner();
  const [searchParams, setSearchParams] = useSearchParams();
  const skillParam = searchParams.get('skill_id');

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [diffFilter, setDiffFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Recommended');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Courses', value: 'Courses' },
    { label: 'Videos', value: 'Videos' },
    { label: 'Articles', value: 'Articles' },
    { label: 'Projects', value: 'Projects' },
    { label: 'Practice', value: 'Practice' },
    { label: 'Assessments', value: 'Assessments' }
  ];

  const sortOptions = [
    { label: 'Recommended', value: 'Recommended' },
    { label: 'Shortest', value: 'Shortest' },
    { label: 'Highest Impact', value: 'Highest Impact' },
    { label: 'Beginner Friendly', value: 'Beginner Friendly' }
  ];

  const fetchRecs = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await api.getRecommendations({
        profileId: profile.id,
        skillId: skillParam ? parseInt(skillParam) : undefined,
        resourceType: typeFilter !== 'All' ? typeFilter : undefined,
        difficulty: diffFilter !== 'All' ? diffFilter : undefined,
        searchQuery: searchQuery.trim() || undefined,
        sortBy: sortBy,
        limit: 30
      });
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [profile, typeFilter, diffFilter, sortBy, searchQuery, skillParam]);

  const clearSkillFilter = () => {
    searchParams.delete('skill_id');
    setSearchParams(searchParams);
  };

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('video')) return <Video className="w-3 h-3" />;
    if (t.includes('article') || t.includes('doc')) return <FileText className="w-3 h-3" />;
    if (t.includes('project') || t.includes('practice')) return <Code2 className="w-3 h-3" />;
    if (t.includes('assessment')) return <Award className="w-3 h-3" />;
    return <BookOpen className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Page Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Factor Explainable Recommendation Engine</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Personalized Learning Recommendations
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Every resource is dynamically ranked by PathFinder's 10-factor model weighing your active skill gaps, topological prerequisite readiness, weekly study budget, and learning style.
            </p>
          </div>

          {/* Algorithm Badge */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1 shrink-0">
            <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dynamic Scoring</span>
            </div>
            <p className="text-[11px] text-slate-400">Grounded in verified learner telemetry</p>
          </div>
        </div>

        {/* Active Skill Filter Banner if arrived via Skill Gap page */}
        {skillParam && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
            <div className="flex items-center space-x-2 text-emerald-300">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>
                Filtered by specific skill focus: <strong>Skill #{skillParam}</strong>
              </span>
            </div>
            <button
              onClick={clearSkillFilter}
              className="text-xs text-slate-400 hover:text-white underline font-medium"
            >
              Clear filter & view all
            </button>
          </div>
        )}
      </div>

      {/* Controls & Filtering Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by topic, provider, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center space-x-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort:</span>
            </span>
            <div className="flex items-center space-x-1 overflow-x-auto pb-1">
              {sortOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSortBy(s.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap ${
                    sortBy === s.value
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Format & Difficulty Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          {/* Format Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            <span className="text-slate-500 font-semibold flex items-center space-x-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Format:</span>
            </span>
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${
                  typeFilter === f.value
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Difficulty Tier */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-slate-500 font-semibold">Tier:</span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  diffFilter === d
                    ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">
            Computing 10-factor multi-dimensional recommendation scoring...
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-2">
          <p className="text-sm font-semibold text-white">No learning resources match your current filter criteria.</p>
          <p className="text-slate-500">Try resetting the format filter or searching for a broader skill topic.</p>
          <button
            onClick={() => {
              setTypeFilter('All');
              setDiffFilter('All');
              setSearchQuery('');
              clearSkillFilter();
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendations.map((item) => {
            const res = item.resource;
            const matchScore = item.match_percentage || Math.round(item.recommendation_score);

            return (
              <div
                key={res.id}
                className="p-5 rounded-2xl glass-panel border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Top Badges Bar */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* PathFinder Match Indicator */}
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-black flex items-center space-x-1 shadow-sm shadow-emerald-500/10">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{matchScore}% PathFinder Match</span>
                      </span>
                      <StatusBadge status={item.priority_tier} size="sm" />
                    </div>

                    {/* Skill Tag */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {res.skill_name || 'General'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-emerald-400 flex items-center space-x-1">
                        {getTypeIcon(res.type)}
                        <span>{res.type}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Provider */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      {res.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="font-medium text-slate-300">{res.provider}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-white">{res.rating}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{res.duration_hours}h</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 font-mono text-[11px]">{res.difficulty}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  {/* AI Rationale Snippet */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center space-x-1 text-[10px] uppercase font-mono font-bold text-emerald-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Why this is recommended for you</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {item.explanation}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openWhyThis(res.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors flex items-center space-x-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Why this?</span>
                    </button>

                    <button
                      onClick={() => openFeedback(res.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Rate or provide feedback on this recommendation"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5"
                  >
                    <span>Start Learning</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Methodology Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-[11px]">
            <strong>PathFinder Match</strong> is an algorithmic heuristic calculated from your skill gaps (25%), prerequisite DAG validation (15%), goal importance (15%), difficulty fit (10%), and learning style (10%). Not an external standardized score.
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono shrink-0">
          Updated in real-time
        </span>
      </div>
    </div>
  );
};
