import asyncio
import logging
from typing import Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.config import settings
from app.services.interview_service import (
    generate_questions,
    evaluate_answer,
    get_question_bank,
)

logger = logging.getLogger(__name__)
interview_router = APIRouter()


# ── Pydantic Models ────────────────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    question: str
    type: str
    expectedKeywords: List[str] = Field(default_factory=list)


class QuestionGenerateRequest(BaseModel):
    role: str = Field(min_length=2)
    difficulty: str = Field(default="medium")
    count: int = Field(default=5, ge=1, le=15)


class EvaluateRequest(BaseModel):
    question: str = Field(min_length=5)
    answer: str = Field(min_length=1)
    role: str = Field(min_length=2)


class EvaluateResponse(BaseModel):
    score: int = Field(ge=0, le=10)
    feedback: str
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)


# ── Fallbacks ──────────────────────────────────────────────────────────────────

def _fallback_questions(role: str, count: int) -> List[InterviewQuestion]:
    bank = get_question_bank(role)
    return bank[:count] if bank else [
        InterviewQuestion(
            question=f"Tell me about your experience relevant to {role}.",
            type="behavioral",
            expectedKeywords=["experience", "skills", "role"],
        )
    ]


def _fallback_evaluate() -> EvaluateResponse:
    return EvaluateResponse(
        score=5,
        feedback="AI evaluation unavailable. Your answer has been recorded.",
        strengths=["Attempted the question"],
        improvements=["Try to be more specific with examples"],
    )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@interview_router.post("/interview/questions", response_model=List[InterviewQuestion])
async def generate_interview_questions(
    payload: QuestionGenerateRequest,
) -> List[InterviewQuestion]:
    """Generate interview questions for a role and difficulty. Always returns JSON."""
    try:
        questions = await asyncio.wait_for(
            asyncio.to_thread(generate_questions, payload.role, payload.difficulty, payload.count),
            timeout=max(1, min(settings.ollama_timeout_seconds, settings.ollama_request_deadline_seconds)),
        )
        return questions
    except Exception:
        logger.exception("Question generation failed; returning fallback")
        return _fallback_questions(payload.role, payload.count)


@interview_router.post("/interview/evaluate", response_model=EvaluateResponse)
async def evaluate_interview_answer(payload: EvaluateRequest) -> EvaluateResponse:
    """Evaluate a user's answer and return scored feedback. Always returns JSON."""
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(evaluate_answer, payload.question, payload.answer, payload.role),
            timeout=max(1, min(settings.ollama_timeout_seconds, settings.ollama_request_deadline_seconds)),
        )
        return result
    except Exception:
        logger.exception("Answer evaluation failed; returning fallback")
        return _fallback_evaluate()


@interview_router.get("/interview/bank/{role}", response_model=List[InterviewQuestion])
async def question_bank(role: str) -> List[InterviewQuestion]:
    """Return curated static question bank for a given role."""
    try:
        return get_question_bank(role)
    except Exception:
        logger.exception("Question bank lookup failed; returning empty list")
        return []
