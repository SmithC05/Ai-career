"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Target, TrendingUp, Settings, Map, Sparkles, BookOpen, Briefcase, Activity } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { OnboardingTour } from "@/components/onboarding-tour";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { api } from "@/lib/api";
import { getQuizResult } from "@/lib/career-quiz";
import { GuidedFlowState, getGuidedFlowState, setGuidedFlowState } from "@/lib/guided-flow";
import { setJourneyState } from "@/lib/journey";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { DashboardData } from "@/types";

type ChecklistStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  done: boolean;
};

function extractRoadmapSummary(content: string): string {
  try {
    const parsed = JSON.parse(content) as { summary?: string };
    return parsed.summary ?? content;
  } catch {
    return content;
  }
}

function extractLearningPathSummary(content: string): string {
  try {
    const parsed = JSON.parse(content) as { summary?: string };
    return parsed.summary ?? content;
  } catch {
    return content;
  }
}

function extractResumeSummary(content: string): string {
  try {
    const parsed = JSON.parse(content) as { professionalSummary?: string };
    return parsed.professionalSummary ?? content;
  } catch {
    return content;
  }
}

function trendLabel(direction: "UP" | "DOWN" | "STABLE", value: number): string {
  if (direction === "UP") {
    return `Up ${Math.abs(value)}% vs last week`;
  }
  if (direction === "DOWN") {
    return `Down ${Math.abs(value)}% vs last week`;
  }
  return "Stable vs last week";
}

export default function DashboardPage() {
  const ready = useAuthGuard();
  const [data, setData] = useState<DashboardData | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [flowState, setFlowState] = useState<GuidedFlowState>({
    quizCompleted: false,
    recommendationsViewed: false,
    skillGapAnalyzed: false,
    roadmapStarted: false,
    advisorUsed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [tourToken, setTourToken] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;

    const hasQuiz = Boolean(getQuizResult());
    setQuizCompleted(hasQuiz);
    setFlowState(hasQuiz ? setGuidedFlowState({ quizCompleted: true }) : getGuidedFlowState());

    api.getDashboard()
      .then((dashboard) => {
        setData(dashboard);

        const nextJourney = setJourneyState({
          savedCareer: dashboard.savedCareers.length > 0,
          generatedRoadmap: dashboard.roadmaps.length > 0,
          generatedLearningPath: (dashboard.learningPaths?.length ?? 0) > 0,
          builtResumePortfolio: (dashboard.resumePortfolios?.length ?? 0) > 0,
        });

        setFlowState(setGuidedFlowState({ roadmapStarted: dashboard.roadmaps.length > 0 }));
        if (nextJourney.askedAdvisor) {
          setFlowState(setGuidedFlowState({ advisorUsed: true, roadmapStarted: dashboard.roadmaps.length > 0 }));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, [ready]);

  const steps: ChecklistStep[] = useMemo(() => {
    return [
      {
        id: "career-quiz",
        title: "Take Career Quiz",
        description: "Answer guided questions to identify matching roles.",
        href: "/quiz",
        done: quizCompleted || flowState.quizCompleted,
      },
      {
        id: "career-recommendation",
        title: "Review Recommendations",
        description: "Explore matches and shortlist your best options.",
        href: "/recommendations",
        done: flowState.recommendationsViewed,
      },
      {
        id: "skill-gap",
        title: "Analyze Skill Gap",
        description: "Compare skills to target role requirements.",
        href: "/skill-analyzer",
        done: flowState.skillGapAnalyzed,
      },
      {
        id: "roadmap",
        title: "Start Career Roadmap",
        description: "Generate a stage-wise learning roadmap.",
        href: "/roadmap",
        done: flowState.roadmapStarted || Boolean(data && data.roadmaps.length > 0),
      },
      {
        id: "advisor",
        title: "Personal AI Advisor",
        description: "Ask role-specific questions and refine plans.",
        href: "/advisor",
        done: flowState.advisorUsed,
      },
    ];
  }, [data, flowState, quizCompleted]);

  const completedCount = steps.filter((step) => step.done).length;
  const localProgress = Math.round((completedCount / steps.length) * 100);
  const analyticsProgress = data?.analytics.completionScore ?? 0;
  const progress = Math.max(localProgress, analyticsProgress);
  const nextStep = steps.find((step) => !step.done) ?? null;

  if (!ready) return null;

  const analytics = data?.analytics;

  return (
    <div className="flex flex-col gap-10 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <OnboardingTour
        storageKey="acn_first_login_tour"
        forceStartToken={tourToken}
        steps={[
          {
            targetId: "tour-progress",
            title: "Track your progress",
            description: "This panel shows your completion score and milestone count.",
          },
          {
            targetId: "tour-checklist",
            title: "Follow this checklist",
            description: "Complete these guided actions in order for the best career discovery flow.",
          },
          {
            targetId: "tour-analytics",
            title: "Watch weekly momentum",
            description: "Monitor weekly target and trend so you stay on track.",
          },
          {
            targetId: "tour-recommendations",
            title: "Use recommendations",
            description: "Open suggested careers and move to comparison or roadmap next.",
          },
        ]}
      />

      <FadeIn>
        <PageHeader
          badge="Control Center"
          title="Student Dashboard"
          description="Track your journey, monitor progress, and access your personalized resources."
          actions={[]}
          rightContent={
            <div className="flex flex-col sm:flex-row items-end gap-4 mt-6 sm:mt-0">
              <div data-tour-id="tour-progress" className="min-w-48 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-4 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex-1">
                   <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1">Journey Progress</p>
                   <p className="text-3xl font-black text-white">{progress}%</p>
                </div>
                {progress === 100 ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-indigo-500" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" className="text-white/50 hover:text-white" onClick={() => setTourToken(Date.now())}>
                Replay Tour
              </Button>
            </div>
          }
        />
      </FadeIn>

      {error && <FeedbackBanner message={error} tone="error" />}
      {!data && !error && <AnimatedLoader text="Loading your dashboard..." fullScreen />}

      <SlideUp delay={0.1}>
        <JourneyStepper state={flowState} currentHref="/dashboard" />
      </SlideUp>

      {nextStep ? (
        <SlideUp delay={0.2}>
          <NextStepCard
            currentStep="Dashboard"
            nextStep={nextStep.title}
            nextHref={nextStep.href}
            helperText={nextStep.description}
          />
        </SlideUp>
      ) : (
        <SlideUp delay={0.2}>
          <FeedbackBanner message="Incredible momentum. You have completed the full guided career discovery journey!" tone="success" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-200" />
        </SlideUp>
      )}

      {analytics && (
        <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour-id="tour-analytics">
          <StaggerItem>
            <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                   </div>
                   <Badge variant="outline" className="bg-white/5 text-white/50 border-white/10">All Time</Badge>
                </div>
                <p className="text-sm font-semibold text-white/70 mb-1">Completion Score</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-white">{analytics.completionScore}%</p>
                  <p className="text-sm text-white/40 mb-1 pb-0.5">{analytics.completedMilestones}/{analytics.totalMilestones} milestones</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                     <Target className="h-5 w-5 text-indigo-400" />
                   </div>
                   <Badge variant="outline" className="bg-white/5 text-white/50 border-white/10">This Week</Badge>
                </div>
                <p className="text-sm font-semibold text-white/70 mb-2">Weekly Target</p>
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-black text-white">{analytics.weeklyProgress}/{analytics.weeklyTarget}</p>
                  <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                      style={{ width: `${Math.min(100, (analytics.weeklyProgress / analytics.weeklyTarget) * 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                       <TrendingUp className="h-5 w-5 text-orange-400" />
                     </div>
                     <Badge variant="outline" className={analytics.trendDirection === "UP" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : analytics.trendDirection === "DOWN" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-white/5 text-white/60 border-white/10"}>
                        {trendLabel(analytics.trendDirection, analytics.trendPercentage)}
                     </Badge>
                  </div>
                  <p className="text-sm font-semibold text-white/70">Momentum Trend</p>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-3xl font-black text-white">{analytics.trendPercentage}%</p>
                  <p className="text-xs font-medium text-white/30 border border-white/5 bg-white/5 px-2 py-1 rounded-md">Prev: {analytics.previousWeekProgress}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerChildren>
      )}

      {/* Bento Grid Analytics & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (Skills and Onboarding) */}
        <div className="lg:col-span-1 space-y-6">
          <SlideUp delay={0.4}>
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2"><Settings className="w-4 h-4 text-sky-400" /> Skill Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                {[
                  { label: "Core Foundations", value: Math.min(100, Math.max(10, progress - 15)), color: "from-sky-500 to-indigo-500" },
                  { label: "Applied Projects", value: Math.min(100, Math.max(8, progress - 5)), color: "from-indigo-500 to-purple-500" },
                  { label: "Career Readiness", value: Math.min(100, Math.max(5, progress - 25)), color: "from-purple-500 to-rose-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/80">{item.label}</p>
                      <p className="text-xs font-bold text-white/50">{item.value}%</p>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </SlideUp>

          <SlideUp delay={0.5}>
            <Card data-tour-id="tour-checklist" className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass flex flex-col overflow-hidden max-h-[450px]">
              <CardHeader className="pb-3 border-b border-white/5 sticky top-0 bg-black/40 backdrop-blur-xl z-10">
                <CardTitle className="text-lg flex items-center gap-2"><Map className="w-4 h-4 text-emerald-400" /> Onboarding Checklist</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex flex-col">
                  {steps.map((step, idx) => (
                    <div key={step.id} className={`p-5 flex gap-4 ${idx !== steps.length - 1 ? 'border-b border-white/5' : ''} ${step.done ? 'bg-white/[0.01]' : 'bg-white/[0.04] hover:bg-white/[0.06] transition-colors'}`}>
                       <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border mt-0.5 ${
                         step.done ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/20 text-white/30'
                       }`}>
                         {step.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                       </div>
                       <div className="flex-1">
                          <p className={`text-sm font-bold ${step.done ? 'text-white/60' : 'text-white'}`}>{step.title}</p>
                          <p className="text-xs text-white/40 mt-1 mb-3">{step.description}</p>
                          <Link href={step.href}>
                             <Button size="sm" variant={step.done ? "ghost" : "outline"} className={step.done ? 'h-7 px-3 text-xs opacity-50' : 'h-8 px-4 text-xs bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white'}>
                               {step.done ? "Review" : "Start Now"}
                             </Button>
                          </Link>
                       </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideUp>
        </div>

        {/* Middle Col (Careers & Roadmaps) */}
        <div className="lg:col-span-1 space-y-6">
          <SlideUp delay={0.6} className="h-full">
            <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass flex flex-col" data-tour-id="tour-saved">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-400" /> Saved Careers</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                {data && data.savedCareers.length > 0 ? (
                  <div className="space-y-3">
                    {data.savedCareers.map((career) => (
                      <div key={career.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                        <p className="font-bold text-white group-hover:text-indigo-300 transition-colors">{career.careerName}</p>
                        <p className="text-xs text-white/50 mt-1 flex items-center gap-1.5"><Activity className="w-3 h-3" /> Average Salary: <span className="text-white/80 font-semibold">${career.avgSalary.toLocaleString()}</span></p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No saved careers" description="Save careers from the explorer." action={<Link href="/careers"><Button size="sm" variant="outline" className="mt-2 border-white/10">Browse Careers</Button></Link>} />
                )}
              </CardContent>
            </Card>
          </SlideUp>

          <SlideUp delay={0.7}>
            <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass flex flex-col">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2"><Target className="w-4 h-4 text-rose-400" /> Roadmaps</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                {data && data.roadmaps.length > 0 ? (
                  <div className="space-y-3">
                    {data.roadmaps.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-pointer" onClick={() => window.location.href='/roadmap'}>
                        <p className="font-bold text-white group-hover:text-rose-300 transition-colors">{item.title}</p>
                        <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed">{extractRoadmapSummary(item.content)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No roadmap yet" description="Generate your first AI roadmap." action={<Link href="/roadmap"><Button size="sm" variant="outline" className="mt-2 border-white/10">Generate Now</Button></Link>} />
                )}
              </CardContent>
            </Card>
          </SlideUp>
        </div>

        {/* Right Col (Recommendations & Learning) */}
        <div className="lg:col-span-1 space-y-6">
           <SlideUp delay={0.8} className="h-full">
            <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass flex flex-col" data-tour-id="tour-recommendations">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                {data && data.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {data.recommendations.map((career) => (
                      <Link href={`/careers/${career.id}`} key={career.id} className="block group">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-500/30 transition-all">
                          <p className="font-bold text-white group-hover:text-amber-300 transition-colors">{career.careerName}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500/80 border-amber-500/20 px-2 py-0 text-[10px] uppercase font-bold tracking-wider rounded">Growth: {career.growthRate}</Badge>
                            <span className="text-xs font-medium text-white/40 group-hover:text-amber-400 transition-colors flex items-center gap-1">View Details &rarr;</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No matches found" description="Take the quiz to generate matches." action={<Link href="/quiz"><Button size="sm" variant="outline" className="mt-2 border-white/10">Take Quiz</Button></Link>} />
                )}
              </CardContent>
            </Card>
          </SlideUp>

          <SlideUp delay={0.9}>
            <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass flex flex-col">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-400" /> Learning Paths</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                {data && (data.learningPaths?.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {data.learningPaths.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-pointer" onClick={() => window.location.href='/learning-path'}>
                        <p className="font-bold text-white group-hover:text-purple-300 transition-colors">{item.title}</p>
                        <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed">{extractLearningPathSummary(item.content)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No paths yet" description="Generate a learning schedule." action={<Link href="/learning-path"><Button size="sm" variant="outline" className="mt-2 border-white/10">Build Path</Button></Link>} />
                )}
              </CardContent>
            </Card>
          </SlideUp>
        </div>

      </div>
    </div>
  );
}
