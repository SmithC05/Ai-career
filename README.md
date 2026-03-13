<div align="center">
  <img src="./docs/assets/readme-hero.svg" alt="AI Career Navigator animated banner" width="100%" />
</div>

<div align="center">

# AI Career Navigator

### AI-powered career guidance with fast roadmaps, skill-gap analysis, learning paths, and portfolio-ready output

![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-0F172A?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot_3-163020?style=for-the-badge&logo=springboot&logoColor=white)
![FastAPI](https://img.shields.io/badge/AI-FastAPI-0E7490?style=for-the-badge&logo=fastapi&logoColor=white)
![Postgres](https://img.shields.io/badge/Database-PostgreSQL_16-1D4ED8?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Dev_Stack-Docker_Compose-1E3A8A?style=for-the-badge&logo=docker&logoColor=white)

</div>

## What This Project Does

AI Career Navigator turns career exploration into a guided product flow instead of a disconnected set of forms and APIs.

- Discover roles through quiz-driven guidance and saved career exploration.
- Compare careers and analyze skill gaps against a target role.
- Generate learning roadmaps, personalized plans, and resume or portfolio guidance.
- Track momentum through a dashboard with saved items and generated outputs.
- Run the full stack locally with Docker, PostgreSQL, Spring Boot, FastAPI, and Ollama.

## Experience Flow

```mermaid
flowchart LR
    A[Career Quiz] --> B[Recommendations]
    B --> C[Career Compare]
    C --> D[Skill Gap Analysis]
    D --> E[Roadmap Generator]
    E --> F[Learning Path]
    F --> G[Resume + Portfolio Builder]
    G --> H[Dashboard Tracking]
    E --> I[AI Career Advisor]
    I --> H
```

## Stack

| Layer | Tech | Responsibility |
| --- | --- | --- |
| Frontend | `Next.js 14`, `TypeScript`, `Tailwind CSS` | Product UI, guided flow, dashboard, forms, generated result views |
| Backend | `Spring Boot`, `JWT`, `JPA/Hibernate` | Auth, API orchestration, persistence, domain logic |
| AI Service | `FastAPI`, `Ollama`, `Pydantic` | Advice, roadmap, skill-gap, learning path, resume generation |
| Database | `PostgreSQL 16` | Users, careers, roadmaps, learning paths, resume portfolios |
| Infra | `Docker Compose` | Local orchestration for all services |

## Core Modules

```text
ai-career-navigator/
  frontend/    Next.js app and UI components
  backend/     Spring Boot API and business logic
  ai-service/  FastAPI inference service and fallback planners
  database/    Schema and seed data
  docker/      Service Dockerfiles
  docs/        API notes and README assets
```

## Quick Start

1. Copy the environment template.

```bash
cp .env.example .env
```

2. Start the full platform.

```bash
docker compose up --build
```

3. Open the apps.

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/v1`
- AI service docs: `http://localhost:8000/docs`

## Fast AI Setup

The AI service is tuned for responsive local development on CPU-first machines.

- Default Ollama model: `qwen2.5:0.5b`
- Short response deadlines with graceful fallbacks
- Roadmap, learning path, resume, and advice routes always return a structured response

On first boot, `ollama-init` pulls the default model automatically. The first startup can still take a little longer because the model image needs to be downloaded.

## API Snapshot

Backend base path: `/api/v1`

- `POST /auth/register`
- `POST /auth/login`
- `GET /careers`
- `GET /careers/{careerId}`
- `GET /careers/compare?careerA={uuid}&careerB={uuid}`
- `POST /ai/career-advice`
- `POST /ai/skill-gap-analysis`
- `POST /roadmaps/generate`
- `POST /learning-paths/generate`
- `POST /resume-portfolio/generate`
- `GET /dashboard`

Detailed endpoint notes live in [docs/api.md](./docs/api.md).

## Why This Repo Feels Good To Work In

- Clear service boundaries between UI, domain API, AI inference, and persistence
- Docker-based local setup that gets the whole platform running quickly
- AI endpoints designed to degrade gracefully instead of hanging forever
- Good foundation for adding auth flows, analytics, portfolio tooling, or richer AI models later

## Local Notes

- If Docker is already running older containers, recreate the stack after changing model settings.
- If Ollama responses are too slow on your machine, keep the lightweight model and short deadlines in `.env`.
- If you want higher quality AI output later, you can increase model size once latency is acceptable.
