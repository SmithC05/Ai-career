export type CareerTrack =
  | "data_science"
  | "software_engineering"
  | "cybersecurity"
  | "ui_ux"
  | "digital_marketing"
  | "product_management";

export type QuizOption = {
  id: string;
  label: string;
  tracks: CareerTrack[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
};

export type CareerRecommendation = {
  track: CareerTrack;
  careerName: string;
  description: string;
  category: string;
  matchPercentage: number;
  strengths: string[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "interest",
    question: "Which kind of problems do you enjoy solving the most?",
    options: [
      { id: "interest_data", label: "Analyzing data and patterns", tracks: ["data_science"] },
      { id: "interest_build", label: "Building apps and systems", tracks: ["software_engineering"] },
      { id: "interest_security", label: "Protecting systems and networks", tracks: ["cybersecurity"] },
      { id: "interest_design", label: "Designing intuitive user experiences", tracks: ["ui_ux"] },
      { id: "interest_growth", label: "Growing audiences and campaigns", tracks: ["digital_marketing"] },
      { id: "interest_strategy", label: "Defining product strategy and roadmap", tracks: ["product_management"] },
    ],
  },
  {
    id: "work_style",
    question: "What work style feels most natural to you?",
    options: [
      { id: "work_research", label: "Research and experimentation", tracks: ["data_science", "ui_ux"] },
      { id: "work_coding", label: "Coding and shipping features", tracks: ["software_engineering"] },
      { id: "work_risk", label: "Monitoring risk and fixing vulnerabilities", tracks: ["cybersecurity"] },
      { id: "work_storytelling", label: "Communication and storytelling", tracks: ["digital_marketing", "product_management"] },
    ],
  },
  {
    id: "tools",
    question: "Which tools would you prefer learning first?",
    options: [
      { id: "tool_python", label: "Python, SQL, notebooks", tracks: ["data_science"] },
      { id: "tool_web", label: "JavaScript, React, APIs", tracks: ["software_engineering"] },
      { id: "tool_security", label: "Linux, networking, SOC tools", tracks: ["cybersecurity"] },
      { id: "tool_design", label: "Figma and design systems", tracks: ["ui_ux"] },
      { id: "tool_ads", label: "Analytics + ad platforms", tracks: ["digital_marketing"] },
      { id: "tool_pm", label: "Roadmaps and product metrics", tracks: ["product_management"] },
    ],
  },
  {
    id: "outcome",
    question: "What impact motivates you most?",
    options: [
      { id: "impact_insights", label: "Turning data into decisions", tracks: ["data_science"] },
      { id: "impact_product", label: "Creating useful digital products", tracks: ["software_engineering", "product_management"] },
      { id: "impact_safety", label: "Keeping people and systems safe", tracks: ["cybersecurity"] },
      { id: "impact_usability", label: "Making products easier to use", tracks: ["ui_ux"] },
      { id: "impact_growth", label: "Scaling reach and engagement", tracks: ["digital_marketing"] },
    ],
  },
];

const catalog: Record<CareerTrack, Omit<CareerRecommendation, "track" | "matchPercentage">> = {
  data_science: {
    careerName: "Data Scientist",
    description: "Build predictive models and convert raw data into business insights.",
    category: "Technology",
    strengths: ["Analytical thinking", "Statistics", "Python and SQL"],
  },
  software_engineering: {
    careerName: "Software Engineer",
    description: "Design, build, and maintain applications used by thousands of users.",
    category: "Technology",
    strengths: ["Problem solving", "Coding fundamentals", "System design"],
  },
  cybersecurity: {
    careerName: "Cybersecurity Analyst",
    description: "Protect organizations against cyber threats and secure digital systems.",
    category: "Technology",
    strengths: ["Risk analysis", "Networking", "Security operations"],
  },
  ui_ux: {
    careerName: "UI/UX Designer",
    description: "Craft smooth user journeys through research, wireframes, and interface design.",
    category: "Design",
    strengths: ["User empathy", "Visual design", "Prototyping"],
  },
  digital_marketing: {
    careerName: "Digital Marketing Specialist",
    description: "Grow brand visibility and conversions through digital channels and analytics.",
    category: "Business",
    strengths: ["Content strategy", "Campaign optimization", "Audience analysis"],
  },
  product_management: {
    careerName: "Product Manager",
    description: "Align business goals, user needs, and engineering execution into product outcomes.",
    category: "Business",
    strengths: ["Prioritization", "Communication", "Product strategy"],
  },
};

const QUIZ_STORAGE_KEY = "acn_quiz_result_v1";

export type QuizResult = {
  recommendations: CareerRecommendation[];
  completedAt: string;
};

export function evaluateQuiz(answerMap: Record<string, string>): CareerRecommendation[] {
  const scores: Record<CareerTrack, number> = {
    data_science: 0,
    software_engineering: 0,
    cybersecurity: 0,
    ui_ux: 0,
    digital_marketing: 0,
    product_management: 0,
  };

  for (const question of quizQuestions) {
    const selected = answerMap[question.id];
    const option = question.options.find((item) => item.id === selected);
    if (!option) {
      continue;
    }
    for (const track of option.tracks) {
      scores[track] += 1;
    }
  }

  const maxScore = Math.max(...Object.values(scores), 1);

  return (Object.keys(scores) as CareerTrack[])
    .map((track) => {
      const base = catalog[track];
      const raw = scores[track];
      const normalized = Math.round((raw / maxScore) * 100);
      const matchPercentage = Math.min(97, Math.max(55, normalized));
      return {
        track,
        careerName: base.careerName,
        description: base.description,
        category: base.category,
        strengths: base.strengths,
        matchPercentage,
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);
}

export function saveQuizResult(recommendations: CareerRecommendation[]): void {
  if (typeof window === "undefined") {
    return;
  }
  const payload: QuizResult = {
    recommendations,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload));
}

export function getQuizResult(): QuizResult | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as QuizResult;
  } catch {
    return null;
  }
}
