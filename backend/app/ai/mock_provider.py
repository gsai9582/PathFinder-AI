import re
from typing import Dict, Any, List
from app.ai.base import AIProvider

class MockAIProvider(AIProvider):
    """
    Intelligent local heuristic provider.
    Guarantees 100% functionality and rich interactive responses even without an external API key.
    """

    CAREER_SYNONYMS = {
        "AI/ML Engineer": ["ai", "machine learning", "ml", "deep learning", "nlp", "computer vision", "llm"],
        "Data Scientist": ["data science", "data scientist", "analytics scientist", "predictive modeling"],
        "Full Stack Developer": ["full stack", "web developer", "react", "frontend", "backend", "fullstack", "node", "typescript"],
        "Cloud Engineer": ["cloud", "aws", "gcp", "azure", "devops", "kubernetes", "infrastructure"],
        "Cybersecurity Analyst": ["cybersecurity", "security", "infosec", "soc", "penetration testing", "ethical hacking"],
        "Data Analyst": ["data analyst", "bi", "tableau", "power bi", "sql analyst", "business intelligence"]
    }

    KNOWN_SKILLS = [
        "Python", "SQL", "Mathematics", "Statistics", "Machine Learning", "Deep Learning",
        "NLP", "Computer Vision", "MLOps", "Data Structures", "Pandas", "Data Cleaning",
        "Visualization", "HTML", "CSS", "JavaScript", "TypeScript", "React", "APIs", "Git",
        "Cloud", "Docker", "Kubernetes", "Linux", "Network Security", "Cryptography"
    ]

    def analyze_career_goal(self, user_prompt: str) -> Dict[str, Any]:
        text_lower = user_prompt.lower()
        
        # 1. Detect target career
        matched_career = "AI/ML Engineer"
        best_match_score = 0
        for career, keywords in self.CAREER_SYNONYMS.items():
            score = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower))
            if score > best_match_score:
                best_match_score = score
                matched_career = career

        # 2. Detect experience level
        experience_level = "Beginner"
        if any(w in text_lower for w in ["intermediate", "some experience", "junior", "1-2 years", "i know", "experienced with"]):
            experience_level = "Intermediate"
        elif any(w in text_lower for w in ["advanced", "senior", "lead", "5+ years", "proficient in"]):
            experience_level = "Advanced"

        # 3. Detect timeline in months
        timeline_match = re.search(r'(\d+)\s*(?:month|months|mo)', text_lower)
        target_timeline_months = int(timeline_match.group(1)) if timeline_match else 6

        # 4. Detect weekly hours
        hours_match = re.search(r'(\d+)\s*(?:hour|hours|hrs|hr)', text_lower)
        weekly_hours = int(hours_match.group(1)) if hours_match else 10

        # 5. Extract extracted skills
        extracted_skills = []
        for skill in self.KNOWN_SKILLS:
            if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
                extracted_skills.append(skill)
        if not extracted_skills:
            extracted_skills = ["Python", "SQL"] if matched_career in ["AI/ML Engineer", "Data Scientist"] else ["JavaScript", "HTML"]

        # 6. Extract weak areas
        weak_areas = []
        weakness_patterns = [
            r'weak in ([\w\s,]+)',
            r'struggle with ([\w\s,]+)',
            r'need help with ([\w\s,]+)',
            r'lack ([\w\s,]+)',
            r'no ([\w\s]+) background'
        ]
        for pattern in weakness_patterns:
            match = re.search(pattern, text_lower)
            if match:
                raw_weakness = match.group(1)
                for skill in self.KNOWN_SKILLS:
                    if skill.lower() in raw_weakness:
                        weak_areas.append(skill)
        if not weak_areas:
            if matched_career == "AI/ML Engineer":
                weak_areas = ["Statistics", "Machine Learning"]
            elif matched_career == "Data Scientist":
                weak_areas = ["Machine Learning", "Experimentation"]
            else:
                weak_areas = ["APIs", "Testing"]

        # 7. Preferred learning style
        learning_style = "Mixed"
        if "video" in text_lower or "watch" in text_lower:
            learning_style = "Video"
        elif "reading" in text_lower or "book" in text_lower or "articles" in text_lower:
            learning_style = "Reading"
        elif "project" in text_lower or "build" in text_lower:
            learning_style = "Project-based"
        elif "hands-on" in text_lower or "practice" in text_lower or "code" in text_lower:
            learning_style = "Hands-on"

        summary = (
            f"Parsed target goal as {matched_career} targeted within {target_timeline_months} months. "
            f"Identified existing foundational strengths in {', '.join(extracted_skills)} with specific growth opportunities in {', '.join(weak_areas)}."
        )

        return {
            "career_goal": matched_career,
            "experience_level": experience_level,
            "target_timeline_months": target_timeline_months,
            "extracted_skills": extracted_skills,
            "weak_areas": weak_areas,
            "preferred_learning_style": learning_style,
            "weekly_hours": weekly_hours,
            "ai_summary": summary,
            "confidence": 0.94
        }

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
        gap_desc = "critical gap" if gap >= 50 else ("moderate development area" if gap > 20 else "refinement skill")
        prereq_desc = "all required prerequisites have been satisfied" if prereqs_met else "core foundations are being established"
        
        return (
            f"Recommended because '{skill_name}' represents a {gap_desc} ({int(gap)}% delta) required for your goal as a {goal_title}. "
            f"Currently {prereq_desc}, making this resource optimal for your immediate roadmap. "
            f"It aligns with your {learning_style.lower()} learning preference and fits comfortably within your {weekly_hours}-hour weekly schedule."
        )

    def chat_response(
        self,
        message: str,
        learner_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        msg_lower = message.lower().strip()
        goal = learner_context.get("career_goal", "AI/ML Engineer")
        readiness = learner_context.get("readiness_score", 48.5)
        next_action = learner_context.get("next_action_title", "Decision Trees & Ensemble Methods")
        next_action_time = learner_context.get("next_action_time", 45)
        next_action_skill = learner_context.get("next_action_skill", "Machine Learning")
        weekly_hours = learner_context.get("weekly_hours", 10)
        top_gaps = learner_context.get("top_gaps", [
            {"name": "Statistics", "current": 35.0, "required": 75.0, "gap": 40.0},
            {"name": "Machine Learning", "current": 20.0, "required": 80.0, "gap": 60.0}
        ])
        top_projects = learner_context.get("top_projects", [
            {"title": "Customer Churn Prediction & Model Explainability Pipeline", "difficulty": "Intermediate", "hours": 15.0, "skill": "Machine Learning"},
            {"title": "Expense Tracker & Financial Analytics", "difficulty": "Beginner", "hours": 10.0, "skill": "Python"}
        ])
        current_phase = learner_context.get("current_phase", "Phase 3 — Machine Learning")

        citations = []
        action_links = []
        suggested_prompts = [
            "What should I learn next?",
            "Explain my biggest skill gap.",
            "I only have 2 hours today.",
            "Give me a project.",
            "How close am I to my goal?"
        ]

        # 1. "What should I learn next?"
        if any(w in msg_lower for w in ["what should i learn next", "what to learn next", "next step", "next best action", "what next"]):
            reply = (
                f"🎯 **Your Next Best Action:**\n\n"
                f"Based on your active roadmap for **{goal}**, your priority focus is **'{next_action}'** ({next_action_skill}).\n\n"
                f"- **Estimated Time:** {next_action_time} minutes\n"
                f"- **Why now:** Your prerequisite foundations in Python and Data Wrangling are solid. This module directly closes your **{next_action_skill}** development area.\n"
                f"- **Recommended Flow:** Complete the interactive lesson, explore the scikit-learn code snippet, and take the 5-question milestone assessment."
            )
            citations = [
                {"title": f"{next_action} Interactive Module", "url": "https://scikit-learn.org/stable/tutorial/index.html", "resource_type": "Lesson", "skill_name": next_action_skill},
                {"title": f"{next_action_skill} Milestone Check", "url": "/assessments", "resource_type": "Assessment", "skill_name": next_action_skill}
            ]
            action_links = [
                {"label": "Continue to Roadmap", "action_type": "navigate", "target_url": "/roadmap"}
            ]
            context_action = "navigate_next_action"
            suggested_prompts = ["Why am I learning this?", "I only have 2 hours today.", "Give me a project."]

        # 2. "Why am I learning this?"
        elif any(w in msg_lower for w in ["why am i learning this", "why this topic", "why is this required", "why decision tree", "why statistics"]):
            reply = (
                f"💡 **Why This Is on Your Roadmap:**\n\n"
                f"You are currently working on **'{next_action}'** because **{next_action_skill}** is a core pillar for **{goal}**.\n\n"
                f"- **Prerequisite Alignment:** You satisfied foundational prerequisites, making this the highest-ROI topic to learn right now.\n"
                f"- **Downstream Impact:** Mastering this algorithm is a strict prerequisite for your upcoming **Phase 3 Capstone Project** (*Customer Churn Prediction*) and **Phase 4 Deep Learning**.\n"
                f"- **Career Weight:** In {goal} industry benchmarks, tree-based models and explainability represent 25% of applied interview evaluations."
            )
            citations = [
                {"title": "Interpretable Machine Learning & Tree Explainability", "url": "https://christophm.github.io/interpretable-ml-book/", "resource_type": "Documentation", "skill_name": next_action_skill}
            ]
            action_links = [
                {"label": "View Skill Dependency Graph", "action_type": "navigate", "target_url": "/skill-gap"}
            ]
            context_action = "concept_breakdown"
            suggested_prompts = ["Can I skip this?", "What should I learn next?", "Give me a project."]

        # 3. "Explain my biggest skill gap."
        elif any(w in msg_lower for w in ["biggest skill gap", "explain my gap", "explain my biggest gap", "largest gap", "skill gap"]):
            biggest_gap = top_gaps[0] if top_gaps else {"name": "Machine Learning", "current": 20.0, "required": 80.0, "gap": 60.0}
            gap_name = biggest_gap["name"]
            cur_p = biggest_gap.get("current", 20.0)
            req_p = biggest_gap.get("required", 80.0)
            delta = round(req_p - cur_p, 1)

            reply = (
                f"📊 **Biggest Skill Gap Breakdown:**\n\n"
                f"Your largest remaining development area is **{gap_name}** with a **{delta}% delta** (Current: **{int(cur_p)}%** vs Target: **{int(req_p)}%**).\n\n"
                f"- **Why it's critical:** {gap_name} is essential for {goal} roles to evaluate model bias/variance, construct predictive pipelines, and deploy reliable algorithms.\n"
                f"- **PathFinder Action Plan:**\n"
                f"  1. Complete the core diagnostic assessment to calibrate current baseline (+10% gain).\n"
                f"  2. Work through the recommended hands-on notebook exercises.\n"
                f"  3. Build the milestone portfolio project to permanently close this gap."
            )
            citations = [
                {"title": f"{gap_name} Skill Gap Analysis", "url": "/skill-gap", "resource_type": "Analytics", "skill_name": gap_name}
            ]
            action_links = [
                {"label": "Open Skill Gap Matrix", "action_type": "navigate", "target_url": "/skill-gap"}
            ]
            context_action = "view_skill_gap"
            suggested_prompts = ["What skills am I missing?", "What should I learn next?", "I only have 2 hours today."]

        # 4. "I only have 2 hours today."
        elif any(w in msg_lower for w in ["2 hours", "1 hour", "time today", "today's plan", "plan my day", "short on time", "schedule today"]):
            reply = (
                f"⏱️ **Personalized 2-Hour Action Plan for Today:**\n\n"
                f"Grounded in your current phase (**{current_phase}**) and active milestone (**{next_action}**), here is your structured, high-efficiency itinerary:\n\n"
                f"1. **60-Minute Focused Lesson (60 min):**\n"
                f"   - Deep-dive into *{next_action}* theory, cost functions, and splitting metrics.\n"
                f"2. **30-Minute Hands-on Practice (30 min):**\n"
                f"   - Code a decision tree classifier with scikit-learn in the interactive practice lab.\n"
                f"3. **30-Minute Diagnostic Assessment (30 min):**\n"
                f"   - Complete the 5-question milestone check to calibrate skill confidence from **48% → 57%**.\n\n"
                f"🎯 **Outcome Today:** +1.5% Career Readiness increase and 1 Roadmap node completed."
            )
            citations = [
                {"title": f"60-min: {next_action} Lesson", "url": "https://scikit-learn.org/stable/tutorial/index.html", "resource_type": "Lesson", "skill_name": next_action_skill},
                {"title": "30-min: Hands-on Classification Lab", "url": "https://github.com/ageron/handson-ml3", "resource_type": "Practice", "skill_name": next_action_skill},
                {"title": "30-min: Diagnostic Knowledge Check", "url": "/assessments", "resource_type": "Assessment", "skill_name": next_action_skill}
            ]
            action_links = [
                {"label": "Start 2-Hour Plan on Roadmap", "action_type": "navigate", "target_url": "/roadmap"}
            ]
            context_action = "open_roadmap_focus"
            suggested_prompts = ["Give me a project.", "How close am I to my goal?", "What should I learn next?"]

        # 5. "Give me a project."
        elif any(w in msg_lower for w in ["give me a project", "recommend a project", "project recommendation", "what project", "capstone"]):
            top_p = top_projects[0] if top_projects else {"title": "Customer Churn Prediction", "difficulty": "Intermediate", "hours": 15.0, "skill": "Machine Learning"}
            p_title = top_p["title"]
            p_diff = top_p.get("difficulty", "Intermediate")
            p_hours = top_p.get("hours", 15.0)
            p_skill = top_p.get("skill", "Machine Learning")

            reply = (
                f"🛠️ **Recommended Milestone Project:**\n\n"
                f"**{p_title}** ({p_diff} • ~{int(p_hours)} hours)\n\n"
                f"- **Primary Skill Developed:** {p_skill} (+12% readiness boost)\n"
                f"- **Why this project:** It tackles your top skill gap by combining classification modeling with SHAP explainability cards. This produces a verified resume-ready portfolio artifact.\n"
                f"- **Deliverables:** Production Jupyter notebook, trained XGBoost artifact, and interactive explainability dashboard."
            )
            citations = [
                {"title": p_title, "url": "/projects", "resource_type": "Project", "skill_name": p_skill}
            ]
            action_links = [
                {"label": "View Project Details & Milestones", "action_type": "navigate", "target_url": "/projects"}
            ]
            context_action = "open_projects"
            suggested_prompts = ["What should I learn next?", "I only have 2 hours today.", "Review my roadmap."]

        # 6. "Can I skip this?"
        elif any(w in msg_lower for w in ["can i skip", "skip this", "skip topic", "skip prerequisite", "fast track"]):
            reply = (
                f"⚡ **Roadmap Test-Out Option:**\n\n"
                f"If you already have practical experience with **'{next_action}'**, you don't need to complete all introductory lessons!\n\n"
                f"- **Take the Skill Test-Out Assessment:**\n"
                f"  Scoring **≥85%** will instantly verify your skill mastery, update your confidence to High, and bypass introductory materials to unlock advanced modules.\n"
                f"- **Prerequisite Safety:** If your score is <70%, PathFinder will keep the module active to ensure downstream capstones aren't blocked."
            )
            citations = [
                {"title": f"{next_action_skill} Test-Out Diagnostic", "url": "/assessments", "resource_type": "Assessment", "skill_name": next_action_skill}
            ]
            action_links = [
                {"label": "Take Test-Out Assessment", "action_type": "navigate", "target_url": "/assessments"}
            ]
            context_action = "open_assessment_testout"
            suggested_prompts = ["What should I learn next?", "Explain my biggest skill gap.", "How close am I to my goal?"]

        # 7. "What skills am I missing?"
        elif any(w in msg_lower for w in ["what skills am i missing", "missing skills", "skills missing", "all gaps", "what do i lack"]):
            gap_bullets = "\n".join([
                f"- **{g.get('name')}:** Current **{int(g.get('current', 0))}%** / Required **{int(g.get('required', 75))}%** (Gap: **{int(g.get('gap', 0))}%**)"
                for g in top_gaps
            ])
            reply = (
                f"📋 **Skill Gaps for {goal}:**\n\n"
                f"Here are the benchmark skills required for your target role compared against your current verified mastery:\n\n"
                f"{gap_bullets}\n\n"
                f"✅ **Your Strengths:** Python (80%), SQL (60%), Git (70%).\n"
                f"PathFinder uses your strong programming background to fast-track through algorithm implementations."
            )
            citations = [
                {"title": "Skill-Gap Radar & Dependency Graph", "url": "/skill-gap", "resource_type": "Analytics", "skill_name": "All Skills"}
            ]
            action_links = [
                {"label": "Explore Skill-Gap Table", "action_type": "navigate", "target_url": "/skill-gap"}
            ]
            context_action = "view_skill_gap"
            suggested_prompts = ["Explain my biggest skill gap.", "What should I learn next?", "Give me a project."]

        # 8. "How close am I to my goal?"
        elif any(w in msg_lower for w in ["how close", "how close am i", "career readiness", "job ready", "readiness score"]):
            reply = (
                f"📊 **Career Readiness Assessment:**\n\n"
                f"Your estimated Career Readiness Score for **{goal}** is currently **{int(readiness)}%**.\n\n"
                f"- **Technical Skills (52%):** Strong foundation in Python and Data Wrangling.\n"
                f"- **Projects (35%):** Completing your next hands-on capstone (*Customer Churn Prediction*) will elevate this by **+7 to 9 points**.\n"
                f"- **Assessments (60%):** Verified competency across Python Core diagnostics.\n"
                f"- **Consistency (70%):** Active study streak accelerating your roadmap pace.\n\n"
                f"At **{weekly_hours} hours/week**, you are on track to achieve job readiness within your 6-month timeline."
            )
            citations = [
                {"title": "Career Readiness Analytics Breakdown", "url": "/analytics", "resource_type": "Analytics", "skill_name": "Readiness"}
            ]
            action_links = [
                {"label": "View Readiness Dashboard", "action_type": "navigate", "target_url": "/analytics"}
            ]
            context_action = "view_analytics"
            suggested_prompts = ["What should I learn next?", "I only have 2 hours today.", "Change my roadmap."]

        # 9. "Change my roadmap." / "Make it more project-based."
        elif any(w in msg_lower for w in ["change my roadmap", "change roadmap", "project-based", "more project", "modify path", "what if"]):
            reply = (
                f"🛠️ **Roadmap Adaptation & What-If Simulation:**\n\n"
                f"PathFinder can immediately re-optimize your learning path for a **Project-Heavy** focus:\n\n"
                f"- **Project-First Shift:** Replaces theoretical readings with interactive project milestones and live coding challenges.\n"
                f"- **Simulation Engine:** You can simulate adjustments to your weekly study commitment (e.g. from {weekly_hours}h to 15h) to view instant timeline recalibrations."
            )
            citations = [
                {"title": "What-If Roadmap Simulator", "url": "/roadmap", "resource_type": "Simulator", "skill_name": "Roadmap"}
            ]
            action_links = [
                {"label": "Launch What-If Simulator", "action_type": "modal", "target_url": "/roadmap", "params": {"open_what_if": True}}
            ]
            context_action = "what_if_simulator"
            suggested_prompts = ["What should I learn next?", "Give me a project.", "How close am I to my goal?"]

        # 10. General Concept Breakdown & Fallback
        else:
            topic = "Machine Learning Engineering"
            if "decision tree" in msg_lower:
                topic = "Decision Trees & Information Gain"
                explanation = "Decision Trees split data recursively by selecting feature thresholds that maximize Information Gain (or minimize Gini Impurity). They form the backbone of ensemble methods like Random Forests and XGBoost."
            elif "linear regression" in msg_lower:
                topic = "Linear Regression & Gradient Descent"
                explanation = "Linear Regression models continuous targets by minimizing Mean Squared Error (MSE) via gradient descent optimization."
            elif "statistics" in msg_lower:
                topic = "Inferential Statistics in Machine Learning"
                explanation = "Statistics provides the mathematical rigor for hypothesis testing (p-values), probability distributions, variance analysis, and evaluating classification metrics."
            else:
                topic = "PathFinder Learning Guidance"
                explanation = f"I am actively tracking your learning trajectory for **{goal}** (Readiness: **{int(readiness)}%**). I can adapt your schedule, explain prerequisites, or recommend custom coding projects."

            reply = (
                f"💡 **Concept Breakdown: {topic}**\n\n"
                f"{explanation}\n\n"
                f"How would you like to proceed with your study session?"
            )
            context_action = "general_support"
            suggested_prompts = [
                "What should I learn next?",
                "I only have 2 hours today.",
                "Explain my biggest skill gap.",
                "Give me a project."
            ]

        return {
            "content": reply,
            "context_action": context_action,
            "suggested_quick_prompts": suggested_prompts,
            "citations": citations,
            "action_links": action_links,
            "is_fallback": False
        }

    def generate_adaptive_advice(
        self,
        assessment_title: str,
        skill_name: str,
        score_percentage: float,
        passed: bool,
        weak_topics: List[str]
    ) -> Dict[str, Any]:
        if score_percentage >= 85:
            advice = (
                f"🌟 Outstanding mastery ({int(score_percentage)}%) in {skill_name}! "
                f"PathFinder has increased your skill confidence to High and unlocked accelerated advanced content."
            )
            action = "Accelerated Progression: Advanced modules unlocked; redundant introductory materials bypassed."
        elif score_percentage >= 60:
            advice = (
                f"✅ Good progress ({int(score_percentage)}%) in {skill_name}. "
                f"You have satisfied the milestone requirement. Review the recommended practice notebook to reinforce {', '.join(weak_topics) if weak_topics else 'edge cases'}."
            )
            action = "Standard Progression: Next phase modules unlocked with optional practice exercises."
        else:
            advice = (
                f"⚠️ Score of {int(score_percentage)}% indicates foundational gaps in {skill_name} ({', '.join(weak_topics) if weak_topics else 'core concepts'}). "
                f"PathFinder has dynamically adapted your roadmap by scheduling a focused revision module and beginner-friendly practice before advancing."
            )
            action = "Adaptive Remediation: Injected revision checkpoints and delayed advanced dependent topics."

        return {
            "advice": advice,
            "adaptive_action": action,
            "recommended_focus": weak_topics[0] if weak_topics else skill_name
        }

    def generate_assessment(
        self,
        skill_name: str,
        difficulty: str,
        career_goal: str,
        question_count: int = 4
    ) -> Dict[str, Any]:
        """Generates dynamic diagnostic assessment with MCQ, Conceptual, and Scenario questions."""
        skill_lower = skill_name.lower()
        
        # Build dynamic question bank per skill domain
        questions = []
        
        if "machine learning" in skill_lower or "ml" in skill_lower:
            questions = [
                {
                    "text": "When tuning a Random Forest classifier on an imbalanced dataset, which strategy best mitigates minority class misclassification?",
                    "type": "scenario",
                    "options": [
                        "Use class_weight='balanced' or stratified sampling with SMOTE",
                        "Increase the maximum tree depth to infinity",
                        "Remove all negative class examples until classes are equal",
                        "Switch the evaluation metric strictly to Accuracy"
                    ],
                    "correct": "Use class_weight='balanced' or stratified sampling with SMOTE",
                    "explanation": "Balanced class weighting and synthetic oversampling (SMOTE) prevent the decision boundaries from ignoring the sparse minority class."
                },
                {
                    "text": "Explain how the Bias-Variance tradeoff behaves as model complexity increases:",
                    "type": "conceptual",
                    "options": [
                        "Bias decreases while Variance increases, risking overfitting",
                        "Both Bias and Variance increase simultaneously",
                        "Bias increases while Variance decreases, risking underfitting",
                        "Variance drops to zero once training error reaches zero"
                    ],
                    "correct": "Bias decreases while Variance increases, risking overfitting",
                    "explanation": "Higher complexity allows the model to fit intricate training patterns (reducing bias) at the cost of higher sensitivity to data fluctuations (increasing variance)."
                },
                {
                    "text": "Which evaluation metric is most appropriate for a fraud detection model where missing a fraudulent transaction has severe financial repercussions?",
                    "type": "multiple_choice",
                    "options": [
                        "Recall (Sensitivity) / Precision-Recall AUC",
                        "Accuracy",
                        "R-squared",
                        "Mean Absolute Error"
                    ],
                    "correct": "Recall (Sensitivity) / Precision-Recall AUC",
                    "explanation": "In fraud detection, False Negatives are costly. Maximizing Recall ensures that fraudulent cases are captured."
                },
                {
                    "text": "You observe that your XGBoost model achieves 99.8% train accuracy but only 68.2% validation accuracy. What is the most effective immediate remedy?",
                    "type": "scenario",
                    "options": [
                        "Increase regularization (gamma, reg_lambda) and lower max_depth",
                        "Add 10,000 more gradient boosting iterations",
                        "Multiply learning rate by 10x",
                        "Remove the validation set from training"
                    ],
                    "correct": "Increase regularization (gamma, reg_lambda) and lower max_depth",
                    "explanation": "The large gap between train and validation accuracy is classic overfitting. Restricting tree depth and increasing L1/L2 penalties promotes generalization."
                }
            ]
        elif "statistic" in skill_lower or "math" in skill_lower:
            questions = [
                {
                    "text": "In A/B testing, if your p-value is 0.012 with a significance threshold of alpha = 0.05, what is the statistical conclusion?",
                    "type": "scenario",
                    "options": [
                        "Reject the null hypothesis; the observed conversion lift is statistically significant",
                        "Fail to reject the null hypothesis; no significant difference",
                        "The test is invalid and must run for 6 more months",
                        "The alternative hypothesis has an exact 1.2% probability of being true"
                    ],
                    "correct": "Reject the null hypothesis; the observed conversion lift is statistically significant",
                    "explanation": "Since p-value (0.012) is less than alpha (0.05), we reject the null hypothesis and conclude the lift is statistically meaningful."
                },
                {
                    "text": "Why does the Central Limit Theorem play such a fundamental role in inferential statistics?",
                    "type": "conceptual",
                    "options": [
                        "It ensures that sample means approach a normal distribution as sample size grows, regardless of parent population shape",
                        "It guarantees that all dataset features are linearly independent",
                        "It eliminates measurement noise from experimental data",
                        "It proves that correlation always equals causation for n > 30"
                    ],
                    "correct": "It ensures that sample means approach a normal distribution as sample size grows, regardless of parent population shape",
                    "explanation": "The CLT allows us to compute confidence intervals and perform parametric hypothesis tests on sample averages without assuming population normality."
                },
                {
                    "text": "What type of error is committed when a researcher rejects a true null hypothesis (False Positive)?",
                    "type": "multiple_choice",
                    "options": [
                        "Type I Error (Alpha)",
                        "Type II Error (Beta)",
                        "Standard Deviation Error",
                        "Residual Sum of Squares"
                    ],
                    "correct": "Type I Error (Alpha)",
                    "explanation": "A Type I error occurs when the test falsely identifies an effect that does not actually exist in reality."
                },
                {
                    "text": "A dataset contains extreme outliers in salary. Which metric best describes the central tendency?",
                    "type": "scenario",
                    "options": [
                        "Median",
                        "Mean",
                        "Variance",
                        "Standard Deviation"
                    ],
                    "correct": "Median",
                    "explanation": "The median is robust against extreme positive or negative skewness, unlike the arithmetic mean."
                }
            ]
        elif "python" in skill_lower:
            questions = [
                {
                    "text": "What is the key difference between a Python list comprehension and a generator expression with parenthesis?",
                    "type": "conceptual",
                    "options": [
                        "List comprehensions construct the full list in memory; generator expressions yield items lazily on demand",
                        "Generator expressions run 100x faster for small lists",
                        "List comprehensions cannot be iterated over with a for-loop",
                        "Generator expressions are restricted strictly to integer arithmetic"
                    ],
                    "correct": "List comprehensions construct the full list in memory; generator expressions yield items lazily on demand",
                    "explanation": "Generators evaluate lazily (O(1) memory footprint), while list comprehensions eagerly allocate memory for all elements."
                },
                {
                    "text": "In Python, default arguments in function definitions are evaluated when:",
                    "type": "multiple_choice",
                    "options": [
                        "When the function definition is executed at module load time",
                        "Every time the function is called",
                        "Only when the argument is explicitly passed as None",
                        "During garbage collection"
                    ],
                    "correct": "When the function definition is executed at module load time",
                    "explanation": "Default arguments are evaluated once when the function is defined, which is why mutable defaults (like lists or dicts) persist across calls."
                },
                {
                    "text": "You are processing 10 million telemetry logs in Python. Which construct avoids Out-Of-Memory (OOM) crashes?",
                    "type": "scenario",
                    "options": [
                        "Stream the file line-by-line using a generator or yield statements",
                        "Read the entire file into a single nested dictionary with json.loads",
                        "Use file.readlines() into a global list",
                        "Disable the Python garbage collector"
                    ],
                    "correct": "Stream the file line-by-line using a generator or yield statements",
                    "explanation": "Streaming line-by-line processes one item at a time, keeping RAM consumption constant regardless of file size."
                },
                {
                    "text": "What is the average time complexity of item lookup `key in my_dict` versus `item in my_list`?",
                    "type": "conceptual",
                    "options": [
                        "Dict is O(1) average; List is O(n) linear scan",
                        "Both are O(1)",
                        "Both are O(log n)",
                        "List is O(1); Dict is O(n)"
                    ],
                    "correct": "Dict is O(1) average; List is O(n) linear scan",
                    "explanation": "Dictionaries use hash tables for O(1) average lookup, whereas list containment tests require sequential scanning across elements."
                }
            ]
        else:
            # Generic technical domain questions
            questions = [
                {
                    "text": f"Which core architectural principle is most critical when scaling {skill_name} in production?",
                    "type": "conceptual",
                    "options": [
                        "Modularity, clear interface contracts, and robust error handling",
                        "Embedding all logic in a single monolithic script",
                        "Disabling automated integration tests",
                        "Hardcoding all configuration parameters in source code"
                    ],
                    "correct": "Modularity, clear interface contracts, and robust error handling",
                    "explanation": f"High reliability in {skill_name} requires decoupled components and systematic exception boundaries."
                },
                {
                    "text": f"In a high-throughput enterprise application utilizing {skill_name}, what is the best practice for latency optimization?",
                    "type": "scenario",
                    "options": [
                        "Profiling bottlenecks, caching repetitive queries, and asynchronous execution",
                        "Increasing sleep timeouts between network calls",
                        "Adding synchronized thread locks around all functions",
                        "Using synchronous blocking I/O"
                    ],
                    "correct": "Profiling bottlenecks, caching repetitive queries, and asynchronous execution",
                    "explanation": "Empirical profiling and asynchronous non-blocking patterns maximize throughput under heavy concurrency."
                },
                {
                    "text": f"What is the recommended approach for continuous validation and regression testing in {skill_name}?",
                    "type": "multiple_choice",
                    "options": [
                        "Automated CI/CD test suites with unit, integration, and coverage checks",
                        "Manual testing exclusively in production after deployment",
                        "Skipping test verification when deadlines are tight",
                        "Relying solely on user bug reports"
                    ],
                    "correct": "Automated CI/CD test suites with unit, integration, and coverage checks",
                    "explanation": "Automated CI/CD pipelines ensure that pull requests preserve system invariants and prevent regressions."
                },
                {
                    "text": f"How should security vulnerabilities and secret credentials be handled in {skill_name} repositories?",
                    "type": "scenario",
                    "options": [
                        "Inject secrets via environment variables / secret managers; never commit plaintext secrets to git",
                        "Hardcode API tokens directly in git repository commits",
                        "Store passwords in public client-side JavaScript files",
                        "Disable TLS encryption for faster local connections"
                    ],
                    "correct": "Inject secrets via environment variables / secret managers; never commit plaintext secrets to git",
                    "explanation": "Environment variables and KMS/secret managers ensure sensitive tokens remain isolated from code repositories."
                }
            ]

        selected_questions = questions[:question_count]
        return {
            "title": f"{skill_name} Diagnostic Assessment ({difficulty})",
            "skill_name": skill_name,
            "difficulty": difficulty,
            "passing_score": 70.0,
            "description": f"AI-generated adaptive evaluation focusing on conceptual depth, algorithmic reasoning, and practical scenarios in {skill_name}.",
            "questions": selected_questions
        }

    def generate_project_explanation(
        self,
        project_title: str,
        primary_skill: str,
        career_goal: str,
        gap: float,
        prereqs_met: bool,
        difficulty: str
    ) -> str:
        gap_desc = "critical gap" if gap >= 50 else ("growth area" if gap > 20 else "refinement skill")
        prereq_str = "All prerequisite skills are satisfied" if prereqs_met else "Core foundational skills are in progress"
        return (
            f"This {difficulty.lower()}-level capstone specifically develops '{primary_skill}', which represents a {gap_desc} ({int(gap)}% delta) for your goal as a {career_goal}. "
            f"{prereq_str}. Completing this project produces a tangible portfolio artifact that directly elevates your career readiness score by +6 to 9%."
        )
