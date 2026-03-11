export type GuidedFlowState = {
  quizCompleted: boolean;
  recommendationsViewed: boolean;
  skillGapAnalyzed: boolean;
  roadmapStarted: boolean;
  advisorUsed: boolean;
};

export type GuidedStep = {
  key: keyof GuidedFlowState;
  label: string;
  href: string;
  action: string;
};

const STORAGE_KEY = "acn_guided_flow_v1";

const defaultState: GuidedFlowState = {
  quizCompleted: false,
  recommendationsViewed: false,
  skillGapAnalyzed: false,
  roadmapStarted: false,
  advisorUsed: false,
};

export const guidedSteps: GuidedStep[] = [
  { key: "quizCompleted", label: "Career Quiz", href: "/quiz", action: "Take Career Quiz" },
  {
    key: "recommendationsViewed",
    label: "Recommendations",
    href: "/recommendations",
    action: "View Recommendations",
  },
  {
    key: "skillGapAnalyzed",
    label: "Skill Gap Analysis",
    href: "/skill-analyzer",
    action: "Analyze Skill Gap",
  },
  { key: "roadmapStarted", label: "Career Roadmap", href: "/roadmap", action: "Start Roadmap" },
  { key: "advisorUsed", label: "AI Career Advisor", href: "/advisor", action: "Ask AI Advisor" },
];

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getGuidedFlowState(): GuidedFlowState {
  if (!canUseStorage()) {
    return defaultState;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    return {
      ...defaultState,
      ...(JSON.parse(raw) as Partial<GuidedFlowState>),
    };
  } catch {
    return defaultState;
  }
}

export function setGuidedFlowState(patch: Partial<GuidedFlowState>): GuidedFlowState {
  const next = {
    ...getGuidedFlowState(),
    ...patch,
  };
  if (canUseStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function getNextGuidedStep(state: GuidedFlowState): GuidedStep | null {
  for (const step of guidedSteps) {
    if (!state[step.key]) {
      return step;
    }
  }
  return null;
}
