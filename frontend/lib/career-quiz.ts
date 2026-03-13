import { QuizSubmitResponse } from "@/types";

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "interest",
    question: "Which kind of problems do you enjoy solving the most?",
    options: [
      { id: "interest_data", label: "Analyzing data and patterns" },
      { id: "interest_build", label: "Building apps and systems" },
      { id: "interest_security", label: "Protecting systems and networks" },
      { id: "interest_design", label: "Designing intuitive user experiences" },
      { id: "interest_growth", label: "Growing audiences and campaigns" },
      { id: "interest_strategy", label: "Defining product strategy and roadmap" },
    ],
  },
  {
    id: "work_style",
    question: "What work style feels most natural to you?",
    options: [
      { id: "work_research", label: "Research and experimentation" },
      { id: "work_coding", label: "Coding and shipping features" },
      { id: "work_risk", label: "Monitoring risk and fixing vulnerabilities" },
      { id: "work_storytelling", label: "Communication and storytelling" },
    ],
  },
  {
    id: "tools",
    question: "Which tools would you prefer learning first?",
    options: [
      { id: "tool_python", label: "Python, SQL, notebooks" },
      { id: "tool_web", label: "JavaScript, React, APIs" },
      { id: "tool_security", label: "Linux, networking, SOC tools" },
      { id: "tool_design", label: "Figma and design systems" },
      { id: "tool_ads", label: "Analytics + ad platforms" },
      { id: "tool_pm", label: "Roadmaps and product metrics" },
    ],
  },
  {
    id: "outcome",
    question: "What impact motivates you most?",
    options: [
      { id: "impact_insights", label: "Turning data into decisions" },
      { id: "impact_product", label: "Creating useful digital products" },
      { id: "impact_safety", label: "Keeping people and systems safe" },
      { id: "impact_usability", label: "Making products easier to use" },
      { id: "impact_growth", label: "Scaling reach and engagement" },
    ],
  },
];

const QUIZ_STORAGE_KEY = "acn_quiz_result_v1";

export function saveQuizResult(result: QuizSubmitResponse): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(result));
}

export function getQuizResult(): QuizSubmitResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as QuizSubmitResponse;
  } catch {
    return null;
  }
}
