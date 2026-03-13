"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { EmptyState } from "@/components/empty-state";
import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { api } from "@/lib/api";
import { GuidedFlowState, getGuidedFlowState, setGuidedFlowState } from "@/lib/guided-flow";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { CareerSummary, SkillGapResult } from "@/types";
import { Crosshair, ShieldAlert, Rocket, Target, Zap } from "lucide-react";

const defaultFlow: GuidedFlowState = {
  quizCompleted: false,
  recommendationsViewed: false,
  skillGapAnalyzed: false,
  roadmapStarted: false,
  advisorUsed: false,
};

export default function SkillAnalyzerPage() {
  const ready = useAuthGuard();
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [careerId, setCareerId] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [flowState, setFlowState] = useState<GuidedFlowState>(defaultFlow);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(true);

  const selectedCareer = useMemo(
    () => careers.find((career) => career.id === careerId) ?? null,
    [careerId, careers]
  );

  const skills = useMemo(
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
    setLoadingCareers(true);

    api.getCareers()
      .then((items) => {
        setCareers(items);
        if (items.length > 0) setCareerId(items[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load careers. Please try again."))
      .finally(() => setLoadingCareers(false));
  }, [ready]);

  if (!ready) return <AnimatedLoader text="Loading skill analyzer..." fullScreen />;

  const onAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCareer) {
      setError("Please select a career.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await api.skillGapAnalysis(selectedCareer.careerName, skills);
      setResult(response);
      setFlowState(setGuidedFlowState({ skillGapAnalyzed: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to run skill analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <div className="w-full pt-8">
          <JourneyStepper state={flowState} currentHref="/skill-analyzer" />
        </div>
      </FadeIn>

      <SlideUp className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-2">
          <Target className="h-4 w-4 text-rose-400" />
          <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">Target Analysis</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
          Skill Gap Analyzer
        </h1>
        <p className="text-lg text-white/60 mb-6">
          Compare your current technical skills against industry requirements to discover exactly what you need to learn.
        </p>
      </SlideUp>

      <SlideUp delay={0.1} className="w-full max-w-4xl mx-auto">
        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
              <Crosshair className="w-5 h-5 text-indigo-400" /> Configure Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form className="space-y-6" onSubmit={onAnalyze}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-white/80 ml-1">Target Career Role</label>
                  <div className="relative">
                    <select
                      className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white/90 transition-all hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      value={careerId}
                      onChange={(event) => setCareerId(event.target.value)}
                      disabled={loadingCareers || careers.length === 0}
                    >
                      {careers.map((career) => (
                        <option key={career.id} value={career.id} className="bg-background text-foreground">
                          {career.careerName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                      <Target className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/80 ml-1">Your Current Skills</label>
                  <Input 
                    value={skillsInput} 
                    onChange={(event) => setSkillsInput(event.target.value)} 
                    placeholder="e.g. React, Node.js, TypeScript"
                    required 
                  />
                  <div className="mt-3 flex flex-wrap gap-2 min-h-8">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-white/5 border-white/10 text-white/70 py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="hidden md:block">
                  <p className="text-sm text-white/40">Ready to proceed?</p>
                </div>
                <Button
                  type="submit"
                  disabled={loading || loadingCareers || careers.length === 0}
                  variant="premium"
                  className="h-12 px-8 min-w-[200px]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Analyzing...</span>
                  ) : (
                    <span className="flex items-center gap-2">Identify Skill Gaps <Zap className="w-4 h-4" /></span>
                  )}
                </Button>
              </div>
            </form>
            {loadingCareers ? <AnimatedLoader text="Loading available careers..." className="pt-4" /> : null}
            {error ? <FeedbackBanner message={error} tone="error" className="mt-6" /> : null}
          </CardContent>
        </Card>
      </SlideUp>

      {result ? (
        <StaggerChildren staggerDelay={0.1} className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full">
          <StaggerItem>
            <Card className="h-full border-rose-500/20 bg-rose-500/[0.02]">
              <CardHeader className="pb-4">
                 <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center mb-4">
                   <ShieldAlert className="w-5 h-5 text-rose-400" />
                 </div>
                <CardTitle className="text-xl">Missing Skills</CardTitle>
                <p className="text-sm text-white/50">Technologies required for this role</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2.5">
                  {result.missingSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-rose-500/10 text-rose-200 border border-rose-500/20 px-3 py-1.5 text-sm h-auto flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {skill}
                    </Badge>
                  ))}
                  {result.missingSkills.length === 0 && (
                    <p className="text-emerald-400 text-sm font-medium flex items-center gap-2"><Zap className="w-4 h-4" /> You have all required skills!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="h-full border-indigo-500/20 bg-indigo-500/[0.02]">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                   <Rocket className="w-5 h-5 text-indigo-400" />
                 </div>
                <CardTitle className="text-xl">Strategic Actions</CardTitle>
                <p className="text-sm text-white/50">Next steps to bridge the gap</p>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                {result.recommendations.map((item, i) => (
                  <div key={i} className="flex gap-3 text-white/70 p-3 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                     <span className="font-bold text-indigo-400 mt-0.5 w-4 shrink-0">{i+1}.</span>
                     <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerChildren>
      ) : (
        <SlideUp delay={0.2} className="w-full max-w-4xl mx-auto">
          {loading && (
          <SlideUp delay={0.2} className="w-full">
            <AnimatedLoader text="Analyzing your skills..." />
          </SlideUp>
        )}
          {!loading && (
             <Card className="p-12 text-center border-dashed border-white/10 bg-white/[0.01]">
                <Target className="w-12 h-12 text-white/10 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Awaiting Analysis</h3>
                <p className="text-white/40">Select a career and enter your skills above to generate insights.</p>
             </Card>
          )}
        </SlideUp>
      )}

      <SlideUp delay={0.3} className="w-full max-w-4xl mx-auto">
        <NextStepCard
          currentStep="Skill Gap Analysis"
          nextStep="Start Roadmap"
          nextHref="/roadmap"
          helperText="Convert missing skills into a practical multi-stage learning roadmap."
        />
      </SlideUp>
    </div>
  );
}
