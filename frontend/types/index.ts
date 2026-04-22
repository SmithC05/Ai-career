export type AuthResponse = {
  userId: string;
  fullName: string;
  email: string;
  token: string;
};

export type CareerSummary = {
  id: string;
  careerName: string;
  avgSalary: number;
  growthRate: string;
  difficulty: string;
};

export type CareerDetail = {
  id: string;
  careerName: string;
  description: string;
  avgSalary: number;
  jobSecurity: string;
  growthRate: string;
  difficulty: string;
  jobDemand: string;
  workLifeBalance: string;
  requiredSkills: string[];
};

export type CareerComparison = {
  careerA: {
    id: string;
    careerName: string;
    avgSalary: number;
    jobDemand: string;
    difficulty: string;
    workLifeBalance: string;
    growthRate: string;
  };
  careerB: {
    id: string;
    careerName: string;
    avgSalary: number;
    jobDemand: string;
    difficulty: string;
    workLifeBalance: string;
    growthRate: string;
  };
  summary: string;
};

export type QuizRecommendation = {
  careerId: string;
  careerName: string;
  description: string;
  category: string;
  matchPercentage: number;
  strengths: string[];
};

export type QuizSubmitResponse = {
  recommendations: QuizRecommendation[];
  completedAt: string;
};

export type CareerAdvice = {
  answer: string;
  suggestedCareers: string[];
  nextSteps: string[];
};

export type AdvisorChatHistoryItem = {
  id: string;
  question: string;
  answer: string;
  suggestedCareers: string[];
  nextSteps: string[];
  createdAt: string;
};

export type SkillGapResult = {
  targetCareer: string;
  currentSkills: string[];
  missingSkills: string[];
  recommendations: string[];
};

export type RoadmapStep = {
  phase: number;
  title: string;
  details: string;
  resources: string[];
};

export type RoadmapResult = {
  targetCareer: string;
  timelineMonths: number;
  summary: string;
  steps: RoadmapStep[];
};

export type LearningPathMilestone = {
  week: number;
  focus: string;
  outcomes: string[];
  tasks: string[];
};

export type LearningPathResult = {
  targetCareer: string;
  timelineMonths: number;
  weeklyHours: number;
  learningStyle: string;
  summary: string;
  milestones: LearningPathMilestone[];
  resources: string[];
};

export type LearningPathListItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type ResumeSection = {
  heading: string;
  bullets: string[];
};

export type PortfolioProject = {
  name: string;
  problem: string;
  solution: string;
  stack: string[];
  impact: string;
};

export type ResumePortfolioResult = {
  headline: string;
  professionalSummary: string;
  resumeSections: ResumeSection[];
  portfolioProjects: PortfolioProject[];
  atsKeywords: string[];
};

export type ResumePortfolioListItem = {
  id: string;
  title: string;
  targetCareer: string;
  content: string;
  createdAt: string;
};

export type DashboardData = {
  savedCareers: CareerSummary[];
  roadmaps: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }[];
  learningPaths: LearningPathListItem[];
  resumePortfolios: ResumePortfolioListItem[];
  recommendations: CareerSummary[];
  analytics: {
    completionScore: number;
    completedMilestones: number;
    totalMilestones: number;
    weeklyTarget: number;
    weeklyProgress: number;
    previousWeekProgress: number;
    trendPercentage: number;
    trendDirection: "UP" | "DOWN" | "STABLE";
  };
};

export type GeneratedRoadmapResponse = {
  roadmapId: string;
  roadmap: RoadmapResult;
};

export type GeneratedLearningPathResponse = {
  learningPathId: string;
  learningPath: LearningPathResult;
};

export type GeneratedResumePortfolioResponse = {
  resumePortfolioId: string;
  resumePortfolio: ResumePortfolioResult;
};

// ── Resume Analyser ─────────────────────────────────────────────────────────

export type ResumeAnalysis = {
  id: string;
  extractedSkills: string[];
  jobDescription: string | null;
  matchScore: number;
  suggestions: string[];
  improvementAreas: string[];
  createdAt: string;
};

// ── Interview Assistant ─────────────────────────────────────────────────────

export type InterviewQuestion = {
  question: string;
  type: string;
  expectedKeywords: string[];
};

export type InterviewFeedback = {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
} | null;

export type InterviewSession = {
  id: string;
  targetRole: string;
  difficulty: string;
  questions: InterviewQuestion[];
  answers: string[];
  feedback: InterviewFeedback[];
  createdAt: string;
};

export type InterviewSessionListItem = {
  id: string;
  targetRole: string;
  difficulty: string;
  createdAt: string;
};
