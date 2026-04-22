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

## Resume Analyser

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/resume/analyse` | Multipart upload (`file` = PDF, `jobDescription` = optional string). Extracts skills, computes match score, returns suggestions. |
| `GET`  | `/resume/{id}` | Retrieve a previously saved analysis by ID (ownership enforced). |

**Response shape (`ResumeAnalysis`):**
```json
{
  "id": "uuid",
  "extractedSkills": ["Java", "Spring Boot"],
  "jobDescription": "...",
  "matchScore": 72,
  "suggestions": ["Add cloud certifications", "..."],
  "improvementAreas": ["Kubernetes", "CI/CD"],
  "createdAt": "2026-04-22T10:00:00Z"
}
```

**FastAPI internal endpoints (called by backend, not directly by frontend):**
- `POST /ai/resume/analyse` — accepts `{ text, jobDescription }`, returns AI analysis.

---

## Interview Assistant

All endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/interview/start` | Start a new session. Body: `{ role, difficulty }`. Generates questions via AI and persists the session. |
| `POST` | `/interview/evaluate` | Evaluate one answer. Body: `{ sessionId, questionIndex, answer }`. Returns feedback. |
| `GET`  | `/interview/sessions` | List all sessions for the authenticated user. |
| `GET`  | `/interview/sessions/{id}` | Retrieve full session with questions, answers, and feedback. |

**Response shape (`InterviewSession`):**
```json
{
  "id": "uuid",
  "targetRole": "Software Engineer",
  "difficulty": "medium",
  "questions": [{ "question": "...", "type": "technical", "expectedKeywords": ["..."] }],
  "answers": ["My answer..."],
  "feedback": [{ "score": 8, "feedback": "...", "strengths": ["..."], "improvements": ["..."] }],
  "createdAt": "2026-04-22T10:00:00Z"
}
```

**FastAPI internal endpoints (called by backend, not directly by frontend):**
- `POST /ai/interview/questions` — generate questions for a role/difficulty.
- `POST /ai/interview/evaluate` — evaluate a single answer.
- `GET  /ai/interview/bank/{role}` — fetch static fallback question bank for a role.

