from typing import List
from pydantic import BaseModel, Field


class CareerAdviceRequest(BaseModel):
    question: str = Field(min_length=3)


class CareerAdviceResponse(BaseModel):
    answer: str
    suggestedCareers: List[str]
    nextSteps: List[str]


class SkillGapAnalysisRequest(BaseModel):
    targetCareer: str = Field(min_length=2)
    currentSkills: List[str] = Field(default_factory=list)


class SkillGapAnalysisResponse(BaseModel):
    targetCareer: str
    currentSkills: List[str]
    missingSkills: List[str]
    recommendations: List[str]


class RoadmapGeneratorRequest(BaseModel):
    targetCareer: str = Field(min_length=2)
    currentSkills: List[str] = Field(default_factory=list)
    timelineMonths: int = Field(default=6, ge=1, le=36)


class RoadmapStep(BaseModel):
    phase: int
    title: str
    details: str
    resources: List[str] = Field(default_factory=list)


class RoadmapGeneratorResponse(BaseModel):
    targetCareer: str
    timelineMonths: int
    summary: str
    steps: List[RoadmapStep]


class PersonalizedLearningPathRequest(BaseModel):
    targetCareer: str = Field(min_length=2)
    currentSkills: List[str] = Field(default_factory=list)
    weeklyHours: int = Field(default=8, ge=1, le=40)
    learningStyle: str = Field(min_length=3)
    timelineMonths: int = Field(default=6, ge=1, le=24)


class LearningPathMilestone(BaseModel):
    week: int
    focus: str
    outcomes: List[str] = Field(default_factory=list)
    tasks: List[str] = Field(default_factory=list)


class PersonalizedLearningPathResponse(BaseModel):
    targetCareer: str
    timelineMonths: int
    weeklyHours: int
    learningStyle: str
    summary: str
    milestones: List[LearningPathMilestone]
    resources: List[str] = Field(default_factory=list)


class ResumePortfolioBuilderRequest(BaseModel):
    targetCareer: str = Field(min_length=2)
    fullName: str = Field(min_length=2)
    education: str = Field(min_length=2)
    skills: List[str] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    experiences: List[str] = Field(default_factory=list)
    links: List[str] = Field(default_factory=list)


class ResumeSection(BaseModel):
    heading: str
    bullets: List[str] = Field(default_factory=list)


class PortfolioProject(BaseModel):
    name: str
    problem: str
    solution: str
    stack: List[str] = Field(default_factory=list)
    impact: str


class ResumePortfolioBuilderResponse(BaseModel):
    headline: str
    professionalSummary: str
    resumeSections: List[ResumeSection]
    portfolioProjects: List[PortfolioProject]
    atsKeywords: List[str] = Field(default_factory=list)
