import json
import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    User, LearnerProfile, CareerGoal, Skill, CareerSkill, Prerequisite,
    LearningResource, Assessment, Question, AssessmentAttempt, Project,
    LearnerSkill, Progress, AIInsight, Roadmap, RoadmapPhase, RoadmapItem
)

def seed_database(db: Session):
    """Populates the database with realistic seed taxonomies, 50+ resources, and demo data."""
    if db.query(CareerGoal).first():
        return  # Already seeded

    print("Seeding PathFinder database...")

    # 1. Career Goals
    careers_data = [
        {
            "title": "AI/ML Engineer",
            "slug": "ai-ml-engineer",
            "description": "Design, train, and deploy production-grade machine learning models, neural networks, and scalable AI pipelines.",
            "category": "Artificial Intelligence",
            "required_experience_level": "Intermediate",
            "avg_salary": "$145,000/yr",
            "market_demand": "Very High"
        },
        {
            "title": "Data Scientist",
            "slug": "data-scientist",
            "description": "Extract actionable business insights, design statistical experiments, and build predictive machine learning models.",
            "category": "Data & Analytics",
            "required_experience_level": "Intermediate",
            "avg_salary": "$130,000/yr",
            "market_demand": "High"
        },
        {
            "title": "Full Stack Developer",
            "slug": "full-stack-developer",
            "description": "Build end-to-end responsive web applications using modern client frameworks, robust APIs, and scalable databases.",
            "category": "Software Engineering",
            "required_experience_level": "Intermediate",
            "avg_salary": "$120,000/yr",
            "market_demand": "Very High"
        },
        {
            "title": "Cloud Engineer",
            "slug": "cloud-engineer",
            "description": "Architect, automate, and maintain resilient cloud infrastructure, CI/CD deployment pipelines, and container clusters.",
            "category": "Cloud & DevOps",
            "required_experience_level": "Intermediate",
            "avg_salary": "$135,000/yr",
            "market_demand": "High"
        },
        {
            "title": "Cybersecurity Analyst",
            "slug": "cybersecurity-analyst",
            "description": "Protect organizational networks and assets by monitoring threats, conducting vulnerability assessments, and implementing defense controls.",
            "category": "Security",
            "required_experience_level": "Beginner",
            "avg_salary": "$115,000/yr",
            "market_demand": "High"
        },
        {
            "title": "Data Analyst",
            "slug": "data-analyst",
            "description": "Transform raw datasets into executive dashboards, business metrics, and strategic reporting using SQL, Python, and BI tools.",
            "category": "Data & Analytics",
            "required_experience_level": "Beginner",
            "avg_salary": "$95,000/yr",
            "market_demand": "High"
        }
    ]

    career_objs = {}
    for c in careers_data:
        cg = CareerGoal(**c)
        db.add(cg)
        db.flush()
        career_objs[c["title"]] = cg

    # 2. Skills
    skills_data = [
        {"name": "Python", "slug": "python", "category": "Programming", "difficulty_tier": "Beginner", "description": "Core syntax, OOP, data structures, and script automation."},
        {"name": "SQL", "slug": "sql", "category": "Databases", "difficulty_tier": "Beginner", "description": "Relational querying, aggregations, joins, window functions, and indexing."},
        {"name": "Mathematics", "slug": "mathematics", "category": "Foundations", "difficulty_tier": "Intermediate", "description": "Linear algebra, multivariate calculus, matrix operations, and optimization."},
        {"name": "Statistics", "slug": "statistics", "category": "Foundations", "difficulty_tier": "Intermediate", "description": "Probability distributions, hypothesis testing, Bayes theorem, and variance analysis."},
        {"name": "Data Structures", "slug": "data-structures", "category": "Computer Science", "difficulty_tier": "Intermediate", "description": "Arrays, trees, graphs, dynamic programming, and complexity analysis."},
        {"name": "Pandas & Data Cleaning", "slug": "pandas", "category": "Data Science", "difficulty_tier": "Beginner", "description": "Data wrangling, missing value imputation, transformations, and feature engineering."},
        {"name": "Data Visualization", "slug": "visualization", "category": "Data Science", "difficulty_tier": "Beginner", "description": "Matplotlib, Seaborn, interactive charting, and executive storytelling."},
        {"name": "Machine Learning", "slug": "machine-learning", "category": "AI/ML", "difficulty_tier": "Intermediate", "description": "Supervised/unsupervised algorithms, scikit-learn, regularization, and evaluation metrics."},
        {"name": "Deep Learning", "slug": "deep-learning", "category": "AI/ML", "difficulty_tier": "Advanced", "description": "Neural architectures, PyTorch, backpropagation, CNNs, Transformers, and optimization."},
        {"name": "NLP", "slug": "nlp", "category": "AI/ML", "difficulty_tier": "Advanced", "description": "Tokenization, embeddings, LLMs, RAG, Hugging Face transformers, and fine-tuning."},
        {"name": "Computer Vision", "slug": "computer-vision", "category": "AI/ML", "difficulty_tier": "Advanced", "description": "Image processing, OpenCV, object detection, segmentation, and vision models."},
        {"name": "MLOps & Deployment", "slug": "mlops", "category": "Engineering", "difficulty_tier": "Advanced", "description": "Model registry, Docker, FastAPI serving, monitoring, CI/CD, and drift detection."},
        {"name": "Git & Version Control", "slug": "git", "category": "Engineering", "difficulty_tier": "Beginner", "description": "Branching workflows, pull requests, merge conflict resolution, and CI triggers."},
        {"name": "Cloud Computing", "slug": "cloud", "category": "Infrastructure", "difficulty_tier": "Intermediate", "description": "AWS, GCP, cloud storage, IAM roles, serverless functions, and managed services."},
        {"name": "HTML & CSS", "slug": "html-css", "category": "Frontend", "difficulty_tier": "Beginner", "description": "Semantic markup, modern flexbox/grid layouts, responsiveness, and Tailwind."},
        {"name": "JavaScript & TypeScript", "slug": "javascript-typescript", "category": "Frontend", "difficulty_tier": "Intermediate", "description": "ES6+ async programming, type safety, generics, and DOM manipulation."},
        {"name": "React", "slug": "react", "category": "Frontend", "difficulty_tier": "Intermediate", "description": "Component architecture, hooks, state management, routing, and performance tuning."},
        {"name": "REST APIs & Backend", "slug": "backend-apis", "category": "Backend", "difficulty_tier": "Intermediate", "description": "FastAPI, Node/Express, authentication, middleware, and request validation."},
        {"name": "Docker & Containers", "slug": "docker", "category": "DevOps", "difficulty_tier": "Intermediate", "description": "Containerization, Dockerfile optimization, multi-stage builds, and Compose."},
        {"name": "Kubernetes", "slug": "kubernetes", "category": "DevOps", "difficulty_tier": "Advanced", "description": "Pod orchestration, services, deployments, ingress controllers, and Helm charts."},
        {"name": "Network Security", "slug": "network-security", "category": "Security", "difficulty_tier": "Intermediate", "description": "TCP/IP, firewalls, packet analysis, Wireshark, VPNs, and intrusion detection."},
        {"name": "Threat Modeling", "slug": "threat-modeling", "category": "Security", "difficulty_tier": "Intermediate", "description": "STRIDE methodology, risk assessment, vulnerability scanning, and pen testing."}
    ]

    skill_objs = {}
    for s in skills_data:
        sk = Skill(**s)
        db.add(sk)
        db.flush()
        skill_objs[s["name"]] = sk

    # 3. Career Skills Mapping (Required Proficiency 0-100, Importance 0.5-2.0, Tier)
    career_skills_map = [
        # AI/ML Engineer
        ("AI/ML Engineer", "Python", 85.0, 1.8, "Critical"),
        ("AI/ML Engineer", "Mathematics", 75.0, 1.4, "High"),
        ("AI/ML Engineer", "Statistics", 80.0, 1.6, "Critical"),
        ("AI/ML Engineer", "Data Structures", 70.0, 1.2, "High"),
        ("AI/ML Engineer", "Pandas & Data Cleaning", 80.0, 1.3, "High"),
        ("AI/ML Engineer", "Machine Learning", 85.0, 2.0, "Critical"),
        ("AI/ML Engineer", "Deep Learning", 80.0, 1.8, "Critical"),
        ("AI/ML Engineer", "NLP", 75.0, 1.5, "High"),
        ("AI/ML Engineer", "MLOps & Deployment", 80.0, 1.7, "Critical"),
        ("AI/ML Engineer", "Git & Version Control", 75.0, 1.1, "Medium"),
        ("AI/ML Engineer", "Cloud Computing", 70.0, 1.2, "High"),
        ("AI/ML Engineer", "SQL", 70.0, 1.1, "Medium"),

        # Data Scientist
        ("Data Scientist", "Python", 85.0, 1.8, "Critical"),
        ("Data Scientist", "SQL", 85.0, 1.9, "Critical"),
        ("Data Scientist", "Statistics", 90.0, 2.0, "Critical"),
        ("Data Scientist", "Pandas & Data Cleaning", 90.0, 1.8, "Critical"),
        ("Data Scientist", "Data Visualization", 85.0, 1.6, "High"),
        ("Data Scientist", "Machine Learning", 80.0, 1.7, "High"),
        ("Data Scientist", "Mathematics", 70.0, 1.3, "Medium"),
        ("Data Scientist", "Git & Version Control", 65.0, 1.0, "Medium"),

        # Full Stack Developer
        ("Full Stack Developer", "HTML & CSS", 85.0, 1.5, "High"),
        ("Full Stack Developer", "JavaScript & TypeScript", 90.0, 2.0, "Critical"),
        ("Full Stack Developer", "React", 85.0, 1.9, "Critical"),
        ("Full Stack Developer", "REST APIs & Backend", 85.0, 1.8, "Critical"),
        ("Full Stack Developer", "SQL", 80.0, 1.5, "High"),
        ("Full Stack Developer", "Git & Version Control", 80.0, 1.2, "High"),
        ("Full Stack Developer", "Docker & Containers", 70.0, 1.1, "Medium"),

        # Cloud Engineer
        ("Cloud Engineer", "Cloud Computing", 90.0, 2.0, "Critical"),
        ("Cloud Engineer", "Docker & Containers", 85.0, 1.8, "Critical"),
        ("Cloud Engineer", "Kubernetes", 85.0, 1.9, "Critical"),
        ("Cloud Engineer", "Python", 75.0, 1.3, "High"),
        ("Cloud Engineer", "Git & Version Control", 80.0, 1.3, "High"),
        ("Cloud Engineer", "Network Security", 75.0, 1.4, "High"),

        # Cybersecurity Analyst
        ("Cybersecurity Analyst", "Network Security", 90.0, 2.0, "Critical"),
        ("Cybersecurity Analyst", "Threat Modeling", 85.0, 1.9, "Critical"),
        ("Cybersecurity Analyst", "Python", 70.0, 1.2, "Medium"),
        ("Cybersecurity Analyst", "Cloud Computing", 75.0, 1.4, "High"),
        ("Cybersecurity Analyst", "SQL", 65.0, 1.0, "Medium"),

        # Data Analyst
        ("Data Analyst", "SQL", 90.0, 2.0, "Critical"),
        ("Data Analyst", "Data Visualization", 90.0, 1.9, "Critical"),
        ("Data Analyst", "Pandas & Data Cleaning", 80.0, 1.7, "High"),
        ("Data Analyst", "Python", 70.0, 1.4, "High"),
        ("Data Analyst", "Statistics", 75.0, 1.5, "High")
    ]

    for career_name, skill_name, req_prof, weight, tier in career_skills_map:
        cg = career_objs[career_name]
        sk = skill_objs[skill_name]
        db.add(CareerSkill(
            career_id=cg.id,
            skill_id=sk.id,
            required_proficiency=req_prof,
            importance_weight=weight,
            priority_tier=tier
        ))

    # 4. Prerequisites (Prerequisite -> Dependent Skill)
    prereq_rules = [
        ("Python", "Pandas & Data Cleaning", 60.0),
        ("Python", "Data Structures", 65.0),
        ("Python", "Machine Learning", 70.0),
        ("Mathematics", "Machine Learning", 65.0),
        ("Statistics", "Machine Learning", 70.0),
        ("Machine Learning", "Deep Learning", 75.0),
        ("Deep Learning", "NLP", 75.0),
        ("Deep Learning", "Computer Vision", 75.0),
        ("Machine Learning", "MLOps & Deployment", 70.0),
        ("Docker & Containers", "MLOps & Deployment", 65.0),
        ("HTML & CSS", "JavaScript & TypeScript", 60.0),
        ("JavaScript & TypeScript", "React", 70.0),
        ("JavaScript & TypeScript", "REST APIs & Backend", 65.0),
        ("Docker & Containers", "Kubernetes", 70.0),
        ("Cloud Computing", "Kubernetes", 65.0),
        ("Network Security", "Threat Modeling", 70.0)
    ]

    for req_name, dep_name, min_prof in prereq_rules:
        req_sk = skill_objs[req_name]
        dep_sk = skill_objs[dep_name]
        db.add(Prerequisite(
            skill_id=dep_sk.id,
            prerequisite_skill_id=req_sk.id,
            min_proficiency_required=min_prof
        ))

    # 5. Seed 50+ Learning Resources
    resources_data = [
        # Python
        ("Python 3 Core Mastery & Idiomatic Code", "Course", "PathFinder Curated", "Python", "Beginner", 6.0, 4.9, "https://docs.python.org/3/tutorial/", "Master Python syntax, list comprehensions, generators, type hints, and clean OOP architecture.", True, True, False, "Mixed"),
        ("Python Data Structures & Algorithm Design", "Tutorial", "Real Python", "Python", "Intermediate", 4.5, 4.8, "https://realpython.com/python-data-structures/", "In-depth guide to sets, deques, heaps, and writing time-efficient algorithms.", True, True, False, "Hands-on"),
        
        # Mathematics
        ("Linear Algebra for Machine Learning", "Course", "MIT OpenCourseWare", "Mathematics", "Intermediate", 8.0, 4.9, "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", "Vectors, matrix decompositions, eigenvalues, PCA mathematical foundations.", True, False, False, "Reading"),
        ("Multivariate Calculus & Optimization", "Video", "Khan Academy", "Mathematics", "Intermediate", 5.0, 4.8, "https://www.khanacademy.org/math/multivariable-calculus", "Gradient descent mechanics, partial derivatives, chain rule for backpropagation.", True, True, False, "Video"),

        # Statistics
        ("Applied Statistics & Hypothesis Testing", "Course", "Stanford Online", "Statistics", "Intermediate", 7.0, 4.9, "https://online.stanford.edu/courses/stats110-probability-and-statistics", "Probability distributions, p-values, A/B testing, and Bayesian inference.", True, True, False, "Hands-on"),
        ("Practical Statistics for Data Scientists", "Tutorial", "O'Reilly Open", "Statistics", "Beginner", 4.0, 4.7, "https://github.com/gedeck/practical-statistics-for-data-scientists", "Code-first statistical methods for regression, classification, and resampling.", True, True, True, "Hands-on"),

        # SQL
        ("Modern PostgreSQL & Window Functions", "Tutorial", "PostgreSQL Tutorial", "SQL", "Intermediate", 5.0, 4.9, "https://www.postgresqltutorial.com/", "Master CTEs, partition window functions, performance indexing, and JSONB queries.", True, True, False, "Hands-on"),
        ("SQL for High-Scale Data Analysis", "Course", "Mode Analytics", "SQL", "Beginner", 4.0, 4.8, "https://mode.com/sql-tutorial/", "Real-world business queries, cohort retention analysis, and complex multi-table joins.", True, True, True, "Hands-on"),

        # Data Structures
        ("Data Structures & Algorithms in Python", "Course", "NeetCode", "Data Structures", "Intermediate", 10.0, 4.9, "https://neetcode.io/", "Visualizing dynamic programming, graphs, binary trees, and complexity trade-offs.", True, True, False, "Video"),

        # Pandas
        ("Pandas for High-Performance Data Wrangling", "Documentation", "PyData", "Pandas & Data Cleaning", "Beginner", 5.0, 4.8, "https://pandas.pydata.org/docs/getting_started/index.html", "Efficient data frames, groupby transforms, handling missing values, and vectorization.", True, True, False, "Hands-on"),
        ("Feature Engineering Masterclass", "Tutorial", "Kaggle Learn", "Pandas & Data Cleaning", "Intermediate", 3.5, 4.9, "https://www.kaggle.com/learn/feature-engineering", "Target encoding, categorical embeddings, normalization, and scaling techniques.", True, True, True, "Project-based"),

        # Visualization
        ("Interactive Data Storytelling with Seaborn & Plotly", "Tutorial", "DataCamp", "Data Visualization", "Beginner", 4.0, 4.7, "https://plotly.com/python/", "Building multi-dimensional interactive charts, heatmaps, and dashboard visuals.", True, True, False, "Hands-on"),

        # Machine Learning
        ("Scikit-Learn Machine Learning Pipeline Design", "Course", "Scikit-Learn Docs", "Machine Learning", "Intermediate", 8.0, 4.9, "https://scikit-learn.org/stable/tutorial/index.html", "Decision trees, Random Forests, Gradient Boosting, hyperparameter tuning, and cross-validation.", True, True, True, "Mixed"),
        ("Interpretable Machine Learning & Bias-Variance", "Article", "Christoph Molnar", "Machine Learning", "Intermediate", 3.0, 4.8, "https://christophm.github.io/interpretable-ml-book/", "SHAP values, LIME, feature importance, and model explainability frameworks.", True, False, False, "Reading"),
        ("Hands-on Classification & Regression Workshop", "Practice", "PathFinder Labs", "Machine Learning", "Beginner", 4.0, 4.9, "https://github.com/ageron/handson-ml3", "End-to-end model building from raw data to evaluation matrices.", True, True, True, "Project-based"),

        # Deep Learning
        ("PyTorch Deep Learning Zero to Mastery", "Course", "PyTorch.org", "Deep Learning", "Advanced", 12.0, 4.9, "https://pytorch.org/tutorials/", "Tensors, autograd, custom neural layers, CUDA GPU acceleration, and training loops.", True, True, True, "Hands-on"),
        ("Convolutional Neural Networks & Vision Backbones", "Video", "DeepLearning.AI", "Deep Learning", "Advanced", 6.0, 4.8, "https://www.deeplearning.ai/courses/deep-learning-specialization/", "Residual networks, attention mechanisms, loss landscape optimization.", True, True, False, "Video"),

        # NLP
        ("Hugging Face Transformers & LLM Engineering", "Course", "Hugging Face", "NLP", "Advanced", 10.0, 5.0, "https://huggingface.co/learn/nlp-course/chapter1/1", "Tokenizers, fine-tuning BERT/RoBERTa, building RAG systems with LangChain and vector databases.", True, True, True, "Project-based"),
        ("Building Production RAG Pipelines", "Tutorial", "LlamaIndex", "NLP", "Advanced", 5.0, 4.9, "https://docs.llamaindex.ai/", "Vector index chunking, retrieval evaluation, hybrid search, and prompt synthesis.", True, True, True, "Hands-on"),

        # Computer Vision
        ("Real-time Object Detection with OpenCV & YOLO", "Course", "Ultralytics", "Computer Vision", "Advanced", 6.0, 4.8, "https://docs.ultralytics.com/", "YOLOv8 architecture, bounding box regression, video inference, and transfer learning.", True, True, True, "Hands-on"),

        # MLOps
        ("Full-Stack MLOps: Serving, Monitoring & CI/CD", "Course", "Made With ML", "MLOps & Deployment", "Advanced", 10.0, 5.0, "https://madewithml.com/", "FastAPI model serving, MLflow tracking, Docker containerization, Evidentially AI drift detection.", True, True, True, "Project-based"),
        ("Docker for Machine Learning Engineers", "Tutorial", "Docker Docs", "MLOps & Deployment", "Intermediate", 4.0, 4.8, "https://docs.docker.com/get-started/", "Creating lightweight CUDA Docker images, volume mounts, and reproducible runtime environments.", True, True, False, "Hands-on"),

        # Git
        ("Pro Git: Branching, Rebasing & CI Workflows", "Documentation", "Git SCM", "Git & Version Control", "Beginner", 3.0, 4.8, "https://git-scm.com/book/en/v2", "Mastering Git commit DAGs, interactive rebasing, feature branches, and GitHub Actions.", True, True, False, "Reading"),

        # Cloud Computing
        ("Cloud Architecture Fundamentals (AWS & GCP)", "Course", "AWS Training", "Cloud Computing", "Intermediate", 8.0, 4.8, "https://aws.amazon.com/training/", "S3, EC2, IAM policies, Lambda serverless, and VPC networking fundamentals.", True, True, False, "Mixed"),

        # Frontend
        ("Modern Semantic HTML5 & CSS Grid Layouts", "Course", "MDN Web Docs", "HTML & CSS", "Beginner", 4.0, 4.9, "https://developer.mozilla.org/en-US/docs/Learn", "Accessible semantics, responsive CSS Grid, Flexbox, and CSS Custom Properties.", True, True, False, "Hands-on"),
        ("TypeScript in 50 Lessons: Types & Generics", "Tutorial", "TypeScript Docs", "JavaScript & TypeScript", "Intermediate", 6.0, 4.9, "https://www.typescriptlang.org/docs/", "Interfaces, union types, generics, type narrowing, and strict compile options.", True, True, False, "Hands-on"),
        ("React 18 Architecture: Hooks, State & Context", "Course", "React.dev", "React", "Intermediate", 8.0, 5.0, "https://react.dev/learn", "Declarative UI, custom hooks, useEffect lifecycle synchronization, and performance memoization.", True, True, True, "Hands-on"),
        ("Building Robust RESTful APIs with FastAPI", "Course", "Tiangolo FastAPI", "REST APIs & Backend", "Intermediate", 6.0, 4.9, "https://fastapi.tiangolo.com/tutorial/", "Async endpoints, Pydantic schemas, dependency injection, OAuth2 JWT auth.", True, True, True, "Hands-on"),

        # DevOps & Security
        ("Docker & Kubernetes Microservices Orchestration", "Course", "Kubernetes.io", "Kubernetes", "Advanced", 12.0, 4.9, "https://kubernetes.io/docs/tutorials/", "Deployments, Service meshes, ConfigMaps, Secrets, Ingress, and auto-scaling.", True, True, True, "Hands-on"),
        ("Network Security Defense & Packet Analysis", "Course", "Cybrary", "Network Security", "Intermediate", 7.0, 4.8, "https://www.cybrary.it/", "TCP handshakes, SSL/TLS handshakes, Wireshark packet capture, and firewall configuration.", True, True, False, "Mixed"),
        ("Application Threat Modeling & STRIDE Framework", "Article", "OWASP", "Threat Modeling", "Intermediate", 4.0, 4.9, "https://owasp.org/www-community/Threat_Modeling", "Identifying security attack vectors, privilege escalation risks, and mitigation strategies.", True, False, False, "Reading")
    ]

    for title, rtype, provider, skill_name, diff, dur, rating, url, desc, is_free, is_hands, is_proj, lstyle in resources_data:
        sk = skill_objs.get(skill_name)
        if sk:
            db.add(LearningResource(
                primary_skill_id=sk.id,
                title=title,
                type=rtype,
                provider=provider,
                difficulty=diff,
                duration_hours=dur,
                rating=rating,
                url=url,
                description=desc,
                is_free=is_free,
                is_hands_on=is_hands,
                project_oriented=is_proj,
                learning_style_tag=lstyle,
                quality_score=94.0,
                prerequisites_summary=f"Foundational proficiency in core {skill_name}"
            ))


    # 6. Seed Assessments & Questions
    ml_skill = skill_objs["Machine Learning"]
    stats_skill = skill_objs["Statistics"]
    python_skill = skill_objs["Python"]

    assessments_data = [
        {
            "title": "Machine Learning Core Competency Check",
            "skill": ml_skill,
            "difficulty": "Intermediate",
            "passing_score": 70.0,
            "description": "Evaluate your understanding of supervised learning algorithms, bias-variance tradeoff, and evaluation metrics.",
            "questions": [
                {
                    "text": "What occurs when a model exhibits high variance?",
                    "type": "conceptual",
                    "options": json.dumps([
                        "It underfits both training and test data",
                        "It captures noise and overfits training data with poor test generalization",
                        "It has too few parameters to learn patterns",
                        "It has zero gradient during backpropagation"
                    ]),
                    "correct": "It captures noise and overfits training data with poor test generalization",
                    "explanation": "High variance means the model fits the training set too closely (overfitting), making it sensitive to small fluctuations and failing to generalize."
                },
                {
                    "text": "Which metric is most appropriate for evaluating a model on an imbalanced classification dataset with rare fraud cases?",
                    "type": "scenario",
                    "options": json.dumps([
                        "Standard Accuracy",
                        "Precision-Recall AUC (PR-AUC) or F1-Score",
                        "Mean Squared Error (MSE)",
                        "R-Squared"
                    ]),
                    "correct": "Precision-Recall AUC (PR-AUC) or F1-Score",
                    "explanation": "In highly imbalanced datasets, Accuracy is misleading because predicting only the majority class yields high accuracy. PR-AUC and F1 measure true positive recall against precision."
                },
                {
                    "text": "How do Decision Trees choose the best split at each node in classification?",
                    "type": "conceptual",
                    "options": json.dumps([
                        "By maximizing Gini Impurity",
                        "By maximizing Information Gain (or minimizing Gini/Entropy)",
                        "By performing matrix inversion",
                        "By randomly sampling features without replacement"
                    ]),
                    "correct": "By maximizing Information Gain (or minimizing Gini/Entropy)",
                    "explanation": "Decision trees split nodes to maximize the reduction of impurity (Information Gain), creating purer child nodes."
                },
                {
                    "text": "What is the primary purpose of L2 Regularization (Ridge) in linear models?",
                    "type": "multiple_choice",
                    "options": json.dumps([
                        "To force coefficients to exactly zero for feature selection",
                        "To penalize the sum of squared coefficients and prevent extreme weights",
                        "To speed up GPU inference",
                        "To transform non-linear features into linear space"
                    ]),
                    "correct": "To penalize the sum of squared coefficients and prevent extreme weights",
                    "explanation": "L2 regularization adds a penalty proportional to the square of coefficient magnitudes, shrinking weights to curb overfitting."
                }
            ]
        },
        {
            "title": "Applied Statistics & Probability Milestone",
            "skill": stats_skill,
            "difficulty": "Intermediate",
            "passing_score": 70.0,
            "description": "Test understanding of hypothesis testing, p-values, Bayes rule, and sampling distributions.",
            "questions": [
                {
                    "text": "In hypothesis testing, what does a p-value of 0.03 indicate when alpha = 0.05?",
                    "type": "scenario",
                    "options": json.dumps([
                        "The null hypothesis is 97% true",
                        "There is statistically significant evidence to reject the null hypothesis",
                        "The test failed due to inadequate sample size",
                        "The alternative hypothesis is proven impossible"
                    ]),
                    "correct": "There is statistically significant evidence to reject the null hypothesis",
                    "explanation": "Since p-value (0.03) < alpha (0.05), we reject the null hypothesis in favor of the alternative hypothesis."
                },
                {
                    "text": "According to the Central Limit Theorem, the distribution of sample means approaches a normal distribution as sample size grows:",
                    "type": "conceptual",
                    "options": json.dumps([
                        "Only if the underlying population distribution is perfectly normal",
                        "Regardless of the shape of the underlying population distribution (given finite variance)",
                        "Only for discrete binary variables",
                        "Only when sample size exceeds 1,000,000"
                    ]),
                    "correct": "Regardless of the shape of the underlying population distribution (given finite variance)",
                    "explanation": "The Central Limit Theorem guarantees asymptotic normality for sample means across non-normal parent distributions given sufficient n."
                },
                {
                    "text": "Which probability theorem calculates posterior probability by updating prior probability with new evidence?",
                    "type": "multiple_choice",
                    "options": json.dumps([
                        "Bayes' Theorem",
                        "Markov Inequality",
                        "Chebyshev's Theorem",
                        "Law of Large Numbers"
                    ]),
                    "correct": "Bayes' Theorem",
                    "explanation": "Bayes' Theorem relates conditional probability P(A|B) to prior P(A) and likelihood P(B|A)."
                }
            ]
        },
        {
            "title": "Python Core Diagnostics",
            "skill": python_skill,
            "difficulty": "Beginner",
            "passing_score": 75.0,
            "description": "Verify mastery of Python data types, list comprehensions, and memory references.",
            "questions": [
                {
                    "text": "What is the time complexity of searching for a key in a standard Python dictionary on average?",
                    "type": "multiple_choice",
                    "options": json.dumps([
                        "O(1)",
                        "O(n)",
                        "O(log n)",
                        "O(n log n)"
                    ]),
                    "correct": "O(1)",
                    "explanation": "Python dictionaries are implemented as hash tables, providing average O(1) constant time lookup."
                },
                {
                    "text": "What occurs when mutable objects like lists are passed as default arguments in Python function definitions?",
                    "type": "conceptual",
                    "options": json.dumps([
                        "The default list is re-created freshly on every call",
                        "The default list is instantiated once at definition time and shared across all subsequent invocations",
                        "Python throws a SyntaxError",
                        "The list is converted into an immutable tuple automatically"
                    ]),
                    "correct": "The default list is instantiated once at definition time and shared across all subsequent invocations",
                    "explanation": "Default argument values are bound when the function is defined, causing mutations to persist across calls."
                },
                {
                    "text": "You are reading a 20GB server log file on a machine with 4GB RAM. How do you process it efficiently in Python?",
                    "type": "scenario",
                    "options": json.dumps([
                        "Stream the file line-by-line using `with open(filepath) as f: for line in f:`",
                        "Load the entire file into a Python list using `f.readlines()`",
                        "Convert the entire log to JSON and load with `json.loads()`",
                        "Increase Python stack size recursion limit"
                    ]),
                    "correct": "Stream the file line-by-line using `with open(filepath) as f: for line in f:`",
                    "explanation": "Iterating over file handles in Python evaluates lazily, maintaining constant O(1) memory usage."
                }
            ]
        },
        {
            "title": "Deep Learning & Neural Architectures Benchmark",
            "skill": skill_objs["Deep Learning"],
            "difficulty": "Advanced",
            "passing_score": 75.0,
            "description": "Examine backpropagation, vanishing gradients, attention mechanisms, and convolutional operators.",
            "questions": [
                {
                    "text": "Why do Residual Networks (ResNets) mitigate the vanishing gradient problem in extremely deep networks?",
                    "type": "conceptual",
                    "options": json.dumps([
                        "Identity skip connections allow gradients to flow directly backwards without undergoing multiplicative attenuation",
                        "They remove all non-linear activation functions",
                        "They replace backpropagation with genetic algorithms",
                        "They restrict tensor weights strictly to positive values"
                    ]),
                    "correct": "Identity skip connections allow gradients to flow directly backwards without undergoing multiplicative attenuation",
                    "explanation": "Skip connections create gradient highways allowing uninterrupted backpropagation through hundreds of layers."
                },
                {
                    "text": "In Transformer self-attention, what is the computational complexity of standard scaled dot-product attention with sequence length N?",
                    "type": "multiple_choice",
                    "options": json.dumps([
                        "O(N^2)",
                        "O(N)",
                        "O(N log N)",
                        "O(1)"
                    ]),
                    "correct": "O(N^2)",
                    "explanation": "Pairwise query-key dot products require computing an N x N attention matrix, yielding quadratic O(N^2) complexity with respect to sequence length."
                },
                {
                    "text": "Your PyTorch training loop suffers from gradient explosion, causing loss to display NaN. What is the most immediate stabilizing remedy?",
                    "type": "scenario",
                    "options": json.dumps([
                        "Apply gradient clipping (`torch.nn.utils.clip_grad_norm_`) and reduce learning rate",
                        "Remove all dropout layers",
                        "Multiply initial weights by 100",
                        "Disable batch normalization"
                    ]),
                    "correct": "Apply gradient clipping (`torch.nn.utils.clip_grad_norm_`) and reduce learning rate",
                    "explanation": "Gradient clipping constrains the maximum L2 norm of parameter gradients, preventing numerical overflow."
                }
            ]
        }
    ]

    for a_data in assessments_data:
        sk = a_data["skill"]
        assess = Assessment(
            title=a_data["title"],
            skill_id=sk.id,
            difficulty=a_data["difficulty"],
            passing_score=a_data["passing_score"],
            description=a_data["description"]
        )
        db.add(assess)
        db.flush()

        for q in a_data["questions"]:
            db.add(Question(
                assessment_id=assess.id,
                question_text=q["text"],
                question_type=q["type"],
                options_json=q["options"],
                correct_answer=q["correct"],
                explanation=q["explanation"],
                points=10
            ))

    # 7. Seed Flagship Portfolio Projects
    projects_data = [
        {
            "title": "Expense Tracker & Financial Analytics",
            "slug": "expense-tracker-analytics",
            "difficulty": "Beginner",
            "skill": python_skill,
            "problem": "Build an intuitive personal finance tracking application with category categorization, recurring transactions, and budget health alerts.",
            "objectives": json.dumps([
                "Model transaction schemas with SQLite / SQLAlchemy ORM",
                "Implement CRUD REST API endpoints with request validation",
                "Calculate monthly burn rates, categorical distributions, and expense velocity",
                "Build interactive visual breakdown charts with responsive controls"
            ]),
            "tech_stack": json.dumps(["Python", "FastAPI", "SQLite", "Pydantic", "Tailwind CSS"]),
            "estimated_hours": 10.0,
            "expected_outcome": "Complete full-stack financial tracker with exportable CSV reporting and analytics dashboard.",
            "portfolio_value": "Core Full-Stack Artifact",
            "milestones": json.dumps([
                {"title": "Database Schema & Models", "description": "Define Transaction, Category, and MonthlyBudget models with SQLAlchemy.", "is_completed": True},
                {"title": "CRUD REST Endpoints", "description": "Create FastAPI routers for logging expenses, filtering by date range, and calculating totals.", "is_completed": True},
                {"title": "Analytics Engine & Aggregations", "description": "Write aggregation queries for category breakdowns and budget overrun warnings.", "is_completed": False},
                {"title": "Interactive UI & Polish", "description": "Construct clean responsive tables and charts with real-time feedback.", "is_completed": False}
            ]),
            "prerequisites": json.dumps(["Python", "SQL"]),
            "skills_developed": json.dumps(["Python Syntax", "REST APIs", "Relational Modeling", "Basic Frontend"]),
            "template_repo_url": "https://github.com/tiangolo/fastapi"
        },
        {
            "title": "Student Result Analyzer & Academic Performance Insights",
            "slug": "student-result-analyzer",
            "difficulty": "Beginner",
            "skill": skill_objs["Pandas & Data Cleaning"],
            "problem": "Process multi-semester university grading datasets to uncover grade distribution skew, subject correlations, and at-risk student early warning flags.",
            "objectives": json.dumps([
                "Clean multi-format tabular student records and handle missing exam scores",
                "Compute percentile rankings, standard deviations, and GPA distributions",
                "Detect statistically significant correlations between attendance and exam performance",
                "Generate automated executive summary PDF and visual report cards"
            ]),
            "tech_stack": json.dumps(["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn"]),
            "estimated_hours": 12.0,
            "expected_outcome": "Automated analytical pipeline processing batch grade sheets with visual report generation.",
            "portfolio_value": "Essential Data Analytics Showcase",
            "milestones": json.dumps([
                {"title": "Data Ingestion & Cleaning", "description": "Standardize heterogeneous semester grade CSVs and impute missing marks.", "is_completed": True},
                {"title": "Statistical Exploratory Data Analysis", "description": "Calculate GPA variance, subject-wise quartiles, and correlation matrices.", "is_completed": False},
                {"title": "At-Risk Student Identification Algorithm", "description": "Formulate rule-based risk scoring based on attendance and trend deviations.", "is_completed": False},
                {"title": "Automated Report Export", "description": "Generate clean visual charts and summary exports for academic departments.", "is_completed": False}
            ]),
            "prerequisites": json.dumps(["Python", "Statistics"]),
            "skills_developed": json.dumps(["Pandas DataFrames", "Data Wrangling", "Descriptive Statistics", "Seaborn Plotting"]),
            "template_repo_url": "https://github.com/pandas-dev/pandas"
        },
        {
            "title": "Customer Churn Prediction & Model Explainability Pipeline",
            "slug": "customer-churn-prediction",
            "difficulty": "Intermediate",
            "skill": ml_skill,
            "problem": "Predict customer attrition for a subscription enterprise and generate SHAP explainability reports for customer success retention teams.",
            "objectives": json.dumps([
                "Clean and preprocess imbalanced customer telemetry data with Scikit-Learn Pipelines",
                "Train Random Forest and XGBoost classifiers with stratified cross-validation and hyperparameter tuning",
                "Generate ROC-AUC curves, confusion matrices, and precision-recall trade-offs",
                "Integrate SHAP TreeExplainer to produce individual customer risk breakdown cards"
            ]),
            "tech_stack": json.dumps(["Python", "Scikit-Learn", "XGBoost", "Pandas", "SHAP", "Matplotlib"]),
            "estimated_hours": 15.0,
            "expected_outcome": "Production-ready machine learning pipeline and trained model artifact with SHAP interpretability dashboard.",
            "portfolio_value": "High Portfolio Impact — Industry Standard",
            "milestones": json.dumps([
                {"title": "Feature Engineering & Preprocessing", "description": "One-hot encode categorical features, scale continuous variables, and handle class imbalance.", "is_completed": True},
                {"title": "Baseline & Ensemble Modeling", "description": "Train Logistic Regression baseline and tune Random Forest / XGBoost classifiers.", "is_completed": True},
                {"title": "Rigorous Model Evaluation", "description": "Evaluate on stratified holdout test set optimizing for Precision-Recall AUC (PR-AUC).", "is_completed": False},
                {"title": "Model Explainability (SHAP)", "description": "Compute global feature importances and local water-fall plots for top churn candidates.", "is_completed": False}
            ]),
            "prerequisites": json.dumps(["Python", "Statistics", "Machine Learning"]),
            "skills_developed": json.dumps(["Supervised Learning", "Hyperparameter Optimization", "SHAP Interpretability", "Model Evaluation"]),
            "template_repo_url": "https://github.com/scikit-learn/scikit-learn"
        },
        {
            "title": "Collaborative Recommendation System & Content Ranker",
            "slug": "recommendation-system-collaborative",
            "difficulty": "Intermediate",
            "skill": ml_skill,
            "problem": "Build an end-to-end hybrid movie/course recommendation engine combining Matrix Factorization (SVD) and Content-Based TF-IDF cosine similarity.",
            "objectives": json.dumps([
                "Process sparse user-item rating interaction matrices with scipy.sparse",
                "Implement Singular Value Decomposition (SVD) and ALS collaborative filtering algorithms",
                "Build content-based tag similarity search for cold-start new user onboarding",
                "Benchmark HitRate@10, Mean Reciprocal Rank (MRR), and NDCG metrics"
            ]),
            "tech_stack": json.dumps(["Python", "Surprise", "Scikit-Learn", "NumPy", "FastAPI"]),
            "estimated_hours": 16.0,
            "expected_outcome": "Deployable recommendation microservice returning real-time personalized top-10 ranked recommendations.",
            "portfolio_value": "Senior Machine Learning Showcase",
            "milestones": json.dumps([
                {"title": "Sparse Matrix Construction", "description": "Parse interaction logs into CSR sparse matrix and calculate matrix sparsity ratio.", "is_completed": True},
                {"title": "Matrix Factorization (SVD)", "description": "Train latent factor embedding model with stochastic gradient descent.", "is_completed": False},
                {"title": "Hybrid Cold-Start Blending", "description": "Blend collaborative predictions with item-content embeddings for new items.", "is_completed": False},
                {"title": "Top-N Ranking API Service", "description": "Package inference pipeline into sub-20ms FastAPI endpoint.", "is_completed": False}
            ]),
            "prerequisites": json.dumps(["Python", "Mathematics", "Machine Learning"]),
            "skills_developed": json.dumps(["Matrix Factorization", "Ranking Metrics (NDCG)", "Sparse Computations", "Embeddings"]),
            "template_repo_url": "https://github.com/NicolasHug/Surprise"
        },
        {
            "title": "Production ML Deployment Pipeline with Drift Monitoring & CI/CD",
            "slug": "ml-deployment-pipeline",
            "difficulty": "Advanced",
            "skill": skill_objs["MLOps & Deployment"],
            "problem": "Package a machine learning model into a production-grade Docker container, set up GitHub Actions CI/CD test gates, and monitor data drift with Evidently AI.",
            "objectives": json.dumps([
                "Containerize FastAPI model inference with multi-stage lightweight Docker image",
                "Implement automated unit and latency regression tests in GitHub Actions CI",
                "Configure Prometheus metrics endpoint and logging for request telemetry",
                "Set up Evidently AI drift detection monitoring for covariate and concept drift"
            ]),
            "tech_stack": json.dumps(["Python", "Docker", "FastAPI", "GitHub Actions", "Evidently AI", "Prometheus"]),
            "estimated_hours": 18.0,
            "expected_outcome": "Production-hardened automated MLOps pipeline with continuous testing and telemetry monitoring.",
            "portfolio_value": "Resume Highlight — High Production Value",
            "milestones": json.dumps([
                {"title": "Inference Microservice Architecture", "description": "Build asynchronous FastAPI prediction service with Pydantic contract validation.", "is_completed": False},
                {"title": "Multi-Stage Docker Packaging", "description": "Author lean alpine Docker container (<150MB) with non-root security privileges.", "is_completed": False},
                {"title": "Automated GitHub Actions CI/CD", "description": "Configure pipeline running pytest, flake8, and container security vulnerability scans.", "is_completed": False},
                {"title": "Telemetry & Drift Monitoring", "description": "Deploy Evidently AI drift detector generating automated data shift alerts.", "is_completed": False}
            ]),
            "prerequisites": json.dumps(["Python", "Machine Learning", "Docker & Containers"]),
            "skills_developed": json.dumps(["Docker Containerization", "CI/CD Automation", "Model Drift Detection", "Production API Design"]),
            "template_repo_url": "https://github.com/docker/awesome-compose"
        },
        {
            "title": "Production RAG Document Assistant with Vector Indexing & Evaluation",
            "slug": "production-rag-assistant",
            "difficulty": "Advanced",
            "skill": skill_objs["NLP"],
            "problem": "Build an enterprise QA assistant over technical PDF repositories with semantic chunking, dense vector retrieval, and hallucination self-consistency evaluation.",
            "objectives": json.dumps([
                "Extract and chunk complex technical documents into semantic sections",
                "Embed passages into ChromaDB vector database with dense sentence transformers",
                "Implement hybrid keyword + vector retrieval with cross-encoder re-ranking",
                "Construct citation verification prompts to eliminate hallucination risks"
            ]),
            "tech_stack": json.dumps(["Python", "LangChain", "ChromaDB", "FastAPI", "HuggingFace", "React"]),
            "estimated_hours": 20.0,
            "expected_outcome": "High-accuracy enterprise RAG assistant with verified citation sources and interactive chat UI.",
            "portfolio_value": "Cutting-Edge GenAI Portfolio Piece",
            "milestones": json.dumps([
                {"title": "Document Parsing & Semantic Chunking", "description": "Parse tables, code snippets, and headers with recursive character text splitters.", "is_completed": False},
                {"title": "Vector Embedding & Storage", "description": "Index documents into ChromaDB using state-of-the-art embedding models.", "is_completed": False},
                {"title": "Re-ranking & Context Compression", "description": "Filter top 20 candidate chunks through cross-encoder to extract top 3 relevant passages.", "is_completed": False},
                {"title": "Citation QA UI & Hallucination Guardrails", "description": "Build interactive conversational interface with precise source page references.", "is_completed": False}
            ]),
            "prerequisites": json.dumps(["Python", "Machine Learning", "Deep Learning"]),
            "skills_developed": json.dumps(["Vector Databases", "Retrieval Augmented Generation", "Prompt Engineering", "Semantic Search"]),
            "template_repo_url": "https://github.com/huggingface/transformers"
        },
        {
            "title": "Computer Vision Pipeline: Real-time Object Detection & Tracking",
            "slug": "computer-vision-detection-pipeline",
            "difficulty": "Advanced",
            "skill": skill_objs["Computer Vision"],
            "problem": "Implement an end-to-end edge-deployable computer vision pipeline capable of detecting, classifying, and tracking multiple moving objects across live video streams.",
            "objectives": json.dumps([
                "Fine-tune YOLOv8 on custom domain dataset using transfer learning",
                "Implement DeepSORT / ByteTrack multi-object tracking algorithm across video frames",
                "Optimize inference throughput with ONNX Runtime and FP16 half-precision",
                "Build real-time visualization overlays for bounding boxes, trajectories, and count telemetry"
            ]),
            "tech_stack": json.dumps(["Python", "PyTorch", "OpenCV", "YOLOv8", "ONNX Runtime", "NumPy"]),
            "estimated_hours": 20.0,
            "expected_outcome": "Real-time edge computer vision engine processing 45+ FPS video with trajectory analytics.",
            "portfolio_value": "Advanced AI/ML Engineering Capstone",
            "milestones": json.dumps([
                {"title": "Dataset Annotation & Augmentation", "description": "Preprocess bounding box annotations with Albumentations photometric perturbations.", "is_completed": False},
                {"title": "YOLOv8 Transfer Learning", "description": "Fine-tune pretrained vision backbone optimizing mAP@0.5:0.95 metric.", "is_completed": False},
                {"title": "Multi-Object Tracking Integration", "description": "Connect Kalman filter tracking (ByteTrack) to maintain consistent object IDs across frames.", "is_completed": False},
                {"title": "ONNX Acceleration & Video Pipeline", "description": "Export model to ONNX FP16 and build OpenCV video capture rendering pipeline.", "is_completed": False}
            ]),
            "prerequisites": json.dumps(["Python", "Mathematics", "Deep Learning"]),
            "skills_developed": json.dumps(["Object Detection", "YOLO Fine-Tuning", "Multi-Object Tracking", "ONNX Optimization"]),
            "template_repo_url": "https://github.com/ultralytics/ultralytics"
        }
    ]

    for p in projects_data:
        db.add(Project(
            title=p["title"],
            slug=p["slug"],
            difficulty=p["difficulty"],
            primary_skill_id=p["skill"].id,
            problem_statement=p["problem"],
            learning_objectives_json=p["objectives"],
            tech_stack_json=p["tech_stack"],
            estimated_hours=p["estimated_hours"],
            expected_outcome=p["expected_outcome"],
            portfolio_value=p.get("portfolio_value", "High Portfolio Impact"),
            milestones_json=p.get("milestones"),
            prerequisites_json=p.get("prerequisites"),
            skills_developed_json=p.get("skills_developed"),
            template_repo_url=p["template_repo_url"]
        ))

    # 8. Seed Demo Learner ("Alex Morgan" - AI/ML Engineer Track)
    demo_user = User(
        email="alex.demo@pathfinder.ai",
        full_name="Alex Morgan"
    )
    db.add(demo_user)
    db.flush()

    demo_profile = LearnerProfile(
        user_id=demo_user.id,
        career_goal_id=career_objs["AI/ML Engineer"].id,
        custom_goal_text="I want to transition into an AI/ML Engineer role within 6 months. I know Python and SQL well, but I need deep statistics and ML deployment experience.",
        experience_level="Intermediate",
        weekly_hours=10,
        target_timeline_months=6,
        preferred_learning_style="Mixed",
        completed_courses_text="Python Fundamentals, SQL Mastery on Codecademy",
        interests_text="Deep Learning, Large Language Models, MLOps Pipelines",
        ai_understanding_summary="Alex demonstrates strong programming proficiency in Python (80%) and SQL (60%), providing a great computational foundation. Immediate high-priority gaps exist in Statistics (35%) and Machine Learning (20%), which must be strengthened prior to advancing to Deep Learning."
    )
    db.add(demo_profile)
    db.flush()

    # Learner Skills for Alex (with rich evidence and verification details)
    demo_skills = [
        (skill_objs["Python"].id, 80.0, 0.85, "assessment", "Scored 85% on Python Core Benchmark & 14 verified GitHub repos", datetime.datetime.utcnow() - datetime.timedelta(days=2)),
        (skill_objs["SQL"].id, 60.0, 0.70, "self_reported", "Completed Codecademy PostgreSQL Track & practical queries", datetime.datetime.utcnow() - datetime.timedelta(days=12)),
        (skill_objs["Statistics"].id, 35.0, 0.40, "assessment", "Scored 42% on Diagnostic Statistics Pre-test", datetime.datetime.utcnow() - datetime.timedelta(days=1)),
        (skill_objs["Mathematics"].id, 45.0, 0.50, "self_reported", "University Linear Algebra coursework completed", datetime.datetime.utcnow() - datetime.timedelta(days=30)),
        (skill_objs["Data Structures"].id, 55.0, 0.60, "quiz", "NeetCode 75 practice set (35 problems solved)", datetime.datetime.utcnow() - datetime.timedelta(days=5)),
        (skill_objs["Machine Learning"].id, 20.0, 0.30, "self_reported", "Basic scikit-learn tutorial completed", datetime.datetime.utcnow() - datetime.timedelta(days=8)),
        (skill_objs["Pandas & Data Cleaning"].id, 65.0, 0.75, "project", "Data wrangling project on Kaggle Titanic dataset", datetime.datetime.utcnow() - datetime.timedelta(days=4)),
        (skill_objs["Git & Version Control"].id, 70.0, 0.80, "github", "Active GitHub contribution history with branching workflows", datetime.datetime.utcnow() - datetime.timedelta(days=3)),
        (skill_objs["Deep Learning"].id, 10.0, 0.20, "self_reported", "Introductory PyTorch documentation read", datetime.datetime.utcnow() - datetime.timedelta(days=20)),
        (skill_objs["MLOps & Deployment"].id, 5.0, 0.15, "self_reported", "Basic Docker CLI usage", datetime.datetime.utcnow() - datetime.timedelta(days=25))
    ]
    for sid, prof, conf, src, evid, dt in demo_skills:
        db.add(LearnerSkill(
            profile_id=demo_profile.id,
            skill_id=sid,
            current_proficiency=prof,
            confidence_score=conf,
            source=src,
            evidence=evid,
            last_assessed_at=dt
        ))

    # Demo Progress
    db.add(Progress(
        profile_id=demo_profile.id,
        completed_items_count=3,
        total_items_count=18,
        total_learning_minutes=720,  # 12 hours
        current_streak_days=4,
        career_readiness_score=48.5,
        readiness_breakdown_json=json.dumps({
            "technical_skills": 52.0,
            "projects": 35.0,
            "assessments": 60.0,
            "consistency": 70.0,
            "goal_coverage": 50.0
        })
    ))

    # Demo Insights
    db.add(AIInsight(
        profile_id=demo_profile.id,
        insight_type="Strength",
        message="Your Python and Data Wrangling foundations are solid (80th percentile for career transitioners).",
        importance="High"
    ))
    db.add(AIInsight(
        profile_id=demo_profile.id,
        insight_type="Gap",
        message="Statistics is your largest prerequisite gap before beginning advanced supervised learning.",
        importance="High"
    ))
    db.add(AIInsight(
        profile_id=demo_profile.id,
        insight_type="Trend",
        message="Weekly study consistency (4-day streak) has increased your target completion projection by 2 weeks.",
        importance="Medium"
    ))

    db.commit()
    print("PathFinder seed data created successfully!")
