# 11 — Technology Stack & Engineering Specifications

## Comprehensive Architecture & Dependency Matrix

PathFinder is built using modern, type-safe, and production-tested open source frameworks.

```mermaid
graph TD
    subgraph Frontend_Stack["Frontend Technologies"]
        F1["React 18 (Hooks, Context, Strict Mode)"]
        F2["TypeScript 5.x (Type Safety)"]
        F3["Vite 6 (Ultra-Fast HMR & Bundling)"]
        F4["Tailwind CSS v3 (Custom Dark Theme Design System)"]
        F5["Recharts (Radar, Line, & Area Visualizations)"]
        F6["Lucide React (Modern Iconography)"]
        F7["React Router v6 (Client-side Routing & History)"]
    end

    subgraph Backend_Stack["Backend Technologies"]
        B1["FastAPI (Asynchronous Python 3.11+ Web Framework)"]
        B2["Pydantic v2 (Strict Schema Validation & Serialization)"]
        B3["SQLAlchemy 2.0 (Declarative ORM & Connection Pooling)"]
        B4["SQLite / PostgreSQL (Relational Data Store)"]
        B5["Uvicorn (ASGI Production Server)"]
        B6["Pytest (Automated Test Suite with 100% Endpoint Coverage)"]
    end

    subgraph AI_Layer["AI & Machine Learning"]
        A1["Google GenAI SDK (@google/genai & google-genai)"]
        A2["Google Gemini 2.5 Flash / Pro Hosted LLM"]
        A3["Deterministic Rule-Based Fallback Provider"]
        A4["Kahn's Topological DAG Sorting Algorithm"]
    end

    Frontend_Stack <--> Backend_Stack
    Backend_Stack <--> AI_Layer
```

---

## Technical Specifications Table

| Layer | Technology | Version / Standard | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `18.2.0` | Declarative UI rendering & state orchestration |
| **Language (Frontend)** | TypeScript | `5.3.x` | Strict type safety across client interfaces |
| **Build Tooling** | Vite | `6.x` | Sub-second HMR & Rollup production bundling |
| **Styling** | Tailwind CSS | `3.4.x` | Custom Linear/Notion dark mode design system |
| **Data Visualization** | Recharts & SVG | `2.12.x` | Responsive skill radar & velocity charts |
| **Icons** | Lucide React | `0.344.x` | High-clarity developer tool iconography |
| **Backend Framework** | FastAPI | `0.110.x` | High-performance asynchronous REST API |
| **Language (Backend)** | Python | `3.11+` | Business logic, DAG solvers, and scoring algorithms |
| **Data Validation** | Pydantic | `2.6.x` | Runtime contract validation & serialization |
| **ORM & Persistence** | SQLAlchemy | `2.0.x` | Declarative models and transactional integrity |
| **AI LLM Engine** | Google Gemini API | `2.5-flash` | Multimodal goal parsing, chat, and explanation |
| **Testing Suite** | Pytest & TestClient | `8.x` | 29+ automated scenario tests with 100% pass rate |
