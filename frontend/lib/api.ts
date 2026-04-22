import {
  AdvisorChatHistoryItem,
  AuthResponse,
  CareerAdvice,
  CareerComparison,
  CareerDetail,
  CareerSummary,
  DashboardData,
  GeneratedLearningPathResponse,
  GeneratedRoadmapResponse,
  GeneratedResumePortfolioResponse,
  InterviewFeedback,
  InterviewSession,
  InterviewSessionListItem,
  LearningPathListItem,
  QuizSubmitResponse,
  ResumeAnalysis,
  ResumePortfolioListItem,
  SkillGapResult,
} from "@/types";
import { getToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.auth) {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignore parse failures
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
  }) => request<AuthResponse>("/auth/register", { method: "POST", body: payload }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: payload }),

  getCareers: () => request<CareerSummary[]>("/careers", { auth: true }),

  getCareerById: (careerId: string) => request<CareerDetail>(`/careers/${careerId}`, { auth: true }),

  submitQuiz: (answers: Record<string, string>) =>
    request<QuizSubmitResponse>("/quiz/submit", {
      method: "POST",
      auth: true,
      body: { answers },
    }),

  compareCareers: (careerA: string, careerB: string) =>
    request<CareerComparison>(`/careers/compare?careerA=${careerA}&careerB=${careerB}`, { auth: true }),

  getDashboard: () => request<DashboardData>("/dashboard", { auth: true }),

  saveCareer: (careerId: string) =>
    request<void>(`/dashboard/saved-careers/${careerId}`, { method: "POST", auth: true }),

  removeSavedCareer: (careerId: string) =>
    request<void>(`/dashboard/saved-careers/${careerId}`, { method: "DELETE", auth: true }),

  careerAdvice: (question: string) =>
    request<CareerAdvice>("/ai/career-advice", {
      method: "POST",
      auth: true,
      body: { question },
    }),

  getAdvisorHistory: () => request<AdvisorChatHistoryItem[]>("/ai/chat-history", { auth: true }),

  skillGapAnalysis: (targetCareer: string, currentSkills: string[]) =>
    request<SkillGapResult>("/ai/skill-gap-analysis", {
      method: "POST",
      auth: true,
      body: { targetCareer, currentSkills },
    }),

  generateRoadmap: (payload: {
    targetCareer: string;
    currentSkills: string[];
    timelineMonths: number;
  }) =>
    request<GeneratedRoadmapResponse>("/roadmaps/generate", {
      method: "POST",
      auth: true,
      body: payload,
    }),

  getRoadmaps: () => request<DashboardData["roadmaps"]>("/roadmaps", { auth: true }),

  generateLearningPath: (payload: {
    targetCareer: string;
    currentSkills: string[];
    weeklyHours: number;
    learningStyle: string;
    timelineMonths: number;
  }) =>
    request<GeneratedLearningPathResponse>("/learning-paths/generate", {
      method: "POST",
      auth: true,
      body: payload,
    }),

  getLearningPaths: () => request<LearningPathListItem[]>("/learning-paths", { auth: true }),

  generateResumePortfolio: (payload: {
    targetCareer: string;
    fullName: string;
    education: string;
    skills: string[];
    projects: string[];
    achievements: string[];
    experiences: string[];
    links: string[];
  }) =>
    request<GeneratedResumePortfolioResponse>("/resume-portfolio/generate", {
      method: "POST",
      auth: true,
      body: payload,
    }),

  getResumePortfolios: () => request<ResumePortfolioListItem[]>("/resume-portfolio", { auth: true }),

  // ── Resume Analyser ────────────────────────────────────────────────────────

  analyseResume: (formData: FormData) => {
    const token = getToken();
    if (!token) return Promise.reject(new Error("Authentication required"));
    return fetch(`${API_BASE_URL}/resume/analyse`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        let msg = `Request failed with status ${res.status}`;
        try { const d = await res.json(); if (d?.message) msg = d.message; } catch { /* ignore */ }
        throw new Error(msg);
      }
      return res.json() as Promise<ResumeAnalysis>;
    });
  },

  getResumeAnalysis: (id: string) =>
    request<ResumeAnalysis>(`/resume/${id}`, { auth: true }),

  // ── Interview Assistant ────────────────────────────────────────────────────

  startInterviewSession: (role: string, difficulty: string) =>
    request<InterviewSession>("/interview/start", {
      method: "POST",
      auth: true,
      body: { role, difficulty },
    }),

  evaluateInterviewAnswer: (sessionId: string, questionIndex: number, answer: string) =>
    request<NonNullable<InterviewFeedback>>("/interview/evaluate", {
      method: "POST",
      auth: true,
      body: { sessionId, questionIndex, answer },
    }),

  getInterviewSessions: () =>
    request<InterviewSessionListItem[]>("/interview/sessions", { auth: true }),

  getInterviewSession: (id: string) =>
    request<InterviewSession>(`/interview/sessions/${id}`, { auth: true }),
};
