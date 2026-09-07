export interface Skill {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  difficulty_tier: string;
}

export interface LearnerSkill {
  id: number;
  skill_id: number;
  skill_name: string;
  category: string;
  current_proficiency: number;
  confidence_score: number;
  last_assessed_at?: string;
}

export interface CareerGoal {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  required_experience_level: string;
  avg_salary: string;
  market_demand: string;
  skills?: Array<{
    skill_id: number;
    skill_name: string;
    required_proficiency: number;
    priority_tier: string;
  }>;
}

export interface LearnerProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  career_goal_id?: number;
  career_goal_title?: string;
  custom_goal_text?: string;
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced';
  weekly_hours: number;
  target_timeline_months: number;
  preferred_learning_style: 'Video' | 'Reading' | 'Hands-on' | 'Project-based' | 'Mixed';
  completed_courses_text?: string;
  interests_text?: string;
  ai_understanding_summary?: string;
  skills: LearnerSkill[];
  created_at: string;
  updated_at: string;
}

export interface SkillGapItem {
  skill_id: number;
  skill_name: string;
  category: string;
  current_proficiency: number;
  required_proficiency: number;
  gap: number;
  gap_percentage: number;
  priority: string;
  status: 'Strong' | 'Developing' | 'Needs Attention' | 'Critical Gap';
  confidence: number;
  prerequisites_met: boolean;
  importance_weight: number;
  source?: string;
  last_assessed_at?: string;
  evidence?: string;
}

export interface RadarDataPoint {
  skill: string;
  current: number;
  required: number;
  full_mark?: number;
}

export interface DependencyGraphNode {
  id: number;
  name: string;
  category: string;
  tier: number;
  current_proficiency: number;
  required_proficiency: number;
  gap: number;
  status: string;
  prerequisites_met: boolean;
}

export interface DependencyGraphEdge {
  source_id: number;
  source_name: string;
  target_id: number;
  target_name: string;
  min_proficiency_required: number;
  is_satisfied: boolean;
}

export interface DependencyGraphData {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}

export interface SkillGapResponse {
  profile_id: number;
  career_goal_title: string;
  overall_gap_score: number;
  gap_reduction_progress: number;
  skills_count: number;
  critical_gaps_count: number;
  needs_attention_count: number;
  developing_skills_count: number;
  strong_skills_count: number;
  radar_data: RadarDataPoint[];
  skill_gaps: SkillGapItem[];
  critical_gaps: SkillGapItem[];
  strong_skills: SkillGapItem[];
  dependency_graph: DependencyGraphData;
  ai_analysis_summary: string;
}

export interface SkillPrerequisiteInfo {
  prerequisite_skill_id: number;
  prerequisite_name: string;
  min_proficiency_required: number;
  current_proficiency: number;
  is_satisfied: boolean;
}

export interface SkillUnlockInfo {
  skill_id: number;
  skill_name: string;
  min_proficiency_required: number;
}

export interface SkillDetailResponse {
  skill_id: number;
  skill_name: string;
  category: string;
  description?: string;
  difficulty_tier: string;
  current_proficiency: number;
  required_proficiency: number;
  gap: number;
  gap_percentage: number;
  priority: string;
  status: string;
  confidence: number;
  source: string;
  last_assessed_at?: string;
  evidence?: string;
  importance_weight: number;
  prerequisites_met: boolean;
  prerequisites: SkillPrerequisiteInfo[];
  unlocks_skills: SkillUnlockInfo[];
  related_resources: Resource[];
  related_projects: Project[];
  assessment_score?: number;
  ai_recommendation: string;
}

export interface Resource {
  id: number;
  title: string;
  type: string;
  provider: string;
  primary_skill_id: number;
  skill_name?: string;
  difficulty: string;
  duration_hours: number;
  rating: number;
  url: string;
  description: string;
  is_free: boolean;
  is_hands_on: boolean;
  project_oriented: boolean;
  learning_style_tag: string;
  quality_score?: number;
  prerequisites_summary?: string;
}

export interface ScoreBreakdown {
  skill_gap_weight: number;
  goal_relevance: number;
  prerequisite_match: number;
  difficulty_match: number;
  learning_style_match: number;
  time_fit: number;
  feedback_signal: number;
  prior_performance: number;
  interest_match?: number;
  completion_history?: number;
}

export interface RecommendationItem {
  resource: Resource;
  recommendation_score: number;
  match_percentage: number;
  priority_tier: 'Top Match' | 'High Priority' | 'Recommended' | 'Optional';
  explanation: string;
  score_breakdown: ScoreBreakdown;
}

export interface RecommendationResponse {
  profile_id: number;
  recommendations: RecommendationItem[];
  total_matches: number;
}

export interface WhyThisResponse {
  resource_id: number;
  resource_title: string;
  learner_goal: string;
  target_skill: string;
  current_proficiency: number;
  required_proficiency: number;
  gap: number;
  prerequisites_status: string;
  learning_style_fit: string;
  estimated_time: string;
  expected_outcome: string;
  score_breakdown?: ScoreBreakdown;
  ai_narrative_explanation: string;
}


export interface RoadmapItem {
  id: number;
  phase_id: number;
  resource_id?: number;
  skill_id?: number;
  skill_name?: string;
  resource_title?: string;
  resource_url?: string;
  resource_provider?: string;
  resource_rating?: number;
  order_index: number;
  title: string;
  objective?: string;
  item_type: 'Learning' | 'Project' | 'Assessment' | 'Practice' | 'Revision';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  estimated_minutes: number;
  status: 'Locked' | 'Available' | 'In Progress' | 'Completed';
  completion_percentage?: number;
  prerequisites_summary?: string;
  prerequisites_met?: boolean;
  assessment_id?: number;
  assessment_title?: string;
  project_id?: number;
  project_title?: string;
  is_remedial: boolean;
  is_delayed?: boolean;
  is_accelerated?: boolean;
  unlocked_at?: string;
  completed_at?: string;
}

export interface RoadmapPhase {
  id: number;
  roadmap_id: number;
  phase_number: number;
  title: string;
  description?: string;
  estimated_hours: number;
  status: 'Locked' | 'Available' | 'In Progress' | 'Completed';
  milestone_name?: string;
  is_remedial: boolean;
  completion_percentage: number;
  skills: string[];
  items: RoadmapItem[];
}

export interface Roadmap {
  id: number;
  profile_id: number;
  career_goal_id: number;
  career_goal_title: string;
  title: string;
  description?: string;
  total_estimated_hours: number;
  status: string;
  is_active: boolean;
  completion_percentage: number;
  phases: RoadmapPhase[];
  created_at: string;
  updated_at: string;
}

export interface AdaptationRequest {
  profile_id: number;
  trigger_type?: 'assessment' | 'feedback' | 'completion' | 'inactivity' | 'manual_simulation';
  skill_id?: number;
  skill_name?: string;
  score?: number;
  difficulty_feedback?: 'Too Hard' | 'Just Right' | 'Too Easy';
  mistakes_identified?: string[];
  days_inactive?: number;
}

export interface RoadmapDiffItem {
  action: 'added' | 'delayed' | 'accelerated' | 'completed' | 'reviewed';
  title: string;
  phase_title: string;
  reason: string;
  badge_color: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
}

export interface AdaptationResponse {
  success: boolean;
  title: string;
  summary: string;
  trigger_type: string;
  score?: number;
  skill_name: string;
  proficiency_change: {
    old_proficiency: number;
    new_proficiency: number;
    confidence_change: string;
  };
  before_state_summary: string;
  after_state_summary: string;
  changes: RoadmapDiffItem[];
  adapted_roadmap: Roadmap;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[];
  points: number;
}

export interface Assessment {
  id: number;
  title: string;
  skill_id: number;
  skill_name: string;
  difficulty: string;
  passing_score: number;
  description?: string;
  questions_count: number;
  questions: Question[];
}

export interface QuestionResult {
  question_id: number;
  question_text: string;
  question_type?: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  points_earned: number;
}

export interface AssessmentResult {
  attempt_id: number;
  assessment_id: number;
  assessment_title: string;
  skill_name: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  previous_proficiency: number;
  new_proficiency: number;
  proficiency_delta: number;
  previous_confidence: number;
  new_confidence: number;
  ai_feedback_advice: string;
  recommended_action: string;
  adaptive_action_taken: string;
  question_results: QuestionResult[];
}

export interface ProjectMilestone {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
}

export interface ProjectPrerequisiteStatus {
  skill_name: string;
  current_proficiency: number;
  required_proficiency: number;
  is_satisfied: boolean;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  primary_skill_id: number;
  skill_name?: string;
  problem_statement: string;
  learning_objectives: string[];
  tech_stack: string[];
  estimated_hours: number;
  expected_outcome: string;
  portfolio_value?: string;
  milestones?: ProjectMilestone[];
  prerequisites?: string[];
  skills_developed?: string[];
  template_repo_url?: string;
}

export interface ProjectRecommendationItem {
  project: Project;
  match_score: number;
  priority_tier: 'Top Recommended' | 'Core Milestone' | 'Advanced Capstone' | string;
  why_this_project: string;
  readiness_status: string;
  prerequisites_met: boolean;
  prerequisites_status: ProjectPrerequisiteStatus[];
  skills_developed: string[];
}

export interface ProjectRecommendationResponse {
  profile_id: number;
  career_goal: string;
  recommendations: ProjectRecommendationItem[];
  total_projects: number;
}

export interface ProjectDetailResponse {
  project: Project;
  why_this_project: string;
  skills_developed: string[];
  estimated_time: string;
  portfolio_value: string;
  prerequisites: ProjectPrerequisiteStatus[];
  milestones: ProjectMilestone[];
  readiness_status: string;
}

export interface ReadinessBreakdown {
  technical_skills: number;
  projects: number;
  assessments: number;
  consistency: number;
  goal_coverage: number;
}

export interface NextBestAction {
  title: string;
  description: string;
  item_type: string;
  estimated_minutes: number;
  skill_name: string;
  resource_id?: number;
  phase_title?: string;
  action_url?: string;
}

export interface DashboardData {
  profile_id: number;
  full_name: string;
  career_goal: string;
  experience_level: string;
  overall_progress_percentage: number;
  career_readiness_score: number;
  readiness_breakdown: ReadinessBreakdown;
  how_to_increase_readiness: string;
  total_learning_hours: number;
  completed_items_count: number;
  total_items_count: number;
  current_streak_days: number;
  current_phase_title: string;
  next_best_action: NextBestAction;
  recent_insights: Array<{
    id: number;
    type: string;
    message: string;
    importance: string;
  }>;
  skill_growth_timeline: Array<Record<string, any>>;
}

export interface ChatCitation {
  title: string;
  url?: string;
  resource_type: string;
  skill_name?: string;
}

export interface ChatActionLink {
  label: string;
  action_type: string;
  target_url: string;
  params?: Record<string, any>;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  context_action?: string;
  timestamp: string;
  suggested_quick_prompts?: string[];
  citations?: ChatCitation[];
  action_links?: ChatActionLink[];
  is_fallback?: boolean;
}

export interface ChatHistoryResponse {
  profile_id: number;
  messages: ChatMessage[];
}

export interface WhatIfResponse {
  current_weekly_hours: number;
  current_estimated_months: number;
  current_weekly_tasks: number;
  current_project_count: number;
  current_skill_coverage: number;
  current_completion_date: string;
  simulated_weekly_hours: number;
  simulated_estimated_months: number;
  simulated_weekly_tasks: number;
  simulated_project_count: number;
  simulated_skill_coverage: number;
  simulated_completion_date: string;
  timeline_difference_months: number;
  feasibility_status: string;
  weekly_pacing_advice: string;
  phase_timeline_comparisons: Array<{
    phase_number: number;
    title: string;
    estimated_hours: number;
    current_weeks: number;
    simulated_weeks: number;
    difference_weeks: number;
  }>;
  recommended_adjustments: string[];
}

export interface SkillMomentumItem {
  skill_id: number;
  skill_name: string;
  current_proficiency: number;
  previous_proficiency: number;
  trend_delta: number;
  trend_direction: 'up' | 'down' | 'neutral';
  trend_display: string;
  velocity_label: string;
  last_calibrated: string;
}

export interface SkillMomentumResponse {
  profile_id: number;
  overall_momentum_label: string;
  average_growth_delta: number;
  skills: SkillMomentumItem[];
}

export interface LearningVelocityResponse {
  profile_id: number;
  completed_hours: number;
  planned_hours: number;
  velocity_ratio: number;
  status: 'Ahead' | 'On Track' | 'Behind';
  status_label: string;
  weekly_target_hours: number;
  hours_logged_this_week: number;
  pace_summary: string;
}

export interface SmartStreakItem {
  id: number;
  activity_type: string;
  title: string;
  skill_name: string;
  timestamp: string;
  impact_points: number;
}

export interface SmartStreakResponse {
  profile_id: number;
  current_streak_days: number;
  longest_streak_days: number;
  is_streak_active_today: boolean;
  meaningful_activities_count: number;
  recent_milestones: SmartStreakItem[];
  streak_multiplier: number;
}

export interface GoalGapItem {
  skill_name: string;
  current: number;
  required: number;
  gap: number;
  priority: string;
}

export interface GoalDistanceResponse {
  profile_id: number;
  career_goal: string;
  readiness_percentage: number;
  demonstrated_competencies_percentage: number;
  total_required_skills: number;
  mastered_skills_count: number;
  in_progress_skills_count: number;
  remaining_gaps_count: number;
  remaining_gaps: GoalGapItem[];
  estimated_weeks_to_goal: number;
  readiness_trajectory: string;
}

export interface RoadmapChangelogEntry {
  id: number;
  date_str: string;
  event_type: string;
  title: string;
  description: string;
  badge_color: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  icon_type: 'spark' | 'zap' | 'book' | 'award' | 'arrow';
}

export interface RoadmapChangelogResponse {
  profile_id: number;
  total_adaptations: number;
  changelog: RoadmapChangelogEntry[];
}

export interface DailyPlanItem {
  id: number;
  order: number;
  duration_minutes: number;
  title: string;
  category: string;
  skill_name: string;
  description: string;
  is_completed: boolean;
  action_url: string;
}

export interface DailyPlanResponse {
  profile_id: number;
  date_formatted: string;
  total_minutes: number;
  completed_minutes: number;
  items: DailyPlanItem[];
  focus_quote: string;
}

export interface AchievementItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon_name: string;
  is_unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  max_progress: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface AchievementResponse {
  profile_id: number;
  unlocked_count: number;
  total_count: number;
  achievements: AchievementItem[];
}

export interface ComparisonSkillItem {
  skill_name: string;
  current_proficiency: number;
  current_goal_required?: number;
  target_goal_required: number;
  status: string;
}

export interface CareerGoalComparisonResponse {
  profile_id: number;
  current_goal_title: string;
  target_goal_title: string;
  skill_overlap_percentage: number;
  shared_competencies_count: number;
  additional_gaps_count: number;
  estimated_additional_weeks: number;
  shared_skills: ComparisonSkillItem[];
  additional_skills: ComparisonSkillItem[];
  transition_feasibility: string;
  ai_transition_advice: string;
}

