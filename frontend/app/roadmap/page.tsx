"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Route, Zap, Crown } from "lucide-react";

import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { PageContainer } from "@/components/page-container";
import { ProgressBar } from "@/components/progress-bar";
import { RoadmapStage } from "@/components/roadmap-stage";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { api } from "@/lib/api";
import { GuidedFlowState, getGuidedFlowState, setGuidedFlowState } from "@/lib/guided-flow";
import { setJourneyState } from "@/lib/journey";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { GeneratedRoadmapResponse, SkillGapResult } from "@/types";

const defaultFlow: GuidedFlowState = {
  quizCompleted: false,
  recommendationsViewed: false,
  skillGapAnalyzed: false,
  roadmapStarted: false,
  advisorUsed: false,
};

export default function RoadmapPage() {
  const ready = useAuthGuard();

  const [targetCareer, setTargetCareer] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [timelineMonths, setTimelineMonths] = useState(6);
  const [skillGap, setSkillGap] = useState<SkillGapResult | null>(null);
  const [roadmap, setRoadmap] = useState<GeneratedRoadmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSkillGap, setLoadingSkillGap] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [completedPhases, setCompletedPhases] = useState<Record<number, boolean>>({});
  const [flowState, setFlowState] = useState<GuidedFlowState>(defaultFlow);

  const currentSkills = useMemo(
    () =>
      skillsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [skillsInput]
  );

  useEffect(() => {
    if (!ready) return;
    setFlowState(getGuidedFlowState());
  }, [ready]);

  if (!ready) return <AnimatedLoader text="Loading roadmap workspace..." fullScreen />;

  const analyzeSkillGap = async () => {
    setError(null);
    setLoadingSkillGap(true);

    try {
      const result = await api.skillGapAnalysis(targetCareer, currentSkills);
      setSkillGap(result);
      setFlowState(setGuidedFlowState({ skillGapAnalyzed: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze the skill gap. Please try again.");
    } finally {
      setLoadingSkillGap(false);
    }
  };

  const generateRoadmap = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoadingRoadmap(true);

    try {
      const result = await api.generateRoadmap({
        targetCareer,
        currentSkills,
        timelineMonths,
      });
      setRoadmap(result);
      setJourneyState({ generatedRoadmap: true });
      setCompletedPhases({});
      setFlowState(setGuidedFlowState({ roadmapStarted: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate roadmap. Please try again.");
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const totalPhases = roadmap?.roadmap.steps.length ?? 0;
  const completedCount = Object.values(completedPhases).filter(Boolean).length;
  const stageProgress = totalPhases === 0 ? 0 : Math.round((completedCount / totalPhases) * 100);

  return (
    <PageContainer className="gap-12">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <div className="w-full pt-8">
          <JourneyStepper state={flowState} currentHref="/roadmap" />
        </div>
      </FadeIn>

      <SlideUp>
        <SectionHeader
          align="center"
          badge="Growth Roadmap"
          icon={<Route className="h-4 w-4 text-emerald-400" />}
          title="Master Your Career Path"
          description="Generate an AI-powered timeline tailored exactly to your skill gap and availability."
        />
      </SlideUp>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 max-w-6xl mx-auto w-full items-start">
        {/* Left Sidebar: Generator */}
        <div className="flex flex-col gap-6 sticky top-24">
          <SlideUp delay={0.1}>
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-emerald-400" /> Generator Setup</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 relative z-10">
                <form className="space-y-6" onSubmit={generateRoadmap}>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1">Target Career</label>
                    <Input 
                      value={targetCareer} 
                      onChange={(event) => setTargetCareer(event.target.value)} 
                      required 
                      placeholder="e.g. Data Scientist"
                      className="h-12 border-white/10 bg-black/40 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1">Current Skills</label>
                    <Input 
                      value={skillsInput} 
                      onChange={(event) => setSkillsInput(event.target.value)} 
                      required 
                      placeholder="e.g. Python, SQL, Statistics"
                      className="h-12 border-white/10 bg-black/40 text-white placeholder:text-white/30"
                    />
                    {currentSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {currentSkills.map((skill) => (
                          <span key={skill} className="text-[10px] uppercase tracking-wider font-bold bg-white/10 text-white/70 px-2 py-0.5 rounded border border-white/5">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1">Timeline Goals</label>
                      <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{timelineMonths} months</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={24}
                      value={timelineMonths}
                      onChange={(event) => setTimelineMonths(Number(event.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <Button type="button" variant="outline" className="h-11 w-full border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.02)]" disabled={loadingSkillGap} onClick={analyzeSkillGap}>
                      {loadingSkillGap ? "Analyzing Gap..." : "1. Analyze Skill Gap"}
                    </Button>
                    <Button type="submit" variant="premium" className="h-12 w-full shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-500/50" disabled={loadingRoadmap}>
                      {loadingRoadmap ? "Generating Roadmap..." : "2. Generate Roadmap"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </SlideUp>

          {skillGap && (
            <SlideUp delay={0.2}>
              <Card className="border-indigo-500/20 bg-indigo-500/[0.02] overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-indigo-100">Quick Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                   <div className="flex flex-wrap gap-2">
                     {skillGap.missingSkills.slice(0, 5).map(skill => (
                       <Badge key={skill} variant="secondary" className="bg-rose-500/10 text-rose-300 border-none font-medium">Missing: {skill}</Badge>
                     ))}
                   </div>
                   <p className="text-xs text-white/40 italic">Roadmap generation recommended to organize these skills into a timeline.</p>
                </CardContent>
              </Card>
            </SlideUp>
          )}
          {error && <FeedbackBanner message={error} tone="error" className="w-full" />}
        </div>

        {/* Right Content: The Roadmap Output */}
        <div className="flex flex-col gap-8 w-full min-h-[500px]">
          {!roadmap ? (
            loadingRoadmap ? (
              <SlideUp delay={0.3} className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <AnimatedLoader text="Generating your roadmap..." />
              </SlideUp>
            ) : (
              <SlideUp delay={0.3} className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <div className="p-12 text-center max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Crown className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No roadmap generated</h3>
                  <p className="text-white/40 leading-relaxed">
                    Fill out the generator settings on the left and click &quot;Generate Roadmap&quot; to create your personalized plan.
                  </p>
                </div>
              </SlideUp>
            )
          ) : (
            <div className="space-y-10">
              <SlideUp delay={0.2}>
                 <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                        <div className="space-y-2 flex-1">
                          <h2 className="text-2xl font-black text-white">Your Master Plan</h2>
                          <p className="text-emerald-100/70 text-sm leading-relaxed">{roadmap.roadmap.summary}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 bg-black/40 rounded-xl p-4 border border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Completion</span>
                          <span className="text-3xl font-black text-white">{stageProgress}%</span>
                        </div>
                      </div>

                      <ProgressBar
                        value={stageProgress}
                        barClassName="bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      />
                    </CardContent>
                 </Card>
              </SlideUp>

              <div className="relative pt-4">
                {/* Vertical timeline glowing line */}
                <div className="absolute top-0 bottom-0 left-[27px] w-0.5 bg-gradient-to-b from-emerald-500/50 via-teal-500/20 to-transparent" />
                
                <StaggerChildren staggerDelay={0.15} className="space-y-8">
                  {roadmap.roadmap.steps.map((step) => {
                    const isCompleted = completedPhases[step.phase];
                    
                    return (
                      <StaggerItem key={`${roadmap.roadmapId}-${step.phase}`}>
                        <RoadmapStage
                          phase={step.phase}
                          title={step.title}
                          details={step.details}
                          resources={step.resources}
                          completed={Boolean(isCompleted)}
                          onToggleComplete={() =>
                            setCompletedPhases((prev) => ({ ...prev, [step.phase]: !prev[step.phase] }))
                          }
                        />
                      </StaggerItem>
                    );
                  })}
                </StaggerChildren>
              </div>
            </div>
          )}
        </div>
      </div>

      <SlideUp delay={0.4} className="w-full max-w-4xl mx-auto mt-12">
        <NextStepCard
          currentStep="Career Roadmap"
          nextStep="Ask AI Career Advisor"
          nextHref="/advisor"
          helperText="Use your AI advisor to get custom learning resources for your current roadmap phase."
        />
      </SlideUp>
    </PageContainer>
  );
}
