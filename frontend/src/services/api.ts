import {
  LearnerProfile,
  SkillGapResponse,
  SkillDetailResponse,
  RecommendationResponse,
  WhyThisResponse,
  Roadmap,
  Assessment,
  AssessmentResult,
  Project,
  ProjectRecommendationResponse,
  ProjectDetailResponse,
  DashboardData,
  ChatMessage,
  ChatHistoryResponse,
  WhatIfResponse,
  CareerGoal,
  Skill,
  AdaptationRequest,
  AdaptationResponse,
  SkillMomentumResponse,
  LearningVelocityResponse,
  SmartStreakResponse,
  GoalDistanceResponse,
  RoadmapChangelogResponse,
  DailyPlanResponse,
  AchievementResponse,
  CareerGoalComparisonResponse
} from '../types';

export const API_BASE_URL = '/api';
const API_BASE = API_BASE_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `${res.status} ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Demo Mode
  async initDemoLearner(): Promise<LearnerProfile> {
    const res = await fetch(`${API_BASE}/demo/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse<LearnerProfile>(res);
  },

  // NLP Goal Analysis
  async analyzeGoal(text: string) {
    const res = await fetch(`${API_BASE}/analyze-goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return handleResponse<{
      career_goal: string;
      career_goal_id: number;
      experience_level: string;
      target_timeline_months: number;
      extracted_skills: string[];
      weak_areas: string[];
      preferred_learning_style: string;
      weekly_hours: number;
      ai_summary: string;
      confidence: number;
    }>(res);
  },

  // Profile Management
  async getProfile(profileId?: number): Promise<LearnerProfile> {
    const url = profileId ? `${API_BASE}/profile?profile_id=${profileId}` : `${API_BASE}/profile`;
    const res = await fetch(url);
    return handleResponse<LearnerProfile>(res);
  },

  async createProfile(data: any): Promise<LearnerProfile> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<LearnerProfile>(res);
  },

  async updateProfile(profileId: number, data: any): Promise<LearnerProfile> {
    const res = await fetch(`${API_BASE}/profile/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<LearnerProfile>(res);
  },

  // Careers and Skills
  async getCareers(): Promise<CareerGoal[]> {
    const res = await fetch(`${API_BASE}/careers`);
    return handleResponse<CareerGoal[]>(res);
  },

  async getSkills(category?: string): Promise<Skill[]> {
    const url = category ? `${API_BASE}/skills?category=${encodeURIComponent(category)}` : `${API_BASE}/skills`;
    const res = await fetch(url);
    return handleResponse<Skill[]>(res);
  },

  // Skill Gap Analysis
  async getSkillGap(profileId?: number): Promise<SkillGapResponse> {
    const url = profileId ? `${API_BASE}/skill-gap/analyze?profile_id=${profileId}` : `${API_BASE}/skill-gap/analyze`;
    const res = await fetch(url);
    return handleResponse<SkillGapResponse>(res);
  },

  async getSkillDetail(skillId: number, profileId?: number): Promise<SkillDetailResponse> {
    const url = profileId
      ? `${API_BASE}/skill-gap/skill/${skillId}?profile_id=${profileId}`
      : `${API_BASE}/skill-gap/skill/${skillId}`;
    const res = await fetch(url);
    return handleResponse<SkillDetailResponse>(res);
  },


  // Recommendations
  async getRecommendations(params?: {
    profileId?: number;
    skillId?: number;
    resourceType?: string;
    difficulty?: string;
    searchQuery?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<RecommendationResponse> {
    const query = new URLSearchParams();
    if (params?.profileId) query.append('profile_id', params.profileId.toString());
    if (params?.skillId) query.append('skill_id', params.skillId.toString());
    if (params?.resourceType && params.resourceType !== 'All') query.append('resource_type', params.resourceType);
    if (params?.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params?.searchQuery) query.append('search_query', params.searchQuery);
    if (params?.sortBy) query.append('sort_by', params.sortBy);
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/recommendations?${query.toString()}`);
    return handleResponse<RecommendationResponse>(res);
  },

  async queryRecommendations(data: {
    profile_id?: number;
    skill_id?: number;
    resource_type?: string;
    difficulty?: string;
    search_query?: string;
    sort_by?: string;
    limit?: number;
  }): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<RecommendationResponse>(res);
  },

  async explainRecommendation(resourceId: number, profileId?: number): Promise<WhyThisResponse> {
    const query = new URLSearchParams({ resource_id: resourceId.toString() });

    if (profileId) query.append('profile_id', profileId.toString());
    const res = await fetch(`${API_BASE}/recommendations/explain?${query.toString()}`);
    return handleResponse<WhyThisResponse>(res);
  },

  // Roadmap & What-If
  async getRoadmap(profileId?: number): Promise<Roadmap> {
    const url = profileId ? `${API_BASE}/roadmap?profile_id=${profileId}` : `${API_BASE}/roadmap`;
    const res = await fetch(url);
    return handleResponse<Roadmap>(res);
  },

  async generateRoadmap(profileId: number, forceRegenerate = false): Promise<Roadmap> {
    const res = await fetch(`${API_BASE}/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, force_regenerate: forceRegenerate })
    });
    return handleResponse<Roadmap>(res);
  },

  async updateItemStatus(itemId: number, status: string): Promise<{ success: boolean; item_id: number; new_status: string }> {
    const res = await fetch(`${API_BASE}/roadmap/item/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, status })
    });
    return handleResponse(res);
  },

  async simulateWhatIf(data: {
    profile_id: number;
    weekly_hours: number;
    target_timeline_months?: number;
    preferred_learning_style?: string;
    project_preference?: string;
    difficulty?: string;
    focus_mode?: string;
  }): Promise<WhatIfResponse> {
    const res = await fetch(`${API_BASE}/roadmap/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<WhatIfResponse>(res);
  },

  async adaptRoadmap(data: AdaptationRequest): Promise<AdaptationResponse> {
    const res = await fetch(`${API_BASE}/roadmap/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<AdaptationResponse>(res);
  },

  // Assessments
  async getAssessments(skillId?: number): Promise<Assessment[]> {
    const url = skillId ? `${API_BASE}/assessment/list?skill_id=${skillId}` : `${API_BASE}/assessment/list`;
    const res = await fetch(url);
    return handleResponse<Assessment[]>(res);
  },

  async getAssessment(id: number): Promise<Assessment> {
    const res = await fetch(`${API_BASE}/assessment/${id}`);
    return handleResponse<Assessment>(res);
  },

  async generateAssessment(data: {
    skill_id?: number;
    skill_name?: string;
    difficulty?: string;
    career_goal?: string;
    question_count?: number;
  }): Promise<Assessment> {
    const res = await fetch(`${API_BASE}/assessment/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Assessment>(res);
  },

  async submitAssessment(data: {
    profile_id: number;
    assessment_id: number;
    answers: Record<number, string>;
  }): Promise<AssessmentResult> {
    const res = await fetch(`${API_BASE}/assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<AssessmentResult>(res);
  },

  // Feedback
  async submitFeedback(data: {
    profile_id: number;
    resource_id?: number;
    difficulty_feedback: string;
    next_preference: string;
    comment?: string;
  }) {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Progress & Analytics Dashboard
  async getDashboard(profileId?: number): Promise<DashboardData> {
    const url = profileId ? `${API_BASE}/dashboard?profile_id=${profileId}` : `${API_BASE}/dashboard`;
    const res = await fetch(url);
    return handleResponse<DashboardData>(res);
  },

  // Projects & Portfolio Recommender
  async getProjects(params?: { difficulty?: string; skill_id?: number }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params?.skill_id) query.append('skill_id', params.skill_id.toString());
    const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
    return handleResponse<Project[]>(res);
  },

  async getProjectRecommendations(profileId?: number): Promise<ProjectRecommendationResponse> {
    const url = profileId ? `${API_BASE}/projects/recommendations?profile_id=${profileId}` : `${API_BASE}/projects/recommendations`;
    const res = await fetch(url);
    return handleResponse<ProjectRecommendationResponse>(res);
  },

  async getProjectDetail(projectId: number, profileId?: number): Promise<ProjectDetailResponse> {
    const url = profileId ? `${API_BASE}/projects/${projectId}?profile_id=${profileId}` : `${API_BASE}/projects/${projectId}`;
    const res = await fetch(url);
    return handleResponse<ProjectDetailResponse>(res);
  },

  // AI Assistant Chat
  async sendMessage(profileId: number, message: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, message })
    });
    return handleResponse<ChatMessage>(res);
  },

  async getChatHistory(profileId?: number): Promise<ChatHistoryResponse> {
    const url = profileId ? `${API_BASE}/chat/history?profile_id=${profileId}` : `${API_BASE}/chat/history`;
    const res = await fetch(url);
    return handleResponse<ChatHistoryResponse>(res);
  },

  async clearChatHistory(profileId?: number): Promise<{ success: boolean; deleted_count: number }> {
    const url = profileId ? `${API_BASE}/chat/history?profile_id=${profileId}` : `${API_BASE}/chat/history`;
    const res = await fetch(url, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Advanced UX Features
  async getSkillMomentum(profileId?: number): Promise<SkillMomentumResponse> {
    const url = profileId ? `${API_BASE}/analytics/momentum?profile_id=${profileId}` : `${API_BASE}/analytics/momentum`;
    const res = await fetch(url);
    return handleResponse<SkillMomentumResponse>(res);
  },

  async getLearningVelocity(profileId?: number): Promise<LearningVelocityResponse> {
    const url = profileId ? `${API_BASE}/analytics/velocity?profile_id=${profileId}` : `${API_BASE}/analytics/velocity`;
    const res = await fetch(url);
    return handleResponse<LearningVelocityResponse>(res);
  },

  async getSmartStreak(profileId?: number): Promise<SmartStreakResponse> {
    const url = profileId ? `${API_BASE}/analytics/smart-streak?profile_id=${profileId}` : `${API_BASE}/analytics/smart-streak`;
    const res = await fetch(url);
    return handleResponse<SmartStreakResponse>(res);
  },

  async getGoalDistance(profileId?: number): Promise<GoalDistanceResponse> {
    const url = profileId ? `${API_BASE}/analytics/goal-distance?profile_id=${profileId}` : `${API_BASE}/analytics/goal-distance`;
    const res = await fetch(url);
    return handleResponse<GoalDistanceResponse>(res);
  },

  async getRoadmapChangelog(profileId?: number): Promise<RoadmapChangelogResponse> {
    const url = profileId ? `${API_BASE}/roadmap/changelog?profile_id=${profileId}` : `${API_BASE}/roadmap/changelog`;
    const res = await fetch(url);
    return handleResponse<RoadmapChangelogResponse>(res);
  },

  async getDailyPlan(profileId?: number): Promise<DailyPlanResponse> {
    const url = profileId ? `${API_BASE}/analytics/daily-plan?profile_id=${profileId}` : `${API_BASE}/analytics/daily-plan`;
    const res = await fetch(url);
    return handleResponse<DailyPlanResponse>(res);
  },

  async getAchievements(profileId?: number): Promise<AchievementResponse> {
    const url = profileId ? `${API_BASE}/analytics/achievements?profile_id=${profileId}` : `${API_BASE}/analytics/achievements`;
    const res = await fetch(url);
    return handleResponse<AchievementResponse>(res);
  },

  async compareCareerGoals(data: { profile_id: number; target_goal_id: number; current_goal_id?: number }): Promise<CareerGoalComparisonResponse> {
    const res = await fetch(`${API_BASE}/career/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<CareerGoalComparisonResponse>(res);
  }
};
