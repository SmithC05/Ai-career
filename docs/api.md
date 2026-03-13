# API Overview

Base path (backend): `/api/v1`

## Auth

- `POST /auth/register`
- `POST /auth/login`

## Careers

- `GET /careers`
- `GET /careers/{careerId}`
- `GET /careers/compare?careerA={uuid}&careerB={uuid}`

## AI Proxy (through backend)

- `POST /ai/career-advice`
- `GET /ai/chat-history`
- `POST /ai/skill-gap-analysis`
- `POST /ai/roadmap-generator`

## Dashboard

- `GET /dashboard`
  - Includes:
    - `savedCareers`
    - `roadmaps`
    - `learningPaths`
    - `resumePortfolios`
    - `recommendations`
    - `analytics` (completion score, weekly progress, trend)
- `POST /dashboard/saved-careers/{careerId}`
- `DELETE /dashboard/saved-careers/{careerId}`

## Career Quiz

- `POST /quiz/submit`

## Roadmaps

- `POST /roadmaps/generate`
- `GET /roadmaps`

## Personalized Learning Paths

- `POST /learning-paths/generate`
- `GET /learning-paths`

## Resume + Portfolio Builder

- `POST /resume-portfolio/generate`
- `GET /resume-portfolio`
