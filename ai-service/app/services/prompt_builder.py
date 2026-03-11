import json
import re
from typing import Any, Dict, List


def build_career_advice_prompt(question: str) -> str:
    return f"""
You are a career advisor for students from post-12th grade to final year college.
Answer the user's question clearly and practically.

Return only valid JSON with this exact shape:
{{
  "answer": "string",
  "suggestedCareers": ["string"],
  "nextSteps": ["string"]
}}

User question: {question}
""".strip()


def build_skill_gap_prompt(target_career: str, current_skills: List[str]) -> str:
    return f"""
You are a skill gap analyzer.
Given a target career and current skills, identify missing skills and next recommendations.

Return only valid JSON with this exact shape:
{{
  "targetCareer": "{target_career}",
  "currentSkills": ["string"],
  "missingSkills": ["string"],
  "recommendations": ["string"]
}}

Target career: {target_career}
Current skills: {", ".join(current_skills) if current_skills else "None"}
""".strip()


def build_roadmap_prompt(target_career: str, current_skills: List[str], timeline_months: int) -> str:
    return f"""
You are a career roadmap generator.
Create a practical learning roadmap for the target career over {timeline_months} months.

Return only valid JSON with this exact shape:
{{
  "targetCareer": "{target_career}",
  "timelineMonths": {timeline_months},
  "summary": "string",
  "steps": [
    {{
      "phase": 1,
      "title": "string",
      "details": "string",
      "resources": ["string"]
    }}
  ]
}}

Target career: {target_career}
Current skills: {", ".join(current_skills) if current_skills else "None"}
""".strip()


def build_learning_path_prompt(
    target_career: str,
    current_skills: List[str],
    weekly_hours: int,
    learning_style: str,
    timeline_months: int,
) -> str:
    return f"""
You are a personalized learning coach for students.
Generate a structured learning path with weekly milestones, outcomes, and tasks.
Keep tasks realistic for {weekly_hours} hours/week and learning style "{learning_style}".

Return only valid JSON with this exact shape:
{{
  "targetCareer": "{target_career}",
  "timelineMonths": {timeline_months},
  "weeklyHours": {weekly_hours},
  "learningStyle": "{learning_style}",
  "summary": "string",
  "milestones": [
    {{
      "week": 1,
      "focus": "string",
      "outcomes": ["string"],
      "tasks": ["string"]
    }}
  ],
  "resources": ["string"]
}}

Target career: {target_career}
Current skills: {", ".join(current_skills) if current_skills else "None"}
""".strip()


def build_resume_portfolio_prompt(
    target_career: str,
    full_name: str,
    education: str,
    skills: List[str],
    projects: List[str],
    achievements: List[str],
    experiences: List[str],
    links: List[str],
) -> str:
    return f"""
You are a resume and portfolio strategist for students.
Create ATS-friendly resume content and strong portfolio project ideas tailored to the target role.

Return only valid JSON with this exact shape:
{{
  "headline": "string",
  "professionalSummary": "string",
  "resumeSections": [
    {{
      "heading": "string",
      "bullets": ["string"]
    }}
  ],
  "portfolioProjects": [
    {{
      "name": "string",
      "problem": "string",
      "solution": "string",
      "stack": ["string"],
      "impact": "string"
    }}
  ],
  "atsKeywords": ["string"]
}}

Target career: {target_career}
Student name: {full_name}
Education: {education}
Skills: {", ".join(skills) if skills else "None"}
Projects: {", ".join(projects) if projects else "None"}
Achievements: {", ".join(achievements) if achievements else "None"}
Experience: {", ".join(experiences) if experiences else "None"}
Links: {", ".join(links) if links else "None"}
""".strip()


def extract_json(text: str) -> Dict[str, Any]:
    cleaned = text.strip()
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        candidate = match.group(0)
        parsed = json.loads(candidate)
        if isinstance(parsed, dict):
            return parsed

    raise ValueError("No valid JSON object found in model response")


def to_str_list(value: Any) -> List[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]
