# AI Career Navigator

Production-ready starter for a microservice-based career guidance platform:

- `frontend`: Next.js 14 + TypeScript + Tailwind + shadcn-style components
- `backend`: Spring Boot + JWT Auth + JPA/Hibernate
- `ai-service`: FastAPI + Ollama model integration
- `database`: PostgreSQL schema + seed data
- `docker`: Dockerfiles for all services

## Quick Start

1. Copy env template:

```bash
cp .env.example .env
```

2. Start all services:

```bash
docker compose up --build
```

3. Access apps:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/v1`
- AI Service docs: `http://localhost:8000/docs`

## Important Note About Ollama Models

`docker compose up --build` automatically pulls required models (`llama3:8b`, `mistral`, `phi3:mini`) using the `ollama-init` service.
First startup can take longer because model downloads are large.

## Service Layout

```text
ai-career-navigator/
  frontend/
  backend/
  ai-service/
  database/
  docker/
  docs/
```

Detailed API references are in `docs/api.md`.
