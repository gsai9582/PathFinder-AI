# 04 — System Architecture

PathFinder uses a clean, decoupled architecture separating clients, REST API gateways, recommendation services, and graph solvers.

```mermaid
graph TB
    subgraph Client["Frontend Layer (React 18 + TypeScript + Vite)"]
        UI_Nav[Navbar & Global Drawers]
        UI_Dash[Dashboard & Metrics]
        UI_Radar[Recharts Skill Radar]
        UI_Roadmap[Interactive DAG Visualizer]
        UI_Quiz[Interactive Assessment Runner]
        UI_Chat[AI Assistant Drawer]
        UI_WhatIf[What-If Simulation Panel]
    end

    subgraph Server["Backend Layer (FastAPI)"]
        API_Router[REST Router Endpoints]
        Svc_Profile[Profile & Onboarding Service]
        Svc_SkillGap[Skill-Gap Computation Service]
        Svc_Scoring[Multi-Factor Recommendation Engine]
        Svc_DAG[Prerequisite DAG Graph Solver]
        Svc_Adaptive[Adaptive Learning Engine]
        Svc_Analytics[Career Readiness & Analytics Service]
    end

    subgraph AI["AI Layer (Abstract Interface)"]
        AI_Factory[AIProvider Factory]
        AI_Gemini[Gemini API Provider (Google GenAI)]
        AI_Mock[Intelligent Heuristic Fallback Provider]
    end

    subgraph Storage["Data Persistence Layer"]
        DB_SQL[(SQLite / PostgreSQL via SQLAlchemy)]
    end

    Client -->|REST JSON / CORS| API_Router
    API_Router --> Server
    Server --> AI_Factory
    AI_Factory --> AI_Gemini
    AI_Factory --> AI_Mock
    Server --> DB_SQL
```

## Architectural Highlights

- **FastAPI Core**: High-throughput async API gateway with strict Pydantic v2 validation.
- **SQLAlchemy ORM**: Clean relational entities supporting both SQLite local prototyping and PostgreSQL production deployments.
- **Abstract AI Provider**: Dual engine design guaranteeing zero crashes when offline or without API keys.
- **DAG Topological Solver**: NetworkX graph engine for acyclic prerequisite sequencing.
- **Modern React + Vite UI**: Tailwind CSS styling, responsive grid layouts, and interactive Recharts data visualizations.
