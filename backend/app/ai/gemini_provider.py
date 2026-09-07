import json
import logging
from typing import Dict, Any, List
from app.ai.base import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiProvider(AIProvider):
    """
    Live Gemini API integration using Google GenAI SDK.
    Falls back gracefully to MockAIProvider on any network/API exception.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.fallback = MockAIProvider()
        self.client = None
        
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}. Using fallback.")
                self.client = None

    def analyze_career_goal(self, user_prompt: str) -> Dict[str, Any]:
        if not self.client:
            return self.fallback.analyze_career_goal(user_prompt)

        try:
            prompt = f"""
You are an expert AI Career and Education Architect for PathFinder.
Analyze the user's free-form learning request and extract structured JSON information.

User Input: "{user_prompt}"

Return ONLY a valid JSON object with the following fields:
{{
  "career_goal": "One of AI/ML Engineer, Data Scientist, Full Stack Developer, Cloud Engineer, Cybersecurity Analyst, Data Analyst",
  "experience_level": "Beginner, Intermediate, or Advanced",
  "target_timeline_months": integer (default 6),
  "extracted_skills": ["list of technical skills mentioned"],
  "weak_areas": ["list of skills they need help with or lack"],
  "preferred_learning_style": "Video, Reading, Hands-on, Project-based, or Mixed",
  "weekly_hours": integer (default 10),
  "ai_summary": "1-2 sentence professional summary of their goal and current state",
  "confidence": 0.95
}}
"""
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            
            return json.loads(raw_text.strip())
        except Exception as e:
            logger.warning(f"Gemini API goal analysis failed: {e}. Falling back to mock provider.")
            return self.fallback.analyze_career_goal(user_prompt)

    def generate_explanation(
        self,
        resource_title: str,
        skill_name: str,
        goal_title: str,
        gap: float,
        prereqs_met: bool,
        learning_style: str,
        weekly_hours: int
    ) -> str:
        if not self.client:
            return self.fallback.generate_explanation(
                resource_title, skill_name, goal_title, gap, prereqs_met, learning_style, weekly_hours
            )

        try:
            prompt = f"""
Explain why the following resource is recommended to a learner in 2-3 compelling, personalized sentences:
- Resource Title: {resource_title}
- Target Skill: {skill_name}
- Career Goal: {goal_title}
- Skill Gap: {gap}%
- Prerequisites Satisfied: {prereqs_met}
- Preferred Style: {learning_style}
- Weekly Study Hours: {weekly_hours} hours

Format as an explainable AI insight. Do not use generic filler words.
"""
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini explanation failed: {e}. Using fallback.")
            return self.fallback.generate_explanation(
                resource_title, skill_name, goal_title, gap, prereqs_met, learning_style, weekly_hours
            )

    def chat_response(
        self,
        message: str,
        learner_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        if not self.client:
            return self.fallback.chat_response(message, learner_context, conversation_history)

        try:
            top_gaps = learner_context.get("top_gaps", [])
            gaps_summary = ", ".join([f"{g.get('name')} (Current: {g.get('current')}%, Req: {g.get('required')}%)" for g in top_gaps])
            system_instruction = f"""
You are PathFinder AI, an intelligent, empathetic, and highly actionable learning assistant.
You have direct access to this learner's live profile, career goal, skill gaps, roadmap, and analytics.

Learner Live State:
- Career Goal: {learner_context.get('career_goal')}
- Experience Level: {learner_context.get('experience_level')}
- Career Readiness Score: {learner_context.get('readiness_score')}%
- Current Active Phase: {learner_context.get('current_phase', 'Core Phase')}
- Next Best Action: {learner_context.get('next_action_title')} ({learner_context.get('next_action_skill', 'Core Skill')}, ~{learner_context.get('next_action_time', 45)} mins)
- Key Skill Gaps: {gaps_summary or 'In calibration'}
- Available Weekly Hours: {learner_context.get('weekly_hours')} hours/week

Rules:
1. Ground your advice explicitly in their actual skills, roadmap, next action, or skill gaps.
2. If the user asks for a 2-hour schedule, break it down specifically into:
   - 60-min lesson on their next best action
   - 30-min hands-on practice
   - 30-min diagnostic assessment
3. Output Markdown with bullet points and bold highlights.
4. Keep the response concise, punchy, and actionable (2-4 paragraphs max).
"""
            history_text = "\n".join([f"{h.get('role', 'user')}: {h.get('content', '')}" for h in conversation_history[-4:]])
            prompt = f"{system_instruction}\n\nRecent Conversation:\n{history_text}\n\nUser: {message}\n\nAssistant:"
            
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            raw_text = response.text.strip()
            
            # Generate contextual citations & action links
            citations = []
            action_links = []
            next_action = learner_context.get("next_action_title", "Decision Trees")
            next_skill = learner_context.get("next_action_skill", "Machine Learning")
            
            msg_lower = message.lower()
            if "project" in msg_lower:
                action_links.append({"label": "Explore Recommended Projects", "action_type": "navigate", "target_url": "/projects"})
                citations.append({"title": "Portfolio Capstones", "url": "/projects", "resource_type": "Project", "skill_name": next_skill})
            elif "gap" in msg_lower or "skill" in msg_lower:
                action_links.append({"label": "Open Skill Gap Matrix", "action_type": "navigate", "target_url": "/skill-gap"})
                citations.append({"title": "Skill-Gap Radar", "url": "/skill-gap", "resource_type": "Analytics", "skill_name": next_skill})
            elif "readiness" in msg_lower or "close" in msg_lower:
                action_links.append({"label": "View Readiness Breakdown", "action_type": "navigate", "target_url": "/analytics"})
                citations.append({"title": "Readiness Analytics", "url": "/analytics", "resource_type": "Analytics", "skill_name": "Readiness"})
            else:
                action_links.append({"label": "Continue on Roadmap", "action_type": "navigate", "target_url": "/roadmap"})
                citations.append({"title": f"{next_action} Module", "url": "/roadmap", "resource_type": "Lesson", "skill_name": next_skill})

            return {
                "content": raw_text,
                "context_action": "ai_assistant_guidance",
                "suggested_quick_prompts": [
                    "What should I learn next?",
                    "I only have 2 hours today.",
                    "Explain my biggest skill gap.",
                    "Give me a project.",
                    "How close am I to my goal?"
                ],
                "citations": citations,
                "action_links": action_links,
                "is_fallback": False
            }
        except Exception as e:
            logger.warning(f"Gemini chat failed: {e}. Using fallback.")
            fallback_res = self.fallback.chat_response(message, learner_context, conversation_history)
            fallback_res["content"] = f"*(AI service temporarily unavailable. PathFinder switched to its intelligent fallback.)*\n\n{fallback_res.get('content', '')}"
            fallback_res["is_fallback"] = True
            return fallback_res

    def generate_adaptive_advice(
        self,
        assessment_title: str,
        skill_name: str,
        score_percentage: float,
        passed: bool,
        weak_topics: List[str]
    ) -> Dict[str, Any]:
        if not self.client:
            return self.fallback.generate_adaptive_advice(
                assessment_title, skill_name, score_percentage, passed, weak_topics
            )

        try:
            prompt = f"""
A learner just finished an assessment '{assessment_title}' for skill '{skill_name}' with score {score_percentage}% (Passed: {passed}).
Identified weak topics: {', '.join(weak_topics) if weak_topics else 'None'}.

Provide structured JSON:
{{
  "advice": "1-2 sentences of encouragement and specific study advice",
  "adaptive_action": "Summary of how PathFinder adapts the roadmap (e.g. Injected revision module, Unlocked advanced track)",
  "recommended_focus": "Core topic to review next"
}}
"""
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            return json.loads(raw.strip())
        except Exception as e:
            logger.warning(f"Gemini adaptive advice failed: {e}. Using fallback.")
            return self.fallback.generate_adaptive_advice(
                assessment_title, skill_name, score_percentage, passed, weak_topics
            )

    def generate_assessment(
        self,
        skill_name: str,
        difficulty: str,
        career_goal: str,
        question_count: int = 4
    ) -> Dict[str, Any]:
        if not self.client:
            return self.fallback.generate_assessment(skill_name, difficulty, career_goal, question_count)

        try:
            prompt = f"""
You are a senior technical examiner designing a diagnostic assessment for '{skill_name}' ({difficulty} level) targeting a '{career_goal}' role.
Create {question_count} high-quality questions spanning MCQ, Conceptual, and Scenario types.

Return ONLY a valid JSON object matching this schema:
{{
  "title": "{skill_name} Diagnostic Assessment ({difficulty})",
  "skill_name": "{skill_name}",
  "difficulty": "{difficulty}",
  "passing_score": 70.0,
  "description": "Adaptive technical evaluation testing core concepts, algorithmic depth, and production scenarios.",
  "questions": [
    {{
      "text": "Question prompt text",
      "type": "multiple_choice | conceptual | scenario",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": "Exact string of correct option",
      "explanation": "Detailed pedagogical explanation of why this answer is correct"
    }}
  ]
}}
"""
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            return json.loads(raw.strip())
        except Exception as e:
            logger.warning(f"Gemini assessment generation failed: {e}. Using fallback.")
            return self.fallback.generate_assessment(skill_name, difficulty, career_goal, question_count)

    def generate_project_explanation(
        self,
        project_title: str,
        primary_skill: str,
        career_goal: str,
        gap: float,
        prereqs_met: bool,
        difficulty: str
    ) -> str:
        if not self.client:
            return self.fallback.generate_project_explanation(
                project_title, primary_skill, career_goal, gap, prereqs_met, difficulty
            )

        try:
            prompt = f"""
Generate a personalized, motivating 2-sentence explanation of why the portfolio project '{project_title}' ({difficulty}) is recommended for a learner aiming for '{career_goal}'.
- Primary skill targeted: {primary_skill} (Skill gap: {gap}%)
- Prerequisites satisfied: {prereqs_met}

Focus on portfolio value, bridging their specific skill gap, and job readiness.
"""
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini project explanation failed: {e}. Using fallback.")
            return self.fallback.generate_project_explanation(
                project_title, primary_skill, career_goal, gap, prereqs_met, difficulty
            )
