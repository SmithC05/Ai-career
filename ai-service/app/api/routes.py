import asyncio
import logging

from fastapi import APIRouter

from app.config import settings
from app.schemas import (
    CareerAdviceRequest,
    CareerAdviceResponse,
    LearningPathMilestone,
    PersonalizedLearningPathRequest,
    PersonalizedLearningPathResponse,
    PortfolioProject,
    RoadmapGeneratorRequest,
    RoadmapGeneratorResponse,
    RoadmapStep,
    ResumePortfolioBuilderRequest,
    ResumePortfolioBuilderResponse,
    ResumeSection,
    SkillGapAnalysisRequest,
    SkillGapAnalysisResponse,
)
from app.services.ollama_client import OllamaClient
from app.services.fallbacks import (
    build_fallback_career_advice_response,
    build_fallback_learning_path_response,
    build_fallback_resume_portfolio_response,
    build_fallback_roadmap_response,
    build_fallback_skill_gap_response,
)
from app.services.prompt_builder import (
    build_career_advice_prompt,
    build_learning_path_prompt,
    build_roadmap_prompt,
    build_resume_portfolio_prompt,
    build_skill_gap_prompt,
    extract_json,
    to_str_list,
)

router = APIRouter()
ollama_client = OllamaClient()
logger = logging.getLogger(__name__)

CAREER_ADVICE_MAX_TOKENS = 180
SKILL_GAP_MAX_TOKENS = 180
ROADMAP_MAX_TOKENS = 260
LEARNING_PATH_MAX_TOKENS = 260
RESUME_MAX_TOKENS = 260


def to_int(value: object, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def request_deadline_seconds() -> int:
    return max(1, min(settings.ollama_timeout_seconds, settings.ollama_request_deadline_seconds))


@router.post("/career-advice", response_model=CareerAdviceResponse)
async def career_advice(payload: CareerAdviceRequest) -> CareerAdviceResponse:
    prompt = build_career_advice_prompt(payload.question)

    try:
        raw_response = await asyncio.wait_for(
            ollama_client.generate(
                settings.ollama_model_advisor,
                prompt,
                max_tokens=CAREER_ADVICE_MAX_TOKENS,
            ),
            timeout=request_deadline_seconds(),
        )
        parsed = extract_json(raw_response)
        return CareerAdviceResponse(
            answer=str(parsed.get("answer", "Focus on fundamentals and build portfolio projects.")),
            suggestedCareers=to_str_list(parsed.get("suggestedCareers")),
            nextSteps=to_str_list(parsed.get("nextSteps")),
        )
    except Exception as exc:
        logger.exception("Career advice generation failed; returning fallback response")
        return build_fallback_career_advice_response(payload)


@router.post("/skill-gap-analysis", response_model=SkillGapAnalysisResponse)
async def skill_gap_analysis(payload: SkillGapAnalysisRequest) -> SkillGapAnalysisResponse:
    prompt = build_skill_gap_prompt(payload.targetCareer, payload.currentSkills)

    try:
        raw_response = await asyncio.wait_for(
            ollama_client.generate(
                settings.ollama_model_light,
                prompt,
                max_tokens=SKILL_GAP_MAX_TOKENS,
            ),
            timeout=request_deadline_seconds(),
        )
        parsed = extract_json(raw_response)
        missing_skills = to_str_list(parsed.get("missingSkills"))
        recommendations = to_str_list(parsed.get("recommendations"))

        return SkillGapAnalysisResponse(
            targetCareer=payload.targetCareer,
            currentSkills=payload.currentSkills,
            missingSkills=missing_skills,
            recommendations=recommendations,
        )
    except Exception as exc:
        logger.exception(
            "Skill gap generation failed for target career '%s'; returning fallback response",
            payload.targetCareer,
        )
        return build_fallback_skill_gap_response(payload)


@router.post("/roadmap-generator", response_model=RoadmapGeneratorResponse)
async def roadmap_generator(payload: RoadmapGeneratorRequest) -> RoadmapGeneratorResponse:
    prompt = build_roadmap_prompt(payload.targetCareer, payload.currentSkills, payload.timelineMonths)

    try:
        raw_response = await asyncio.wait_for(
            ollama_client.generate(
                settings.ollama_model_roadmap,
                prompt,
                max_tokens=ROADMAP_MAX_TOKENS,
            ),
            timeout=request_deadline_seconds(),
        )
        parsed = extract_json(raw_response)
        raw_steps = parsed.get("steps") if isinstance(parsed.get("steps"), list) else []

        steps = []
        for index, step in enumerate(raw_steps, start=1):
            if not isinstance(step, dict):
                continue
            steps.append(
                RoadmapStep(
                    phase=int(step.get("phase", index)),
                    title=str(step.get("title", f"Phase {index}")),
                    details=str(step.get("details", "Complete core learning tasks and projects.")),
                    resources=to_str_list(step.get("resources")),
                )
            )

        if not steps:
            steps = [
                RoadmapStep(
                    phase=1,
                    title="Foundation",
                    details="Build core concepts and start mini projects.",
                    resources=["Official docs", "Hands-on tutorial series"],
                )
            ]

        return RoadmapGeneratorResponse(
            targetCareer=payload.targetCareer,
            timelineMonths=payload.timelineMonths,
            summary=str(parsed.get("summary", "Structured roadmap generated for your target career.")),
            steps=steps,
        )
    except Exception as exc:
        logger.exception(
            "Roadmap generation failed for target career '%s'; returning fallback response",
            payload.targetCareer,
        )
        return build_fallback_roadmap_response(payload)


@router.post("/personalized-learning-path", response_model=PersonalizedLearningPathResponse)
async def personalized_learning_path(payload: PersonalizedLearningPathRequest) -> PersonalizedLearningPathResponse:
    prompt = build_learning_path_prompt(
        payload.targetCareer,
        payload.currentSkills,
        payload.weeklyHours,
        payload.learningStyle,
        payload.timelineMonths,
    )
    try:
        raw_response = await asyncio.wait_for(
            ollama_client.generate(
                settings.ollama_model_light,
                prompt,
                max_tokens=LEARNING_PATH_MAX_TOKENS,
            ),
            timeout=request_deadline_seconds(),
        )
        parsed = extract_json(raw_response)
        raw_milestones = parsed.get("milestones") if isinstance(parsed.get("milestones"), list) else []

        total_weeks = max(1, payload.timelineMonths * 4)
        milestones = []
        for index, milestone in enumerate(raw_milestones, start=1):
            if not isinstance(milestone, dict):
                continue
            week = to_int(milestone.get("week"), index)
            week = min(max(week, 1), total_weeks)

            milestones.append(
                LearningPathMilestone(
                    week=week,
                    focus=str(milestone.get("focus", f"Week {week} focus")),
                    outcomes=to_str_list(milestone.get("outcomes")),
                    tasks=to_str_list(milestone.get("tasks")),
                )
            )

        if not milestones:
            milestones = [
                LearningPathMilestone(
                    week=1,
                    focus="Core Foundations",
                    outcomes=[f"Understand fundamentals for {payload.targetCareer}"],
                    tasks=["Complete one structured course module", "Create one mini project"],
                )
            ]

        timeline_months = max(1, min(24, to_int(parsed.get("timelineMonths"), payload.timelineMonths)))
        weekly_hours = max(1, min(40, to_int(parsed.get("weeklyHours"), payload.weeklyHours)))

        return PersonalizedLearningPathResponse(
            targetCareer=payload.targetCareer,
            timelineMonths=timeline_months,
            weeklyHours=weekly_hours,
            learningStyle=str(parsed.get("learningStyle", payload.learningStyle)),
            summary=str(parsed.get("summary", "A personalized learning path has been generated.")),
            milestones=milestones,
            resources=to_str_list(parsed.get("resources")),
        )
    except Exception:
        logger.exception(
            "Learning path generation failed for target career '%s'; returning fallback response",
            payload.targetCareer,
        )
        return build_fallback_learning_path_response(payload)


@router.post("/resume-portfolio-builder", response_model=ResumePortfolioBuilderResponse)
async def resume_portfolio_builder(payload: ResumePortfolioBuilderRequest) -> ResumePortfolioBuilderResponse:
    prompt = build_resume_portfolio_prompt(
        payload.targetCareer,
        payload.fullName,
        payload.education,
        payload.skills,
        payload.projects,
        payload.achievements,
        payload.experiences,
        payload.links,
    )
    try:
        raw_response = await asyncio.wait_for(
            ollama_client.generate(
                settings.ollama_model_light,
                prompt,
                max_tokens=RESUME_MAX_TOKENS,
            ),
            timeout=request_deadline_seconds(),
        )
        parsed = extract_json(raw_response)
        raw_sections = parsed.get("resumeSections") if isinstance(parsed.get("resumeSections"), list) else []

        sections = []
        for section in raw_sections:
            if not isinstance(section, dict):
                continue
            heading = str(section.get("heading", "")).strip()
            if not heading:
                continue

            sections.append(
                ResumeSection(
                    heading=heading,
                    bullets=to_str_list(section.get("bullets")),
                )
            )

        if not sections:
            sections = [
                ResumeSection(heading="Education", bullets=[payload.education]),
                ResumeSection(heading="Skills", bullets=payload.skills or ["Core domain fundamentals"]),
                ResumeSection(
                    heading="Projects",
                    bullets=payload.projects or [f"Build one portfolio-grade {payload.targetCareer} project"],
                ),
            ]

        raw_projects = parsed.get("portfolioProjects") if isinstance(parsed.get("portfolioProjects"), list) else []
        portfolio_projects = []
        for project in raw_projects:
            if not isinstance(project, dict):
                continue
            portfolio_projects.append(
                PortfolioProject(
                    name=str(project.get("name", "Career Project")),
                    problem=str(project.get("problem", "Define a relevant user problem to solve.")),
                    solution=str(project.get("solution", "Develop and validate an end-to-end solution.")),
                    stack=to_str_list(project.get("stack")),
                    impact=str(project.get("impact", "Demonstrates applied skills for your target role.")),
                )
            )

        if not portfolio_projects:
            portfolio_projects = [
                PortfolioProject(
                    name=f"{payload.targetCareer} Capstone",
                    problem="Build something that solves a real-world problem.",
                    solution="Deliver an end-to-end project with documentation and measurable results.",
                    stack=payload.skills[:4] if payload.skills else ["Core tools for target role"],
                    impact="Strengthens resume quality and interview readiness.",
                )
            ]

        ats_keywords = to_str_list(parsed.get("atsKeywords")) or payload.skills[:10]

        return ResumePortfolioBuilderResponse(
            headline=str(parsed.get("headline", f"Aspiring {payload.targetCareer}")),
            professionalSummary=str(
                parsed.get(
                    "professionalSummary",
                    f"{payload.fullName} is building practical, role-focused skills for {payload.targetCareer}.",
                )
            ),
            resumeSections=sections,
            portfolioProjects=portfolio_projects,
            atsKeywords=ats_keywords,
        )
    except Exception:
        logger.exception(
            "Resume builder generation failed for target career '%s'; returning fallback response",
            payload.targetCareer,
        )
        return build_fallback_resume_portfolio_response(payload)
