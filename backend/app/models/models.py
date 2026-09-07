import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Technology")
    required_experience_level = Column(String(50), default="Intermediate")
    avg_salary = Column(String(100), default="$120,000/yr")
    market_demand = Column(String(50), default="High")

    career_skills = relationship("CareerSkill", back_populates="career_goal", cascade="all, delete-orphan")
    learning_resources = relationship("LearningResource", back_populates="career_goal")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    category = Column(String(100), default="Technical")
    description = Column(Text, nullable=True)
    difficulty_tier = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced

    career_skills = relationship("CareerSkill", back_populates="skill")
    learner_skills = relationship("LearnerSkill", back_populates="skill")
    resources = relationship("LearningResource", back_populates="skill")


class CareerSkill(Base):
    __tablename__ = "career_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("career_goals.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    required_proficiency = Column(Float, default=80.0)  # 0 to 100
    importance_weight = Column(Float, default=1.0)  # 0.5 to 2.0
    priority_tier = Column(String(50), default="High")  # Critical, High, Medium, Nice to have

    career_goal = relationship("CareerGoal", back_populates="career_skills")
    skill = relationship("Skill", back_populates="career_skills")


class Prerequisite(Base):
    __tablename__ = "prerequisites"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    prerequisite_skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    min_proficiency_required = Column(Float, default=60.0)

    skill = relationship("Skill", foreign_keys=[skill_id])
    prerequisite_skill = relationship("Skill", foreign_keys=[prerequisite_skill_id])


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    career_goal_id = Column(Integer, ForeignKey("career_goals.id"), nullable=True)
    custom_goal_text = Column(Text, nullable=True)
    experience_level = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    weekly_hours = Column(Integer, default=10)
    target_timeline_months = Column(Integer, default=6)
    preferred_learning_style = Column(String(50), default="Mixed")  # Video, Reading, Hands-on, Project-based, Mixed
    completed_courses_text = Column(Text, nullable=True)
    interests_text = Column(Text, nullable=True)
    ai_understanding_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")
    career_goal = relationship("CareerGoal")
    skills = relationship("LearnerSkill", back_populates="profile", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="profile", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="profile", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="profile", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="profile", cascade="all, delete-orphan")
    insights = relationship("AIInsight", back_populates="profile", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="profile", uselist=False, cascade="all, delete-orphan")


class LearnerSkill(Base):
    __tablename__ = "learner_skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("learner_profiles.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    current_proficiency = Column(Float, default=0.0)  # 0 to 100
    confidence_score = Column(Float, default=0.5)  # 0.0 to 1.0
    last_assessed_at = Column(DateTime, nullable=True)
    source = Column(String(50), default="self_reported")  # self_reported, assessment, feedback, github, quiz
    evidence = Column(Text, nullable=True)

    profile = relationship("LearnerProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="learner_skills")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    career_goal_id = Column(Integer, ForeignKey("career_goals.id"), nullable=True)
    primary_skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    title = Column(String(255), nullable=False)
    type = Column(String(50), default="Course")  # Course, Tutorial, Documentation, Video, Article, Practice, Project, Assessment
    provider = Column(String(100), default="PathFinder Curated")
    difficulty = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    duration_hours = Column(Float, default=4.0)
    rating = Column(Float, default=4.8)
    url = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    is_free = Column(Boolean, default=True)
    is_hands_on = Column(Boolean, default=True)
    project_oriented = Column(Boolean, default=False)
    learning_style_tag = Column(String(50), default="Mixed")
    quality_score = Column(Float, default=92.0)
    prerequisites_summary = Column(String(255), nullable=True)

    skill = relationship("Skill", back_populates="resources")
    career_goal = relationship("CareerGoal", back_populates="learning_resources")



class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("learner_profiles.id"), nullable=False)
    career_goal_id = Column(Integer, ForeignKey("career_goals.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    total_estimated_hours = Column(Float, default=0.0)
    status = Column(String(50), default="In Progress")  # In Progress, Completed, Paused
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    profile = relationship("LearnerProfile", back_populates="roadmaps")
    career_goal = relationship("CareerGoal")
    phases = relationship("RoadmapPhase", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapPhase.phase_number")


class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    phase_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    estimated_hours = Column(Float, default=0.0)
    status = Column(String(50), default="Locked")  # Locked, Available, In Progress, Completed
    milestone_name = Column(String(255), nullable=True)
    is_remedial = Column(Boolean, default=False)

    roadmap = relationship("Roadmap", back_populates="phases")
    items = relationship("RoadmapItem", back_populates="phase", cascade="all, delete-orphan", order_by="RoadmapItem.order_index")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(Integer, primary_key=True, index=True)
    phase_id = Column(Integer, ForeignKey("roadmap_phases.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("learning_resources.id"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    order_index = Column(Integer, default=0)
    title = Column(String(255), nullable=False)
    objective = Column(Text, nullable=True)
    item_type = Column(String(50), default="Learning")  # Learning, Project, Assessment, Practice, Revision
    difficulty = Column(String(50), default="Intermediate")
    estimated_minutes = Column(Integer, default=60)
    status = Column(String(50), default="Locked")  # Locked, Available, In Progress, Completed
    completion_percentage = Column(Float, default=0.0)
    prerequisites_summary = Column(String(255), nullable=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    is_remedial = Column(Boolean, default=False)
    is_delayed = Column(Boolean, default=False)
    is_accelerated = Column(Boolean, default=False)
    unlocked_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    phase = relationship("RoadmapPhase", back_populates="items")
    resource = relationship("LearningResource")
    skill = relationship("Skill")
    assessment = relationship("Assessment", foreign_keys=[assessment_id])
    project = relationship("Project", foreign_keys=[project_id])


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    difficulty = Column(String(50), default="Intermediate")
    passing_score = Column(Float, default=70.0)
    description = Column(Text, nullable=True)

    skill = relationship("Skill")
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice")  # multiple_choice, conceptual, scenario
    options_json = Column(Text, nullable=False)  # JSON serialized list of strings
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    points = Column(Integer, default=10)

    assessment = relationship("Assessment", back_populates="questions")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("learner_profiles.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    answers_json = Column(Text, nullable=True)
    skill_delta = Column(Float, default=0.0)
    feedback_advice = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("LearnerProfile", back_populates="attempts")
    assessment = relationship("Assessment")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    primary_skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    problem_statement = Column(Text, nullable=False)
    learning_objectives_json = Column(Text, nullable=False)  # JSON array
    tech_stack_json = Column(Text, nullable=False)  # JSON array
    estimated_hours = Column(Float, default=12.0)
    expected_outcome = Column(Text, nullable=False)
    portfolio_value = Column(String(100), default="High Portfolio Impact")  # High, Essential Portfolio Piece, etc.
    milestones_json = Column(Text, nullable=True)  # JSON array of milestone strings or objects
    prerequisites_json = Column(Text, nullable=True)  # JSON array of prerequisite skill names
    skills_developed_json = Column(Text, nullable=True)  # JSON array of skills learned
    template_repo_url = Column(String(500), nullable=True)

    skill = relationship("Skill")


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("learner_profiles.id"), unique=True, nullable=False)
    completed_items_count = Column(Integer, default=0)
    total_items_count = Column(Integer, default=0)
    total_learning_minutes = Column(Integer, default=0)
    current_streak_days = Column(Integer, default=1)
    last_activity_date = Column(DateTime, default=datetime.datetime.utcnow)
    career_readiness_score = Column(Float, default=35.0)
    readiness_breakdown_json = Column(Text, nullable=True)  # JSON dict

    profile = relationship("LearnerProfile", back_populates="progress")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("learner_profiles.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("learning_resources.id"), nullable=True)
    difficulty_feedback = Column(String(50), nullable=False)  # Too Easy, Just Right, Too Difficult
    next_preference = Column(String(50), nullable=False)  # More practice, More theory, More projects, Shorter lessons, Advanced content
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("LearnerProfile", back_populates="feedbacks")
    resource = relationship("LearningResource")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("learner_profiles.id"), nullable=False)
    role = Column(String(50), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    context_action = Column(String(100), nullable=True)
    citations_json = Column(Text, nullable=True)
    action_links_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("LearnerProfile", back_populates="chat_messages")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("learner_profiles.id"), nullable=False)
    insight_type = Column(String(50), default="Strength")  # Strength, Gap, Trend, Milestone, Recommendation
    message = Column(Text, nullable=False)
    importance = Column(String(50), default="Medium")  # High, Medium, Low
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("LearnerProfile", back_populates="insights")
