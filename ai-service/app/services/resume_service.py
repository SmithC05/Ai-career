import asyncio
import logging
import re
from typing import Dict, List, Tuple

from app.config import settings
from app.services.ollama_client import OllamaClient
from app.services.prompt_builder import extract_json, to_str_list

logger = logging.getLogger(__name__)
ollama_client = OllamaClient()

RESUME_MAX_TOKENS = 260

# ── Common tech skill vocabulary used for lightweight extraction ───────────────

_TECH_SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript", "Go", "Rust", "C++", "C#",
    "SQL", "NoSQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "React", "Next.js", "Vue", "Angular", "Node.js", "FastAPI", "Spring Boot",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux", "Git",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn",
    "Pandas", "NumPy", "Data Analysis", "Statistics", "NLP",
    "REST", "GraphQL", "gRPC", "Microservices", "CI/CD", "Agile", "Scrum",
    "Product Management", "Roadmapping", "User Research", "Figma", "UX Design",
    "Communication", "Leadership", "Problem Solving", "Critical Thinking",
]

_SKILL_LOWER = {s.lower(): s for s in _TECH_SKILLS}

_ROLE_SKILLS: Dict[str, List[str]] = {
    "software-engineer":  ["Python", "Java", "JavaScript", "SQL", "Docker", "Git", "REST", "Agile"],
    "product-manager":    ["Roadmapping", "User Research", "Agile", "Communication", "Leadership"],
    "data-scientist":     ["Python", "SQL", "Machine Learning", "Statistics", "Pandas", "NumPy"],
    "designer":           ["Figma", "UX Design", "User Research", "Communication", "Problem Solving"],
    "backend":            ["Java", "Python", "SQL", "REST", "Docker", "Git"],
    "frontend":           ["JavaScript", "TypeScript", "React", "CSS", "Git"],
    "devops":             ["Docker", "Kubernetes", "CI/CD", "Linux", "AWS"],
    "ml-engineer":        ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Docker"],
}


def _deadline() -> int:
    return max(1, min(settings.ollama_timeout_seconds, settings.ollama_request_deadline_seconds))


# ── Public API ─────────────────────────────────────────────────────────────────

def parse_and_extract(text: str) -> List[str]:
    """
    Lightweight rule-based skill extractor. Falls back to empty list on error.
    For better accuracy, the Ollama call is attempted first.
    """
    found: List[str] = []
    text_lower = text.lower()
    for skill_lower, skill_canonical in _SKILL_LOWER.items():
        # Use word-boundary-style match to avoid partial matches
        if re.search(r"\b" + re.escape(skill_lower) + r"\b", text_lower):
            found.append(skill_canonical)
    return found[:20]  # cap at 20 to keep response manageable


def score_against_jd(text: str, jd: str) -> Tuple[int, List[str], List[str]]:
    """
    Returns (score 0-100, matched_skills, missing_skills).
    If no JD provided, returns (50, extracted_skills, []).
    """
    extracted = parse_and_extract(text)
    if not jd or not jd.strip():
        return 50, extracted, []

    jd_lower = jd.lower()
    matched: List[str] = []
    missing: List[str] = []

    for skill_lower, skill_canonical in _SKILL_LOWER.items():
        if re.search(r"\b" + re.escape(skill_lower) + r"\b", jd_lower):
            if skill_canonical in extracted:
                matched.append(skill_canonical)
            else:
                missing.append(skill_canonical)

    if not matched and not missing:
        return 50, extracted, []

    total = len(matched) + len(missing)
    score = int((len(matched) / total) * 100) if total > 0 else 0
    return score, matched, missing


def generate_suggestions(text: str, score: int) -> List[str]:
    """
    Returns a list of improvement suggestions based on the match score.
    Pure rule-based — always returns instantly.
    """
    if score >= 80:
        return [
            "Your resume is well-aligned with the job description.",
            "Quantify achievements where possible (e.g., 'reduced build time by 30%').",
            "Add a concise professional summary at the top.",
        ]
    if score >= 50:
        return [
            "Add more keywords from the job description naturally into your experience bullets.",
            "Highlight projects that directly demonstrate the required skills.",
            "Use action verbs to lead each bullet point (built, designed, reduced, etc.).",
            "Include measurable outcomes for each role.",
        ]
    return [
        "Your resume has low alignment with the job description.",
        "Study the job description carefully and add matching skills you genuinely possess.",
        "Build a targeted project that demonstrates the core required skills.",
        "Tailor your professional summary specifically for this role.",
        "Get feedback from a peer or mentor before applying.",
    ]
