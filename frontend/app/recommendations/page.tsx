"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { EmptyState } from "@/components/empty-state";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { CareerRecommendation, getQuizResult } from "@/lib/career-quiz";
import { GuidedFlowState, getGuidedFlowState, setGuidedFlowState } from "@/lib/guided-flow";
import { Sparkles, ArrowRight, Zap, Target } from "lucide-react";
import { useAuthGuard } from "@/lib/use-auth-guard";

const defaultFlow: GuidedFlowState = {
  quizCompleted: false,
  recommendationsViewed: false,
  skillGapAnalyzed: false,
  roadmapStarted: false,
  advisorUsed: false,
};

export default function RecommendationsPage() {
  const ready = useAuthGuard();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [flowState, setFlowState] = useState<GuidedFlowState>(defaultFlow);

  useEffect(() => {
    if (!ready) return;

    const quiz = getQuizResult();
    setRecommendations(quiz?.recommendations ?? []);
    if (quiz?.recommendations?.length) {
      const next = setGuidedFlowState({ quizCompleted: true, recommendationsViewed: true });
      setFlowState(next);
    } else {
      setFlowState(getGuidedFlowState());
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <div className="w-full pt-8">
          <JourneyStepper state={flowState} currentHref="/recommendations" />
        </div>
      </FadeIn>

      <SlideUp className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">AI Recommendations</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
          Your Ideal Career Paths
        </h1>
        <p className="text-lg text-white/60">
          Based on your profile, we&apos;ve identified the technical roles where you&apos;ll thrive the most.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/quiz">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">Retake Quiz</Button>
          </Link>
          <Link href="/skill-analyzer">
            <Button variant="outline" size="sm" className="border-white/10 text-white/80">Analyze Skills</Button>
          </Link>
        </div>
      </SlideUp>

      {recommendations.length === 0 ? (
        <SlideUp delay={0.2} className="w-full max-w-2xl mx-auto mt-12">
           <Card className="p-12 text-center border-dashed border-white/20">
             <Target className="w-12 h-12 text-white/20 mx-auto mb-6" />
             <h3 className="text-xl font-bold text-white mb-2">No data yet</h3>
             <p className="text-white/50 mb-8">Take the career discovery quiz to generate your matches.</p>
             <Link href="/quiz">
               <Button variant="premium">Take the Quiz</Button>
             </Link>
           </Card>
        </SlideUp>
      ) : (
        <StaggerChildren staggerDelay={0.15} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto w-full">
          {recommendations.map((item, index) => (
            <StaggerItem key={item.track}>
              <Card className="h-full flex flex-col group overflow-hidden border-white/10 hover:border-indigo-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                
                <CardHeader className="space-y-6 pb-4 relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-block rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/70">
                        {item.category}
                      </div>
                      <CardTitle className="text-2xl font-black leading-tight text-white">{item.careerName}</CardTitle>
                    </div>
                    {/* Glowing percentage badge */}
                    <div className="relative flex shrink-0 items-center justify-center w-14 h-14 rounded-full bg-black/40 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-500">
                      <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                        <motion.circle 
                          cx="50" cy="50" r="46" fill="transparent" 
                          stroke={index === 0 ? "#818cf8" : "#a78bfa"} 
                          strokeWidth="4" strokeLinecap="round"
                          initial={{ strokeDasharray: "0 999" }}
                          animate={{ strokeDasharray: `${(item.matchPercentage / 100) * 289} 999` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        />
                      </svg>
                      <span className="text-sm font-black text-white">{item.matchPercentage}%</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 pt-2 text-sm flex-1 flex flex-col relative z-10">
                  <p className="text-white/60 leading-relaxed max-w-[95%]">{item.description}</p>

                  <div className="rounded-xl bg-white/[0.03] border border-white/5 p-5 flex-1">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white mb-4">
                      <Zap className="h-4 w-4 text-amber-400" />
                      Key Strengths
                    </p>
                    <ul className="space-y-3">
                      {item.strengths.map((strength) => (
                        <li key={strength} className="flex items-start gap-3 text-white/70 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0 group-hover:bg-indigo-400 transition-colors" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 mt-auto">
                    <Link href="/roadmap" className="w-full">
                      <Button size="lg" className="w-full justify-between group/btn bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        <span>View Growth Roadmap</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 text-white/50 group-hover/btn:text-white" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      <SlideUp delay={0.4} className="max-w-4xl mx-auto w-full mt-12">
        <NextStepCard
          currentStep="AI Recommendations"
          nextStep="Analyze Skill Gap"
          nextHref="/skill-analyzer"
          helperText="Use your top match to identify missing skills before starting learning."
        />
      </SlideUp>
    </div>
  );
}
