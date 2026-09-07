# 03 — End-to-End User Journey & Hackathon Demo Flow

## Complete Hackathon Demo Sequence (3–5 Minutes)

PathFinder provides a frictionless, high-impact demonstration flow showcasing intelligence across every step of the learner lifecycle.

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner / Judge
    participant UI as PathFinder Frontend
    participant API as FastAPI Backend
    participant Engine as AI & DAG Engines
    participant DB as SQLite / Relational DB

    User->>UI: Lands on Landing Page
    User->>UI: Clicks "Try Demo Learner" (Alex Morgan)
    UI->>API: POST /api/demo/init
    API->>DB: Hydrate Alex Profile (AI/ML Engineer, 10h/wk)
    API->>Engine: Generate Initial Roadmap & Recommendations
    API-->>UI: Return Full Demo State
    
    UI->>User: Renders Career Command Center (Readiness 72%, Top Gaps)
    User->>UI: Clicks "Skill Gaps"
    UI-->>User: Interactive 6-Axis Radar & Dependency Graph
    
    User->>UI: Clicks "Roadmap"
    UI-->>User: Visual DAG Phase Sequence with Change Log History
    
    User->>UI: Clicks "Recommendations" -> "Why This?"
    UI-->>User: Explainability Modal (Prereqs met, +28pt gap reduction)
    
    User->>UI: Clicks "Diagnostic Assessments" -> Takes Quiz
    User->>UI: Submits Mediocre Score (38% on Statistics)
    UI->>API: POST /api/roadmap/adapt (Score: 38%)
    API->>Engine: Adaptive Mutation: Inject Remedials & Lock Advanced Phases
    API-->>UI: Return Adapted Roadmap
    
    UI-->>User: Displays Live Mutation Toast & Timeline Update
    User->>UI: Clicks "What-If Simulator"
    User->>UI: Adjusts Weekly Hours (10h -> 20h)
    UI-->>User: Live Comparative Matrix (6 mo -> 3.3 mo, +15% coverage)
    
    User->>UI: Clicks "Ask AI" (AI Career Assistant)
    User->>UI: Enters "I only have 2 hours today"
    UI-->>User: Structured 2h Timeboxed Micro-Plan with Direct Links
```

---

## Step-by-Step Experience Breakdown

### 1. Landing & Instant Demo Hydration
- Visitors are greeted by the clean, Linear/Notion-inspired landing page.
- A single click on **"Try Demo Learner"** loads Alex Morgan (Intermediate AI/ML Engineer candidate with 10h/week study budget), immediately populating all database records.

### 2. The Career Command Center (Dashboard)
- **Career Readiness Index (72%)** with component breakdown (Technical, Projects, Assessments, Consistency).
- **Next Best Action Hero Card** with direct continuation CTA and expected gap reduction impact.
- **Real-Time Skill Momentum Strip** ($+8\%$ growth velocity).
- **Smart Streak** showing authentic validated milestones rather than empty logins.

### 3. Deep Skill-Gap Diagnostics
- **Multi-Axis Radar Chart** comparing current proficiency against target role benchmarks.
- **Topological Dependency Graph** illustrating unlocked and locked skill paths.
- **Interactive Table & Drawer** providing deep dives into evidence sources and prerequisites.

### 4. Interactive Prerequisite DAG Roadmap
- Displays structured sequential phases (Foundations $\rightarrow$ Statistics $\rightarrow$ Machine Learning $\rightarrow$ Deep Learning $\rightarrow$ MLOps $\rightarrow$ Capstone).
- **Adaptive Change Log** timeline recording chronological AI mutations (reinforcements added, syntaxes bypassed).

### 5. Multi-Factor Recommendations & "Why This?"
- Recommendations scored via 10 objective criteria.
- Transparent explainability modal justifying recommendation match percentage and alignment with time budget.

### 6. Assessment & Live Adaptive Mutation
- Taking a diagnostic quiz dynamically tests knowledge.
- Submitting a score of 38% triggers PathFinder's autonomous adaptive engine:
  - Updates skill confidence in real-time.
  - Injects remedial micro-lessons into the active roadmap phase.
  - Temporarily locks advanced downstream topics until remediation is verified.

### 7. What-If Path Simulator & Command Center
- Sliders allow instant scenario modeling (e.g., doubling study hours to 20h/week or switching to project-heavy curriculum).
- Power-user keyboard navigation (`Ctrl+K` and `/`) provides instant command execution.
