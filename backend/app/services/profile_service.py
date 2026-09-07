from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import User, LearnerProfile, CareerGoal, Skill, LearnerSkill
from app.schemas.schemas import LearnerProfileCreate, LearnerProfileUpdate, ExtractedGoalInfo
from app.ai.factory import get_ai_provider

class ProfileService:
    @staticmethod
    def parse_natural_goal(db: Session, text: str) -> ExtractedGoalInfo:
        ai_provider = get_ai_provider()
        extracted = ai_provider.analyze_career_goal(text)

        career_name = extracted.get("career_goal", "AI/ML Engineer")
        career = db.query(CareerGoal).filter(CareerGoal.title.ilike(f"%{career_name}%")).first()
        if not career:
            career = db.query(CareerGoal).first()

        return ExtractedGoalInfo(
            career_goal=career.title if career else career_name,
            career_goal_id=career.id if career else 1,
            experience_level=extracted.get("experience_level", "Intermediate"),
            target_timeline_months=extracted.get("target_timeline_months", 6),
            extracted_skills=extracted.get("extracted_skills", ["Python", "SQL"]),
            weak_areas=extracted.get("weak_areas", ["Statistics", "Machine Learning"]),
            preferred_learning_style=extracted.get("preferred_learning_style", "Mixed"),
            weekly_hours=extracted.get("weekly_hours", 10),
            ai_summary=extracted.get("ai_summary", "Custom career pathway parsed."),
            confidence=extracted.get("confidence", 0.92)
        )

    @staticmethod
    def create_or_init_profile(db: Session, data: LearnerProfileCreate) -> LearnerProfile:
        user = db.query(User).filter(User.email == data.email).first()
        if not user:
            user = User(email=data.email, full_name=data.full_name)
            db.add(user)
            db.flush()

        career_goal = None
        if data.career_goal_id:
            career_goal = db.query(CareerGoal).filter(CareerGoal.id == data.career_goal_id).first()
        if not career_goal:
            career_goal = db.query(CareerGoal).first()

        profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == user.id).first()
        if not profile:
            profile = LearnerProfile(
                user_id=user.id,
                career_goal_id=career_goal.id if career_goal else None,
                custom_goal_text=data.custom_goal_text,
                experience_level=data.experience_level,
                weekly_hours=data.weekly_hours,
                target_timeline_months=data.target_timeline_months,
                preferred_learning_style=data.preferred_learning_style,
                completed_courses_text=data.completed_courses_text,
                interests_text=data.interests_text,
                ai_understanding_summary=f"Profile initialized for {career_goal.title if career_goal else 'learning pathway'}. Personalized skill-gap roadmap is ready for generation."
            )
            db.add(profile)
            db.flush()

        if data.skills:
            for sk_data in data.skills:
                skill_id = sk_data.get("skill_id")
                if not skill_id and "skill_name" in sk_data:
                    sk_obj = db.query(Skill).filter(Skill.name.ilike(sk_data["skill_name"])).first()
                    if sk_obj:
                        skill_id = sk_obj.id

                if skill_id:
                    prof = float(sk_data.get("current_proficiency", 50.0))
                    ls = db.query(LearnerSkill).filter(
                        LearnerSkill.profile_id == profile.id,
                        LearnerSkill.skill_id == skill_id
                    ).first()
                    if not ls:
                        db.add(LearnerSkill(
                            profile_id=profile.id,
                            skill_id=skill_id,
                            current_proficiency=prof,
                            confidence_score=0.7,
                            source="self_reported"
                        ))
                    else:
                        ls.current_proficiency = prof

        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def get_profile(db: Session, profile_id: Optional[int] = None) -> Optional[LearnerProfile]:
        if profile_id:
            return db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        return db.query(LearnerProfile).first()

    @staticmethod
    def update_profile(db: Session, profile_id: int, data: LearnerProfileUpdate) -> Optional[LearnerProfile]:
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            return None

        if data.career_goal_id is not None:
            profile.career_goal_id = data.career_goal_id
        if data.experience_level is not None:
            profile.experience_level = data.experience_level
        if data.weekly_hours is not None:
            profile.weekly_hours = data.weekly_hours
        if data.target_timeline_months is not None:
            profile.target_timeline_months = data.target_timeline_months
        if data.preferred_learning_style is not None:
            profile.preferred_learning_style = data.preferred_learning_style
        if data.custom_goal_text is not None:
            profile.custom_goal_text = data.custom_goal_text
        if data.interests_text is not None:
            profile.interests_text = data.interests_text

        if data.skills is not None:
            for s in data.skills:
                sid = s.get("skill_id")
                prof = float(s.get("current_proficiency", 50.0))
                if sid:
                    ls = db.query(LearnerSkill).filter(
                        LearnerSkill.profile_id == profile.id,
                        LearnerSkill.skill_id == sid
                    ).first()
                    if ls:
                        ls.current_proficiency = prof
                    else:
                        db.add(LearnerSkill(
                            profile_id=profile.id,
                            skill_id=sid,
                            current_proficiency=prof,
                            confidence_score=0.7,
                            source="self_reported"
                        ))

        db.commit()
        db.refresh(profile)
        return profile
