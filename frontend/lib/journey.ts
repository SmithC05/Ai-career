export type JourneyState = {
  savedCareer: boolean;
  comparedCareers: boolean;
  askedAdvisor: boolean;
  generatedRoadmap: boolean;
  generatedLearningPath: boolean;
  builtResumePortfolio: boolean;
};

const JOURNEY_KEY = "acn_journey_v0";

const defaultState: JourneyState = {
  savedCareer: false,
  comparedCareers: false,
  askedAdvisor: false,
  generatedRoadmap: false,
  generatedLearningPath: false,
  builtResumePortfolio: false,
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getJourneyState(): JourneyState {
  if (!canUseStorage()) {
    return defaultState;
  }

  const raw = localStorage.getItem(JOURNEY_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<JourneyState>;
    return {
      ...defaultState,
      ...parsed,
    };
  } catch {
    return defaultState;
  }
}

export function setJourneyState(patch: Partial<JourneyState>): JourneyState {
  const next = {
    ...getJourneyState(),
    ...patch,
  };

  if (canUseStorage()) {
    localStorage.setItem(JOURNEY_KEY, JSON.stringify(next));
  }

  return next;
}
