import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Project, ProjectRecommendationItem, ProjectDetailResponse } from '../types';
import { useLearner } from '../context/LearnerContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProjectDetailDrawer } from '../components/projects/ProjectDetailDrawer';
import {
  FolderGit2,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Award,
  ChevronRight,
  Filter,
  Search,
  ShieldCheck,
  Code2,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useLearner();
  const [recommendations, setRecommendations] = useState<ProjectRecommendationItem[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDetail, setActiveDetail] = useState<ProjectDetailResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [profile?.id, selectedDifficulty]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recsRes, projectsList] = await Promise.all([
        api.getProjectRecommendations(profile?.id),
        api.getProjects({ difficulty: selectedDifficulty })
      ]);
      setRecommendations(recsRes.recommendations || []);
      setAllProjects(projectsList || []);
    } catch (err) {
      console.error('Failed to load project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (projectId: number) => {
    try {
      const detail = await api.getProjectDetail(projectId, profile?.id);
      setActiveDetail(detail);
      setDrawerOpen(true);
    } catch (err) {
      console.error('Failed to fetch project detail:', err);
    }
  };

  const filteredProjects = allProjects.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.skill_name && p.skill_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-3 relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4" />
            <span>Capstone Portfolio Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Personalized Milestone Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hands-on projects validate conceptual mastery and bridge practical skill gaps. Completing verified portfolio projects drives <strong className="text-emerald-400 font-semibold">25% of your Career Readiness Score</strong>.
          </p>
        </div>
      </div>

      {/* Top Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Recommended Capstones for {profile?.career_goal_title || 'Your Goal'}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Ranked by Gap Urgency & Prerequisite Fit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.project.id}
                onClick={() => handleOpenDetail(rec.project.id)}
                className="glass-panel rounded-2xl p-5 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-lg hover:shadow-emerald-950/20 group relative overflow-hidden"
              >
                {/* Top Badge Banner */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      {rec.priority_tier}
                    </span>
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold font-mono">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{Math.round(rec.match_score)}% Match</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      {rec.project.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1.5 text-[11px]">
                      <span className="text-slate-400">{rec.project.skill_name}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-mono">{rec.project.estimated_hours}h</span>
                    </div>
                  </div>

                  {/* Why this explanation snippet */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    💡 {rec.why_this_project}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    rec.prerequisites_met ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {rec.readiness_status}
                  </span>

                  <button className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1 font-bold text-xs">
                    <span>View Project</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedDifficulty === diff
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or skills..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Fetching Milestone Projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-800">
          No projects matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5 shadow-lg group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">{proj.skill_name}</span>
                  <StatusBadge status={proj.difficulty} size="sm" />
                </div>

                <div>
                  <h3
                    onClick={() => handleOpenDetail(proj.id)}
                    className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {proj.problem_statement}
                  </p>
                </div>

                {/* Portfolio Value */}
                {proj.portfolio_value && (
                  <div className="flex items-center space-x-1.5 text-xs text-purple-300">
                    <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-[11px] font-medium">{proj.portfolio_value}</span>
                  </div>
                )}

                {/* Tech Stack Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Tech Stack:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tech_stack.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Objectives Preview */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Key Deliverables:</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {proj.learning_objectives.slice(0, 2).map((obj, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{proj.estimated_hours}h</span>
                </span>

                <div className="flex items-center space-x-2">
                  {proj.template_repo_url && (
                    <a
                      href={proj.template_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Starter Repo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenDetail(proj.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center space-x-1"
                  >
                    <span>Details & Milestones</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Drawer */}
      <ProjectDetailDrawer
        detail={activeDetail}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAddToRoadmap={() => navigate('/roadmap')}
      />
    </div>
  );
};
