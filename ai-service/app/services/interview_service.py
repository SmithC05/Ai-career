import asyncio
import logging
from typing import Dict, List, Optional

from app.config import settings
from app.services.ollama_client import OllamaClient
from app.services.prompt_builder import extract_json, to_str_list

logger = logging.getLogger(__name__)
ollama_client = OllamaClient()

INTERVIEW_MAX_TOKENS = 280


# ── Static question bank ───────────────────────────────────────────────────────

_QUESTION_BANK: Dict[str, List[dict]] = {
    "software-engineer": [
        {"question": "Explain the difference between a stack and a heap.", "type": "technical", "expectedKeywords": ["memory", "allocation", "LIFO", "dynamic"]},
        {"question": "How does garbage collection work in your primary language?", "type": "technical", "expectedKeywords": ["GC", "memory", "reference", "cleanup"]},
        {"question": "Describe a challenging bug you solved and how you approached it.", "type": "behavioral", "expectedKeywords": ["debugging", "systematic", "root cause", "fix"]},
        {"question": "What is the difference between REST and GraphQL?", "type": "technical", "expectedKeywords": ["REST", "GraphQL", "query", "endpoints", "flexibility"]},
        {"question": "How do you ensure code quality in a team setting?", "type": "behavioral", "expectedKeywords": ["code review", "tests", "CI/CD", "standards"]},
        {"question": "Explain CAP theorem.", "type": "technical", "expectedKeywords": ["consistency", "availability", "partition tolerance"]},
        {"question": "Walk me through designing a URL shortener system.", "type": "system-design", "expectedKeywords": ["hashing", "database", "cache", "scalability"]},
    ],
    "product-manager": [
        {"question": "How do you prioritize features on a roadmap?", "type": "behavioral", "expectedKeywords": ["impact", "effort", "user value", "stakeholders", "metrics"]},
        {"question": "Describe a product you improved and the metrics you used.", "type": "behavioral", "expectedKeywords": ["metrics", "KPIs", "user", "improvement", "data"]},
        {"question": "How do you handle conflicting stakeholder priorities?", "type": "behavioral", "expectedKeywords": ["communication", "alignment", "trade-offs", "business goals"]},
        {"question": "Walk me through how you would launch a new feature.", "type": "case", "expectedKeywords": ["discovery", "spec", "development", "testing", "launch", "measure"]},
        {"question": "How do you gather and validate user requirements?", "type": "behavioral", "expectedKeywords": ["user interviews", "surveys", "data", "validation", "feedback"]},
    ],
    "data-scientist": [
        {"question": "Explain the bias-variance tradeoff.", "type": "technical", "expectedKeywords": ["bias", "variance", "overfitting", "underfitting", "complexity"]},
        {"question": "How would you handle imbalanced datasets?", "type": "technical", "expectedKeywords": ["SMOTE", "oversampling", "undersampling", "class weights", "metrics"]},
        {"question": "Walk me through a complete ML project you've built.", "type": "behavioral", "expectedKeywords": ["data", "cleaning", "model", "evaluation", "deployment"]},
        {"question": "What is regularization and when would you use it?", "type": "technical", "expectedKeywords": ["L1", "L2", "overfitting", "penalty", "ridge", "lasso"]},
        {"question": "How do you explain a machine learning model to a non-technical stakeholder?", "type": "behavioral", "expectedKeywords": ["analogies", "visualization", "business impact", "simple language"]},
    ],
    "designer": [
        {"question": "Walk me through your design process for a recent project.", "type": "behavioral", "expectedKeywords": ["research", "wireframe", "prototype", "test", "iterate"]},
        {"question": "How do you handle design feedback you disagree with?", "type": "behavioral", "expectedKeywords": ["rationale", "data", "user needs", "collaboration", "compromise"]},
        {"question": "How do you ensure accessibility in your designs?", "type": "technical", "expectedKeywords": ["WCAG", "contrast", "screen reader", "alt text", "keyboard navigation"]},
        {"question": "Describe a time you had to simplify a complex user flow.", "type": "behavioral", "expectedKeywords": ["user journey", "friction", "clarity", "testing", "iteration"]},
        {"question": "How do you measure the success of a design?", "type": "behavioral", "expectedKeywords": ["metrics", "usability testing", "conversion", "NPS", "task completion"]},
    ],
}


def _normalize_role(role: str) -> str:
    """Map free-text role to a bank key."""
    r = role.lower().strip()
    if "software" in r or "engineer" in r or "developer" in r or "swe" in r:
        return "software-engineer"
    if "product" in r or "pm" in r:
        return "product-manager"
    if "data" in r or "scientist" in r or "analyst" in r:
        return "data-scientist"
    if "design" in r or "ux" in r or "ui" in r:
        return "designer"
    return "software-engineer"


def _deadline() -> int:
    return max(1, min(settings.ollama_timeout_seconds, settings.ollama_request_deadline_seconds))


# ── Public API ─────────────────────────────────────────────────────────────────

def get_question_bank(role: str) -> list:
    """Return curated static questions for a role."""
    from app.routers.interview_router import InterviewQuestion
    key = _normalize_role(role)
    raw_questions = _QUESTION_BANK.get(key, _QUESTION_BANK["software-engineer"])
    return [
        InterviewQuestion(
            question=q["question"],
            type=q["type"],
            expectedKeywords=q.get("expectedKeywords", []),
        )
        for q in raw_questions
    ]


def generate_questions(role: str, difficulty: str, count: int) -> list:
    """
    Generate interview questions. Uses the static bank as primary source.
    For premium experiences, this can be extended to call Ollama.
    Always returns a list — never raises.
    """
    try:
        bank = get_question_bank(role)
        # Filter by difficulty if desired (currently all are returned from bank)
        return bank[:count]
    except Exception:
        logger.exception("generate_questions failed")
        return []


def evaluate_answer(question: str, answer: str, role: str) -> object:
    """
    Score an interview answer and produce structured feedback.
    Uses simple heuristics + keyword matching for instant response.
    """
    from app.routers.interview_router import EvaluateResponse

    try:
        key = _normalize_role(role)
        bank = _QUESTION_BANK.get(key, [])

        # Find matching question to get expected keywords
        expected_kws: List[str] = []
        for q in bank:
            if question.lower().strip() in q["question"].lower():
                expected_kws = q.get("expectedKeywords", [])
                break

        answer_lower = answer.lower()
        matched_kws = [kw for kw in expected_kws if kw.lower() in answer_lower]
        total_kws = len(expected_kws) if expected_kws else 1
        kw_ratio = len(matched_kws) / total_kws

        # Score 0-10 based on keyword coverage and answer length
        word_count = len(answer.split())
        length_score = min(1.0, word_count / 80)  # 80+ words is ideal
        score = max(1, min(10, int((kw_ratio * 0.6 + length_score * 0.4) * 10)))

        # Build feedback
        if score >= 8:
            fb = "Excellent answer — well-structured with strong technical depth."
            strengths = ["Clear and detailed", "Good use of relevant terminology", "Demonstrated domain knowledge"]
            improvements = ["Consider adding a concrete example to make it even stronger"]
        elif score >= 5:
            fb = "Good answer with room for improvement."
            strengths = ["Addressed the core of the question", "Showed relevant understanding"]
            improvements = [
                f"Try to include these keywords: {', '.join([k for k in expected_kws if k.lower() not in answer_lower][:3])}",
                "Add a specific example or project that illustrates your point",
            ]
        else:
            fb = "Answer needs more depth. Try to be more specific and structured."
            strengths = ["Attempted the question"]
            improvements = [
                "Provide a concrete example from your experience",
                f"Address key concepts: {', '.join(expected_kws[:4])}",
                "Structure your answer using STAR (Situation, Task, Action, Result)",
            ]

        return EvaluateResponse(
            score=score,
            feedback=fb,
            strengths=strengths,
            improvements=improvements,
        )
    except Exception:
        logger.exception("evaluate_answer heuristic failed")
        from app.routers.interview_router import EvaluateResponse
        return EvaluateResponse(
            score=5,
            feedback="Evaluation unavailable. Your answer has been recorded.",
            strengths=["Attempted the question"],
            improvements=["Try to be more specific with examples"],
        )
