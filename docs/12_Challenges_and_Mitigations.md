# 12 — Challenges & Mitigations

| Challenge | Impact | Technical Mitigation in PathFinder |
| :--- | :--- | :--- |
| **LLM Latency & Missing API Keys** | API errors could crash demo presentations | Implemented `AIProvider` factory with an intelligent local regex and heuristic fallback that provides 100% feature parity offline. |
| **Graph Dependency Cycles** | Circular prerequisites could freeze the topological roadmap generator | Applied NetworkX `is_directed_acyclic_graph` verification with automated cycle-breaking resolution. |
| **Overfitting Recommendations to Stated Goals** | Learners might get trapped in narrow tracks without foundational breadth | Embedded career prerequisite weights and baseline competency floors into the multi-factor scoring model. |
| **Self-Reported Skill Inaccuracy** | Users often overestimate or underestimate their proficiency | Included diagnostic test-out quizzes with dynamic confidence recalculation (+X% or -X% proficiency delta). |
| **Decision Fatigue from Long Roadmaps** | Overwhelming lists of 40+ modules lead to burnout | Grouped items into expandable topological phases with a persistent **"Next Best Action"** spotlight. |
