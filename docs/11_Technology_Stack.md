# 11 — Technology Stack

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6 (Ultra-fast HMR and optimized production bundles)
- **Styling**: Tailwind CSS (Custom dark/light SaaS design tokens, animations, and glassmorphism)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Radar charts, Area charts, Responsive Containers)
- **Routing**: React Router v6
- **Effects**: Canvas Confetti (celebratory assessment milestones)

## Backend
- **Framework**: FastAPI (High-performance asynchronous Python REST framework)
- **Validation**: Pydantic v2 (Strict type-checking and schema serialization)
- **ORM / Database**: SQLAlchemy 2.0 (SQLite local database with direct PostgreSQL compatibility)
- **Graph Solver**: NetworkX (Topological sorting and acyclic prerequisite graphs)
- **AI SDK**: Google GenAI SDK (`google-genai`) with fallback mock provider
- **Testing**: Pytest & HTTPX TestClient

## Infrastructure & Deployment
- **Containerization**: Docker & Docker Compose
- **Configuration**: Pydantic BaseSettings with `.env` and `.env.example`
- **Deploy Readiness**: Vercel (Frontend), Render / Railway (Backend), Supabase / Neon (PostgreSQL)
