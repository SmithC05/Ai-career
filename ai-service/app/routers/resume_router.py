import asyncio
import logging
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.config import settings
from app.services.ollama_client import OllamaClient
from app.services.prompt_builder import extract_json, to_str_list
from app.services.resume_service import (
    parse_and_extract,
    score_against_jd,
    generate_suggestions,
)

logger = logging.getLogger(__name__)
resume_router = APIRouter()
ollama_client = OllamaClient()

RESUME_MAX_TOKENS = 300


# ── Pydantic Models ────────────────────────────────────────────────────────────

class ResumeAnalyseRequest(BaseModel):
    resumeText: str = Field(min_length=10)
    jobDescription: Optional[str] = Field(default="")


class ResumeAnalyseResponse(BaseModel):
    extractedSkills: List[str] = Field(default_factory=list)
    matchScore: int = Field(default=0, ge=0, le=100)
    suggestions: List[str] = Field(default_factory=list)
    improvementAreas: List[str] = Field(default_factory=list)


# ── Fallback ───────────────────────────────────────────────────────────────────

def _fallback_response() -> ResumeAnalyseResponse:
    return ResumeAnalyseResponse(
        extractedSkills=[],
        matchScore=0,
        suggestions=["AI analysis unavailable. Please try again later."],
        improvementAreas=[],
    )


# ── Deadline helper (reuses same pattern as routes.py) ────────────────────────

def _deadline() -> int:
    return max(1, min(settings.ollama_timeout_seconds, settings.ollama_request_deadline_seconds))


# ── Endpoint ───────────────────────────────────────────────────────────────────

@resume_router.post("/resume/analyse", response_model=ResumeAnalyseResponse)
async def analyse_resume(payload: ResumeAnalyseRequest) -> ResumeAnalyseResponse:
    """
    Accepts resume text + optional job description.
    Returns extracted skills, match score, suggestions, and improvement areas.
    Always returns structured JSON — never hangs.
    """
    try:
        skills = parse_and_extract(payload.resumeText)
        match_score, matched, missing = score_against_jd(
            payload.resumeText, payload.jobDescription or ""
        )
        suggestions = generate_suggestions(payload.resumeText, match_score)

        improvement_areas = [f"Learn or demonstrate: {s}" for s in missing[:5]]

        return ResumeAnalyseResponse(
            extractedSkills=skills,
            matchScore=match_score,
            suggestions=suggestions,
            improvementAreas=improvement_areas,
        )
    except Exception:
        logger.exception("Resume analysis failed; returning fallback")
        return _fallback_response()
