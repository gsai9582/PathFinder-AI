from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Common & User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Skill Schemas ---
class SkillBase(BaseModel):
    name: str
    slug: str
    category: str = "Technical"
    description: Optional[str] = None
    difficulty_tier: str = "Intermediate"

class SkillRead(SkillBase):
    id: int
    class Config:
        from_attributes = True

class LearnerSkillCreate(BaseModel):
    skill_id: int
    current_proficiency: float = Field(..., ge=0.0, le=100.0)
    confidence_score: float = Field(0.5, ge=0.0, le=1.0)
    source: str = "self_reported"

class LearnerSkillRead(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    category: str
    current_proficiency: float
    confidence_score: float
    source: Optional[str] = "self_reported"
    evidence: Optional[str] = None
    last_assessed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Career Goal Schemas ---
class CareerGoalRead(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    category: str
    required_experience_level: str
    avg_salary: str
    market_demand: str
    skills: Optional[List[Dict[str, Any]]] = None
    class Config:
        from_attributes = True

# --- NLP Goal Analysis Schemas ---
class GoalAnalyzeRequest(BaseModel):
    text: str

class ExtractedGoalInfo(BaseModel):
    career_goal: str
    career_goal_id: Optional[int] = None
    experience_level: str
    target_timeline_months: int
    extracted_skills: List[str]
    weak_areas: List[str]
    preferred_learning_style: str
    weekly_hours: int
    ai_summary: str
    confidence: float

# --- Learner Profile Schemas ---
class LearnerProfileCreate(BaseModel):
    email: str = "alex.learner@example.com"
    full_name: str = "Alex Morgan"
    career_goal_id: Optional[int] = None
    custom_goal_text: Optional[str] = None
    experience_level: str = "Intermediate"
    weekly_hours: int = 10
    target_timeline_months: int = 6
    preferred_learning_style: str = "Mixed"
    completed_courses_text: Optional[str] = None
    interests_text: Optional[str] = None
    skills: List[Dict[str, Any]] = []

class LearnerProfileUpdate(BaseModel):
    career_goal_id: Optional[int] = None
    custom_goal_text: Optional[str] = None
    experience_level: Optional[str] = None
    weekly_hours: Optional[int] = None
    target_timeline_months: Optional[int] = None
    preferred_learning_style: Optional[str] = None
    completed_courses_text: Optional[str] = None
    interests_text: Optional[str] = None
    skills: Optional[List[Dict[str, Any]]] = None

class LearnerProfileRead(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    career_goal_id: Optional[int]
    career_goal_title: Optional[str]
    custom_goal_text: Optional[str]
    experience_level: str
    weekly_hours: int
    target_timeline_months: int
    preferred_learning_style: str
    completed_courses_text: Optional[str]
    interests_text: Optional[str]
    ai_understanding_summary: Optional[str]
    skills: List[LearnerSkillRead] = []
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# --- Skill Gap Analysis Schemas ---
class SkillGapItem(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    current_proficiency: float
    required_proficiency: float
    gap: float
    gap_percentage: float
    priority: str  # Critical, High, Medium, Low
    status: str  # Strong, Developing, Needs Attention, Critical Gap
    confidence: float
    prerequisites_met: bool
    importance_weight: float
    source: Optional[str] = "self_reported"
    last_assessed_at: Optional[datetime] = None
    evidence: Optional[str] = None

class RadarDataPoint(BaseModel):
    skill: str
    current: float
    required: float
    full_mark: float = 100.0

class DependencyGraphNode(BaseModel):
    id: int
    name: str
    category: str
    tier: int
    current_proficiency: float
    required_proficiency: float
    gap: float
    status: str
    prerequisites_met: bool

class DependencyGraphEdge(BaseModel):
    source_id: int
    source_name: str
    target_id: int
    target_name: str
    min_proficiency_required: float
    is_satisfied: bool

class DependencyGraphData(BaseModel):
    nodes: List[DependencyGraphNode] = []
    edges: List[DependencyGraphEdge] = []

class SkillGapResponse(BaseModel):
    profile_id: int
    career_goal_title: str
    overall_gap_score: float
    gap_reduction_progress: float = 0.0
    skills_count: int
    critical_gaps_count: int
    needs_attention_count: int = 0
    developing_skills_count: int
    strong_skills_count: int
    radar_data: List[RadarDataPoint]
    skill_gaps: List[SkillGapItem]
    critical_gaps: List[SkillGapItem] = []
    strong_skills: List[SkillGapItem] = []
    dependency_graph: DependencyGraphData = DependencyGraphData()
    ai_analysis_summary: str


# --- Learning Resource & Recommendation Schemas ---
class ResourceRead(BaseModel):
    id: int
    title: str
    type: str
    provider: str
    primary_skill_id: int
    skill_name: Optional[str] = None
    difficulty: str
    duration_hours: float
    rating: float
    url: str
    description: str
    is_free: bool = True
    is_hands_on: bool = True
    project_oriented: bool = False
    learning_style_tag: str = "Mixed"
    quality_score: float = 92.0
    prerequisites_summary: Optional[str] = None
    class Config:
        from_attributes = True

class ScoreBreakdown(BaseModel):
    skill_gap_weight: float
    goal_relevance: float
    prerequisite_match: float
    difficulty_match: float
    learning_style_match: float
    time_fit: float
    feedback_signal: float
    prior_performance: float
    interest_match: float = 0.0
    completion_history: float = 0.0

class RecommendationItem(BaseModel):
    resource: ResourceRead
    recommendation_score: float  # Normalized 0-100
    match_percentage: int = 90  # PathFinder Match percentage
    priority_tier: str  # Top Match, High Priority, Recommended, Optional
    explanation: str
    score_breakdown: ScoreBreakdown

class RecommendationResponse(BaseModel):
    profile_id: int
    recommendations: List[RecommendationItem]
    total_matches: int

class RecommendationFilterRequest(BaseModel):
    profile_id: Optional[int] = None
    skill_id: Optional[int] = None
    resource_type: Optional[str] = None  # All, Courses, Videos, Articles, Projects, Practice, Assessments
    difficulty: Optional[str] = None
    sort_by: Optional[str] = "Recommended"  # Recommended, Shortest, Highest Impact, Beginner Friendly
    search_query: Optional[str] = None
    limit: int = 20

class WhyThisResponse(BaseModel):
    resource_id: int
    resource_title: str
    learner_goal: str
    target_skill: str
    current_proficiency: float
    required_proficiency: float
    gap: float
    prerequisites_status: str
    learning_style_fit: str
    estimated_time: str
    expected_outcome: str
    score_breakdown: Optional[ScoreBreakdown] = None
    ai_narrative_explanation: str


# --- Roadmap Schemas ---
class RoadmapItemRead(BaseModel):
    id: int
    phase_id: int
    resource_id: Optional[int] = None
    skill_id: Optional[int] = None
    skill_name: Optional[str] = None
    resource_title: Optional[str] = None
    resource_url: Optional[str] = None
    resource_provider: Optional[str] = None
    resource_rating: Optional[float] = None
    order_index: int
    title: str
    objective: Optional[str] = None
    item_type: str
    difficulty: str = "Intermediate"
    estimated_minutes: int
    status: str  # Locked, Available, In Progress, Completed
    completion_percentage: float = 0.0
    prerequisites_summary: Optional[str] = None
    prerequisites_met: bool = True
    assessment_id: Optional[int] = None
    assessment_title: Optional[str] = None
    project_id: Optional[int] = None
    project_title: Optional[str] = None
    is_remedial: bool = False
    is_delayed: bool = False
    is_accelerated: bool = False
    unlocked_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class RoadmapPhaseRead(BaseModel):
    id: int
    roadmap_id: int
    phase_number: int
    title: str
    description: Optional[str] = None
    estimated_hours: float
    status: str  # Locked, Available, In Progress, Completed
    milestone_name: Optional[str] = None
    is_remedial: bool = False
    completion_percentage: float = 0.0
    skills: List[str] = []
    items: List[RoadmapItemRead] = []
    class Config:
        from_attributes = True

class RoadmapRead(BaseModel):
    id: int
    profile_id: int
    career_goal_id: int
    career_goal_title: str
    title: str
    description: Optional[str] = None
    total_estimated_hours: float
    status: str
    is_active: bool
    completion_percentage: float = 0.0
    phases: List[RoadmapPhaseRead] = []
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class RoadmapGenerateRequest(BaseModel):
    profile_id: int
    force_regenerate: bool = False

class RoadmapItemStatusUpdate(BaseModel):
    item_id: int
    status: str  # In Progress, Completed

class AdaptationRequest(BaseModel):
    profile_id: int
    trigger_type: str = "assessment"  # assessment, feedback, completion, inactivity, manual_simulation
    skill_id: Optional[int] = None
    skill_name: Optional[str] = None
    score: Optional[float] = None
    difficulty_feedback: Optional[str] = None  # Too Hard, Just Right, Too Easy
    mistakes_identified: Optional[List[str]] = []
    days_inactive: Optional[int] = None

class RoadmapDiffItem(BaseModel):
    action: str  # added, delayed, accelerated, completed, reviewed
    title: str
    phase_title: str
    reason: str
    badge_color: str  # emerald, amber, rose, blue, purple

class AdaptationResponse(BaseModel):
    success: bool
    title: str = "PathFinder updated your roadmap"
    summary: str
    trigger_type: str
    score: Optional[float] = None
    skill_name: str
    proficiency_change: Dict[str, Any]
    before_state_summary: str
    after_state_summary: str
    changes: List[RoadmapDiffItem]
    adapted_roadmap: RoadmapRead


# --- Assessment Schemas ---
class QuestionRead(BaseModel):
    id: int
    question_text: str
    question_type: str  # multiple_choice, conceptual, scenario
    options: List[str]
    points: int

class AssessmentRead(BaseModel):
    id: int
    title: str
    skill_id: int
    skill_name: str
    difficulty: str  # Beginner, Intermediate, Advanced
    passing_score: float
    description: Optional[str] = None
    questions_count: int
    questions: List[QuestionRead] = []
    class Config:
        from_attributes = True

class AssessmentGenerateRequest(BaseModel):
    skill_id: Optional[int] = None
    skill_name: Optional[str] = None
    difficulty: str = "Intermediate"  # Beginner, Intermediate, Advanced
    career_goal: Optional[str] = "AI/ML Engineer"
    question_count: int = 4

class AssessmentSubmitRequest(BaseModel):
    profile_id: int
    assessment_id: int
    answers: Dict[int, str]  # question_id -> chosen option

class QuestionResult(BaseModel):
    question_id: int
    question_text: str
    question_type: str = "multiple_choice"
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str
    points_earned: int

class AssessmentResultResponse(BaseModel):
    attempt_id: int
    assessment_id: int
    assessment_title: str
    skill_name: str
    score: float
    max_score: float
    percentage: float
    passed: bool
    previous_proficiency: float
    new_proficiency: float
    proficiency_delta: float
    previous_confidence: float
    new_confidence: float
    ai_feedback_advice: str
    recommended_action: str
    adaptive_action_taken: str
    question_results: List[QuestionResult]

# --- Project Schemas ---
class ProjectMilestone(BaseModel):
    id: int
    title: str
    description: str
    is_completed: bool = False

class ProjectPrerequisiteStatus(BaseModel):
    skill_name: str
    current_proficiency: float
    required_proficiency: float
    is_satisfied: bool

class ProjectRead(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: str  # Beginner, Intermediate, Advanced
    primary_skill_id: int
    skill_name: Optional[str] = None
    problem_statement: str
    learning_objectives: List[str]
    tech_stack: List[str]
    estimated_hours: float
    expected_outcome: str
    portfolio_value: str = "High Portfolio Impact"
    milestones: List[ProjectMilestone] = []
    prerequisites: List[str] = []
    skills_developed: List[str] = []
    template_repo_url: Optional[str] = None
    class Config:
        from_attributes = True

class ProjectRecommendationItem(BaseModel):
    project: ProjectRead
    match_score: float  # Normalized 0-100
    priority_tier: str  # Top Recommended, Core Milestone, Advanced Capstone
    why_this_project: str
    readiness_status: str  # Ready to Build, Prerequisites Pending, In Progress
    prerequisites_met: bool
    prerequisites_status: List[ProjectPrerequisiteStatus] = []
    skills_developed: List[str] = []

class ProjectRecommendationResponse(BaseModel):
    profile_id: int
    career_goal: str
    recommendations: List[ProjectRecommendationItem]
    total_projects: int

class ProjectDetailResponse(BaseModel):
    project: ProjectRead
    why_this_project: str
    skills_developed: List[str]
    estimated_time: str
    portfolio_value: str
    prerequisites: List[ProjectPrerequisiteStatus]
    milestones: List[ProjectMilestone]
    readiness_status: str

# --- Skill Detail Schemas ---
class SkillPrerequisiteInfo(BaseModel):
    prerequisite_skill_id: int
    prerequisite_name: str
    min_proficiency_required: float
    current_proficiency: float
    is_satisfied: bool

class SkillUnlockInfo(BaseModel):
    skill_id: int
    skill_name: str
    min_proficiency_required: float

class SkillDetailResponse(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    description: Optional[str] = None
    difficulty_tier: str
    current_proficiency: float
    required_proficiency: float
    gap: float
    gap_percentage: float
    priority: str
    status: str
    confidence: float
    source: str
    last_assessed_at: Optional[datetime] = None
    evidence: Optional[str] = None
    importance_weight: float
    prerequisites_met: bool
    prerequisites: List[SkillPrerequisiteInfo] = []
    unlocks_skills: List[SkillUnlockInfo] = []
    related_resources: List[ResourceRead] = []
    related_projects: List[ProjectRead] = []
    assessment_score: Optional[float] = None
    ai_recommendation: str


# --- Progress & Dashboard Schemas ---
class ReadinessBreakdown(BaseModel):
    technical_skills: float
    projects: float
    assessments: float
    consistency: float
    goal_coverage: float

class NextBestAction(BaseModel):
    title: str
    description: str
    item_type: str
    estimated_minutes: int
    skill_name: str
    resource_id: Optional[int] = None
    phase_title: Optional[str] = None
    action_url: Optional[str] = None

class DashboardResponse(BaseModel):
    profile_id: int
    full_name: str
    career_goal: str
    experience_level: str
    overall_progress_percentage: float
    career_readiness_score: float
    readiness_breakdown: ReadinessBreakdown
    how_to_increase_readiness: str
    total_learning_hours: float
    completed_items_count: int
    total_items_count: int
    current_streak_days: int
    current_phase_title: str
    next_best_action: NextBestAction
    recent_insights: List[Dict[str, Any]]
    skill_growth_timeline: List[Dict[str, Any]]

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    profile_id: int
    resource_id: Optional[int] = None
    difficulty_feedback: str  # Too Easy, Just Right, Too Difficult
    next_preference: str  # More practice, More theory, More projects, Shorter lessons, Advanced content
    comment: Optional[str] = None

class FeedbackRead(BaseModel):
    id: int
    profile_id: int
    resource_id: Optional[int]
    difficulty_feedback: str
    next_preference: str
    comment: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# --- Chat Schemas ---
class ChatCitation(BaseModel):
    title: str
    url: Optional[str] = None
    resource_type: str = "Lesson"  # Lesson, Project, Assessment, Documentation
    skill_name: Optional[str] = None

class ChatActionLink(BaseModel):
    label: str
    action_type: str  # navigate, modal, test_out, adapt
    target_url: str  # /roadmap, /projects, /assessments, /skill-gap, /analytics
    params: Optional[Dict[str, Any]] = None

class ChatMessageRequest(BaseModel):
    profile_id: int
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    context_action: Optional[str] = None
    timestamp: datetime
    suggested_quick_prompts: List[str] = []
    citations: List[ChatCitation] = []
    action_links: List[ChatActionLink] = []
    is_fallback: bool = False

class ChatHistoryResponse(BaseModel):
    profile_id: int
    messages: List[ChatMessageResponse] = []

# --- What-If Simulator Schemas ---
class WhatIfRequest(BaseModel):
    profile_id: int
    weekly_hours: int = Field(..., ge=1, le=80)
    target_timeline_months: Optional[int] = Field(None, ge=1, le=36)
    preferred_learning_style: Optional[str] = "Mixed"  # Hands-on, Video, Reading, Project-based, Mixed
    project_preference: Optional[str] = "balanced"  # theory_focused, balanced, project_heavy
    difficulty: Optional[str] = "Adaptive"  # Beginner, Intermediate, Advanced, Adaptive
    focus_mode: Optional[str] = "balanced"  # fast_track, deep_mastery, project_heavy, balanced

class WhatIfResponse(BaseModel):
    current_weekly_hours: int
    current_estimated_months: float
    current_weekly_tasks: int = 4
    current_project_count: int = 5
    current_skill_coverage: float = 72.0
    current_completion_date: str = "August 2026"
    
    simulated_weekly_hours: int
    simulated_estimated_months: float
    simulated_weekly_tasks: int = 6
    simulated_project_count: int = 7
    simulated_skill_coverage: float = 85.0
    simulated_completion_date: str = "May 2026"
    
    timeline_difference_months: float
    feasibility_status: str  # Highly Realistic, Achievable with Effort, High Risk
    weekly_pacing_advice: str
    phase_timeline_comparisons: List[Dict[str, Any]]
    recommended_adjustments: List[str]


# --- Advanced UX Feature Schemas ---

class SkillMomentumItem(BaseModel):
    skill_id: int
    skill_name: str
    current_proficiency: float
    previous_proficiency: float
    trend_delta: float  # e.g. +8.0
    trend_direction: str  # up, down, neutral
    trend_display: str  # "↑ +8%"
    velocity_label: str  # "Fast Accelerating", "Steady Growth", "Plateaued"
    last_calibrated: str

class SkillMomentumResponse(BaseModel):
    profile_id: int
    overall_momentum_label: str
    average_growth_delta: float
    skills: List[SkillMomentumItem]

class LearningVelocityResponse(BaseModel):
    profile_id: int
    completed_hours: float
    planned_hours: float
    velocity_ratio: float  # completed / planned e.g. 1.25
    status: str  # Ahead, On Track, Behind
    status_label: str  # "1.2x • Ahead of Schedule"
    weekly_target_hours: int
    hours_logged_this_week: float
    pace_summary: str

class SmartStreakItem(BaseModel):
    id: int
    activity_type: str  # completed_resource, assessment, project_milestone
    title: str
    skill_name: str
    timestamp: datetime
    impact_points: int

class SmartStreakResponse(BaseModel):
    profile_id: int
    current_streak_days: int
    longest_streak_days: int
    is_streak_active_today: bool
    meaningful_activities_count: int
    recent_milestones: List[SmartStreakItem]
    streak_multiplier: float

class GoalGapItem(BaseModel):
    skill_name: str
    current: float
    required: float
    gap: float
    priority: str

class GoalDistanceResponse(BaseModel):
    profile_id: int
    career_goal: str
    readiness_percentage: float
    demonstrated_competencies_percentage: float  # e.g. 74%
    total_required_skills: int
    mastered_skills_count: int
    in_progress_skills_count: int
    remaining_gaps_count: int
    remaining_gaps: List[GoalGapItem]
    estimated_weeks_to_goal: int
    readiness_trajectory: str

class RoadmapChangelogEntry(BaseModel):
    id: int
    date_str: str  # "Aug 28", "Sep 02"
    event_type: str  # generated, reinforcement_added, accelerated, project_recommended, adapted
    title: str
    description: str
    badge_color: str  # emerald, blue, purple, amber, rose
    icon_type: str  # spark, zap, book, award, arrow

class RoadmapChangelogResponse(BaseModel):
    profile_id: int
    total_adaptations: int
    changelog: List[RoadmapChangelogEntry]

class DailyPlanItem(BaseModel):
    id: int
    order: int
    duration_minutes: int
    title: str
    category: str  # Core Lesson, Interactive Practice, Diagnostic Assessment, Concept Review
    skill_name: str
    description: str
    is_completed: bool = False
    action_url: str

class DailyPlanResponse(BaseModel):
    profile_id: int
    date_formatted: str
    total_minutes: int
    completed_minutes: int
    items: List[DailyPlanItem]
    focus_quote: str

class AchievementItem(BaseModel):
    id: int
    slug: str
    title: str
    description: str
    icon_name: str
    is_unlocked: bool
    unlocked_at: Optional[str] = None
    progress: int
    max_progress: int
    tier: str  # Bronze, Silver, Gold, Platinum

class AchievementResponse(BaseModel):
    profile_id: int
    unlocked_count: int
    total_count: int
    achievements: List[AchievementItem]

class ComparisonSkillItem(BaseModel):
    skill_name: str
    current_proficiency: float
    current_goal_required: Optional[float] = None
    target_goal_required: float
    status: str  # Shared & Satisfied, Shared Gap, Additional Required, Non-Essential

class CareerGoalComparisonRequest(BaseModel):
    profile_id: int
    current_goal_id: Optional[int] = None
    target_goal_id: int

class CareerGoalComparisonResponse(BaseModel):
    profile_id: int
    current_goal_title: str
    target_goal_title: str
    skill_overlap_percentage: float  # e.g. 68.5%
    shared_competencies_count: int
    additional_gaps_count: int
    estimated_additional_weeks: int
    shared_skills: List[ComparisonSkillItem]
    additional_skills: List[ComparisonSkillItem]
    transition_feasibility: str  # High Transferability, Moderate Transition, Significant Pivot
    ai_transition_advice: str

