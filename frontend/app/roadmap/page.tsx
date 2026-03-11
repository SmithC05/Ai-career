"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Trophy, Route, Zap, Crown } from "lucide-react";

import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
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

  const [targetCareer, setTargetCareer] = useState("Data Scientist");
  const [skillsInput, setSkillsInput] = useState("Python, SQL, Statistics");
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

  if (!ready) return null;

  const analyzeSkillGap = async () => {
    setError(null);
    setLoadingSkillGap(true);

    try {
      const result = await api.skillGapAnalysis(targetCareer, currentSkills);
      setSkillGap(result);
      setFlowState(setGuidedFlowState({ skillGapAnalyzed: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Skill gap analysis failed");
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
      setError(err instanceof Error ? err.message : "Roadmap generation failed");
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const totalPhases = roadmap?.roadmap.steps.length ?? 0;
  const completedCount = Object.values(completedPhases).filter(Boolean).length;
  const stageProgress = totalPhases === 0 ? 0 : Math.round((completedCount / totalPhases) * 100);

  return (
    <div className="flex flex-col gap-12 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <div className="w-full pt-8">
          <JourneyStepper state={flowState} currentHref="/roadmap" />
        </div>
      </FadeIn>

      <SlideUp className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-2">
          <Route className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">Growth Roadmap</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
          Master Your Career Path
        </h1>
        <p className="text-lg text-white/60 mb-6">
          Generate an AI-powered timeline tailored exactly to your skill gap and availability.
        </p>
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
                      className="h-12 border-white/10 bg-black/40 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1">Current Skills</label>
                    <Input 
                      value={skillsInput} 
                      onChange={(event) => setSkillsInput(event.target.value)} 
                      required 
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
            <SlideUp delay={0.3} className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <div className="p-12 text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No roadmap generated</h3>
                <p className="text-white/40 leading-relaxed">Fill out the generator settings on the left and click &quot;Generate Roadmap&quot; to create your personalized plan.</p>
              </div>
            </SlideUp>
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
                      
                      <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden relative border border-white/5">
                        <motion.div
                          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${stageProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </CardContent>
                 </Card>
              </SlideUp>

              <div className="relative pt-4">
                {/* Vertical timeline glowing line */}
                <div className="absolute top-0 bottom-0 left-[27px] w-0.5 bg-gradient-to-b from-emerald-500/50 via-teal-500/20 to-transparent" />
                
                <StaggerChildren staggerDelay={0.15} className="space-y-8">
                  {roadmap.roadmap.steps.map((step, idx) => {
                    const isCompleted = completedPhases[step.phase];
                    
                    return (
                      <StaggerItem key={`${roadmap.roadmapId}-${step.phase}`}>
                        <div className="relative pl-16 group">
                           {/* Timeline dot */}
                           <div className={`absolute left-4 top-5 w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-500 shadow-xl ${
                             isCompleted ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/20 group-hover:border-emerald-500/50"
                           }`}>
                             {isCompleted ? (
                               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                               </motion.div>
                             ) : (
                               <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-emerald-500/50" />
                             )}
                           </div>

                           <Card className={`overflow-hidden transition-all duration-500 ${
                             isCompleted 
                               ? 'border-emerald-500/30 bg-emerald-500/[0.03] shadow-[0_0_30px_rgba(16,185,129,0.05)]' 
                               : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                           }`}>
                              <CardContent className="p-0">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                  <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                      <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Phase {step.phase}</span>
                                      <h3 className="text-xl md:text-2xl font-bold text-white">{step.title}</h3>
                                    </div>
                                    <p className="text-white/60 text-sm leading-relaxed max-w-2xl">{step.details}</p>
                                    
                                    <div className="pt-4 border-t border-white/5 space-y-3">
                                      <div className="flex justify-between items-center mb-1">
                                         <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Key Milestones & Focus</h4>
                                         <Trophy className="w-3.5 h-3.5 text-amber-500/70" />
                                      </div>
                                      <div className="grid gap-2">
                                        {step.resources.map((resource, i) => (
                                          <div key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0" />
                                            <span className="text-xs md:text-sm text-white/80">{resource}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center pt-2 md:pt-0">
                                    <Button
                                      variant={isCompleted ? "secondary" : "outline"}
                                      onClick={() => setCompletedPhases(prev => ({ ...prev, [step.phase]: !prev[step.phase] }))}
                                      className={`h-10 rounded-xl px-6 font-semibold transition-all w-full md:w-auto ${
                                        isCompleted
                                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                                          : "bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-white border-white/10"
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <span className="flex items-center gap-2">Completed <CheckCircle2 className="w-4 h-4" /></span>
                                      ) : "Mark as Done"}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                           </Card>
                        </div>
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
    </div>
  );
}
