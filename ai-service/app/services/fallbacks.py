import math
from typing import List

from app.schemas import (
    CareerAdviceRequest,
    CareerAdviceResponse,
    LearningPathMilestone,
    PersonalizedLearningPathRequest,
    PersonalizedLearningPathResponse,
    ResumePortfolioBuilderRequest,
    ResumePortfolioBuilderResponse,
    ResumeSection,
    PortfolioProject,
    RoadmapGeneratorRequest,
    RoadmapGeneratorResponse,
    RoadmapStep,
    SkillGapAnalysisRequest,
    SkillGapAnalysisResponse,
)


ROLE_SKILLS = {
    "data": ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization"],
    "frontend": ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
    "backend": ["APIs", "Databases", "Authentication", "Testing", "Deployment"],
    "full stack": ["HTML", "CSS", "JavaScript", "APIs", "Databases"],
    "ai": ["Python", "Machine Learning", "Prompt Engineering", "APIs", "Evaluation"],
    "ml": ["Python", "Machine Learning", "Statistics", "Model Evaluation", "Data Processing"],
    "cyber": ["Networking", "Linux", "Security Fundamentals", "Monitoring", "Incident Response"],
    "cloud": ["Linux", "Networking", "Cloud Services", "Infrastructure as Code", "Monitoring"],
    "ui": ["Design Systems", "Wireframing", "Prototyping", "User Research", "Accessibility"],
    "ux": ["User Research", "Wireframing", "Usability Testing", "Information Architecture", "Prototyping"],
    "product": ["Roadmapping", "User Research", "Analytics", "Stakeholder Communication", "Prioritization"],
}


def build_fallback_career_advice_response(payload: CareerAdviceRequest) -> CareerAdviceResponse:
    suggested_careers = _suggest_careers_from_text(payload.question)
    next_steps = [
        "Pick one target role and compare its required skills with your current strengths.",
        "Build one small project or portfolio sample aligned to that role this week.",
        "Create a 6-8 week study plan with measurable milestones and review it every Sunday.",
    ]

    answer = (
        "A fast fallback answer was generated because live AI generation was unavailable. "
        "Start by choosing roles that match the work you enjoy, then validate them through small projects, "
        "job descriptions, and conversations with people already in the field."
    )

    if suggested_careers:
        answer += f" Based on your question, roles worth exploring include {', '.join(suggested_careers[:3])}."

    return CareerAdviceResponse(
        answer=answer,
        suggestedCareers=suggested_careers,
        nextSteps=next_steps,
    )


def build_fallback_skill_gap_response(payload: SkillGapAnalysisRequest) -> SkillGapAnalysisResponse:
    current_skills = _normalize_skills(payload.currentSkills)
    expected_skills = _expected_skills_for_role(payload.targetCareer)
    current_keys = {skill.casefold() for skill in current_skills}
    missing_skills = [skill for skill in expected_skills if skill.casefold() not in current_keys]

    if not missing_skills:
        missing_skills = ["Portfolio Projects", "Interview Practice", "Role-specific Problem Solving"]

    recommendations = [
        f"Prioritize {missing_skills[0]} first and practice it through one small hands-on project.",
        "Review 5-10 job descriptions for your target role and note repeated tools or skills.",
        "Track progress weekly and convert each missing skill into a portfolio-ready outcome.",
    ]

    return SkillGapAnalysisResponse(
        targetCareer=payload.targetCareer,
        currentSkills=current_skills,
        missingSkills=missing_skills[:5],
        recommendations=recommendations,
    )


def build_fallback_roadmap_response(payload: RoadmapGeneratorRequest) -> RoadmapGeneratorResponse:
    current_skills = _normalize_skills(payload.currentSkills)
    phase_count = _phase_count(payload.timelineMonths)
    templates = _roadmap_templates(payload.targetCareer, current_skills)
    steps: List[RoadmapStep] = []

    for phase in range(1, phase_count + 1):
        title, details, resources = templates[phase - 1]
        timebox = _phase_timebox(phase, phase_count, payload.timelineMonths)
        steps.append(
            RoadmapStep(
                phase=phase,
                title=title,
                details=f"{timebox}{details}",
                resources=resources,
            )
        )

    focus = _focus_area(current_skills)
    summary = (
        f"A practical roadmap was generated using the built-in planner because live AI generation "
        f"was unavailable. Over the next {payload.timelineMonths} months, focus on {focus}, "
        "hands-on projects, and interview readiness."
    )

    return RoadmapGeneratorResponse(
        targetCareer=payload.targetCareer,
        timelineMonths=payload.timelineMonths,
        summary=summary,
        steps=steps,
    )


def build_fallback_learning_path_response(
    payload: PersonalizedLearningPathRequest,
) -> PersonalizedLearningPathResponse:
    focus = _focus_area(_normalize_skills(payload.currentSkills))

    return PersonalizedLearningPathResponse(
        targetCareer=payload.targetCareer,
        timelineMonths=payload.timelineMonths,
        weeklyHours=payload.weeklyHours,
        learningStyle=payload.learningStyle,
        summary=(
            "A fast fallback learning path was generated because live AI generation was unavailable. "
            f"Use your {payload.weeklyHours} weekly hours to strengthen {focus} and convert practice into projects."
        ),
        milestones=[
            LearningPathMilestone(
                week=1,
                focus="Foundation Sprint",
                outcomes=[f"Understand the core concepts required for {payload.targetCareer}."],
                tasks=["Complete one structured lesson block", "Take notes and summarize key ideas in your own words"],
            ),
            LearningPathMilestone(
                week=2,
                focus="Guided Practice",
                outcomes=["Turn theory into repeatable exercises."],
                tasks=["Solve 3-5 practice tasks", "Document mistakes and create a revision checklist"],
            ),
            LearningPathMilestone(
                week=3,
                focus="Applied Project",
                outcomes=["Create one practical artifact you can show publicly."],
                tasks=["Build one scoped project", "Publish progress to GitHub or your portfolio"],
            ),
        ],
        resources=["Official documentation", "One structured course", "Project-based practice repository"],
    )


def build_fallback_resume_portfolio_response(
    payload: ResumePortfolioBuilderRequest,
) -> ResumePortfolioBuilderResponse:
    skills = _normalize_skills(payload.skills)
    top_skills = skills[:8] or _expected_skills_for_role(payload.targetCareer)[:5]

    return ResumePortfolioBuilderResponse(
        headline=f"Aspiring {payload.targetCareer}",
        professionalSummary=(
            f"{payload.fullName} is building practical, job-ready skills for {payload.targetCareer} with a focus "
            "on demonstrable projects, measurable outcomes, and a clear portfolio story."
        ),
        resumeSections=[
            ResumeSection(heading="Education", bullets=[payload.education]),
            ResumeSection(heading="Skills", bullets=top_skills or ["Role-specific fundamentals"]),
            ResumeSection(
                heading="Projects",
                bullets=payload.projects or [f"Develop one portfolio project tailored to {payload.targetCareer}"],
            ),
        ],
        portfolioProjects=[
            PortfolioProject(
                name=f"{payload.targetCareer} Showcase Project",
                problem="Solve a practical problem that mirrors real work in the target role.",
                solution="Build, test, and document a focused end-to-end solution with clear tradeoffs.",
                stack=top_skills[:5],
                impact="Demonstrates execution, communication, and role alignment in interviews.",
            )
        ],
        atsKeywords=top_skills,
    )


def _normalize_skills(skills: List[str]) -> List[str]:
    normalized: List[str] = []
    seen = set()

    for skill in skills:
        cleaned = skill.strip()
        if not cleaned:
            continue

        key = cleaned.casefold()
        if key in seen:
            continue

        seen.add(key)
        normalized.append(cleaned)

    return normalized


def _expected_skills_for_role(target_career: str) -> List[str]:
    career_key = target_career.casefold()

    for keyword, skills in ROLE_SKILLS.items():
        if keyword in career_key:
            return skills

    return ["Core Fundamentals", "Practical Projects", "Communication", "Problem Solving", "Interview Readiness"]


def _suggest_careers_from_text(question: str) -> List[str]:
    lowered = question.casefold()

    if "data" in lowered or "analytics" in lowered:
        return ["Data Analyst", "Data Scientist", "Business Analyst"]
    if "frontend" in lowered or "web" in lowered or "ui" in lowered:
        return ["Frontend Developer", "UI/UX Designer", "Full Stack Developer"]
    if "backend" in lowered or "api" in lowered:
        return ["Backend Developer", "Cloud Engineer", "Full Stack Developer"]
    if "ai" in lowered or "ml" in lowered or "machine learning" in lowered:
        return ["ML Engineer", "AI Engineer", "Data Scientist"]
    if "security" in lowered or "cyber" in lowered:
        return ["Cybersecurity Analyst", "Cloud Security Engineer", "SOC Analyst"]
    if "product" in lowered:
        return ["Product Manager", "Business Analyst", "Growth Analyst"]

    return ["Software Developer", "Data Analyst", "Product Manager"]


def _phase_count(timeline_months: int) -> int:
    if timeline_months <= 3:
        return 3
    if timeline_months <= 8:
        return 4
    return 5


def _focus_area(current_skills: List[str]) -> str:
    if not current_skills:
        return "the role fundamentals"
    if len(current_skills) == 1:
        return current_skills[0]
    if len(current_skills) == 2:
        return f"{current_skills[0]} and {current_skills[1]}"
    return f"{current_skills[0]}, {current_skills[1]}, and {current_skills[2]}"


def _phase_timebox(phase: int, phase_count: int, timeline_months: int) -> str:
    if timeline_months <= phase_count:
        return ""

    start_month = math.floor(((phase - 1) * timeline_months) / phase_count) + 1
    end_month = math.floor((phase * timeline_months) / phase_count)
    end_month = min(max(end_month, start_month), timeline_months)

    if start_month >= end_month:
        return f"Month {start_month}: "

    return f"Months {start_month}-{end_month}: "


def _roadmap_templates(target_career: str, current_skills: List[str]) -> List[tuple[str, str, List[str]]]:
    focus = _focus_area(current_skills)

    return [
        (
            "Foundation",
            (
                f"Build the essential concepts for {target_career}. Review your current baseline in {focus}, "
                "identify knowledge gaps, and create a weekly study routine you can sustain."
            ),
            ["Official documentation", "Structured beginner course", "Personal study notes"],
        ),
        (
            "Core Practice",
            (
                f"Practice the daily workflows used in {target_career}. Turn theory into repeatable exercises, "
                "and strengthen your command of the main tools employers expect."
            ),
            ["Hands-on tutorials", "Practice exercises", "GitHub repo for experiments"],
        ),
        (
            "Portfolio Projects",
            (
                f"Build one or two projects that show real ability in {target_career}. Prioritize scoped work, "
                "clear documentation, and measurable outcomes you can explain to recruiters."
            ),
            ["Project brief template", "Public portfolio repository", "Peer or mentor feedback"],
        ),
        (
            "Job Readiness",
            (
                f"Refine your resume, prepare project walkthroughs, and practice the interview topics most relevant "
                f"to {target_career}. Fill any remaining weak spots with focused revision."
            ),
            ["Resume checklist", "Mock interview questions", "Role-specific case studies"],
        ),
        (
            "Application Sprint",
            (
                "Start applying consistently, tailor your applications, and keep improving based on feedback from "
                "screenings, interviews, and portfolio reviews."
            ),
            ["Application tracker", "Networking outreach list", "Weekly reflection log"],
        ),
    ]
