"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";

import { AnimatedLoader } from "@/components/animated-loader";
import { CareerCard } from "@/components/career-card";
import { CareerCardSkeleton } from "@/components/career-card-skeleton";
import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { PageContainer } from "@/components/page-container";
import { SectionHeader } from "@/components/section-header";
import { SkillTag } from "@/components/skill-tag";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getQuizResult } from "@/lib/career-quiz";
import { GuidedFlowState, getGuidedFlowState, setGuidedFlowState } from "@/lib/guided-flow";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { QuizRecommendation } from "@/types";

const defaultFlow: GuidedFlowState = {
  quizCompleted: false,
  recommendationsViewed: false,
  skillGapAnalyzed: false,
  roadmapStarted: false,
  advisorUsed: false,
};

function mapDashboardRecommendation(item: {
  id: string;
  careerName: string;
  growthRate: string;
  difficulty: string;
}): QuizRecommendation {
  return {
    careerId: item.id,
    careerName: item.careerName,
    description: `Strong growth outlook (${item.growthRate}) with ${item.difficulty.toLowerCase()} entry complexity.`,
    category: item.careerName.toLowerCase().includes("design")
      ? "Design"
      : item.careerName.toLowerCase().includes("product")
        ? "Business"
        : "Technology",
    matchPercentage: 70,
    strengths: ["Career growth", "Market demand", "Role alignment"],
  };
}

export default function RecommendationsPage() {
  const ready = useAuthGuard();
  const [recommendations, setRecommendations] = useState<QuizRecommendation[]>([]);
  const [flowState, setFlowState] = useState<GuidedFlowState>(defaultFlow);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    setLoading(true);
    setError(null);

    const quiz = getQuizResult();
    if (quiz?.recommendations?.length) {
      setRecommendations(quiz.recommendations);
      setFlowState(setGuidedFlowState({ quizCompleted: true, recommendationsViewed: true }));
      setLoading(false);
      return;
    }

    api
      .getDashboard()
      .then((dashboard) => {
        setRecommendations(dashboard.recommendations.map(mapDashboardRecommendation));
        setFlowState(setGuidedFlowState({ recommendationsViewed: true }));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load recommendations. Please try again.")
      )
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return <AnimatedLoader text="Loading recommendations..." fullScreen />;

  return (
    <PageContainer className="gap-12">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <div className="w-full pt-8">
          <JourneyStepper state={flowState} currentHref="/recommendations" />
        </div>
      </FadeIn>

      <SlideUp>
        <SectionHeader
          align="center"
          badge="AI Recommendations"
          icon={<Sparkles className="h-4 w-4 text-purple-400" />}
          title="Your Ideal Career Paths"
          description="Based on your quiz and profile context, these are the strongest tracks to pursue next."
        />
      </SlideUp>

      <div className="flex justify-center gap-4">
        <Link href="/quiz">
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
            Retake Quiz
          </Button>
        </Link>
        <Link href="/skill-analyzer">
          <Button variant="outline" size="sm" className="border-white/10 text-white/80">
            Analyze Skills
          </Button>
        </Link>
      </div>

      {error ? <FeedbackBanner message={error} tone="error" className="max-w-3xl mx-auto w-full" /> : null}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto w-full">
          {Array.from({ length: 3 }).map((_, idx) => (
            <CareerCardSkeleton key={`recommendation-skeleton-${idx}`} />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <SlideUp delay={0.2} className="w-full max-w-2xl mx-auto mt-12">
          <Card className="p-12 text-center border-dashed border-white/20">
            <Target className="w-12 h-12 text-white/20 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No recommendations yet</h3>
            <p className="text-white/50 mb-8">Take the career discovery quiz to generate your matches.</p>
            <Link href="/quiz">
              <Button variant="premium">Take the Quiz</Button>
            </Link>
          </Card>
        </SlideUp>
      ) : (
        <StaggerChildren staggerDelay={0.12} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto w-full">
          {recommendations.map((item) => (
            <StaggerItem key={`${item.careerId}-${item.careerName}`}>
              <CareerCard
                title={item.careerName}
                category={item.category}
                description={item.description}
                href={`/careers/${item.careerId}`}
                actionLabel="View Career Profile"
                leadingAction={
                  <div className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-black text-indigo-300">
                    {item.matchPercentage}%
                  </div>
                }
                footer={
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
                      <Zap className="h-4 w-4 text-amber-400" />
                      Key Strengths
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.strengths.map((strength) => (
                        <SkillTag key={`${item.careerId}-${strength}`} label={strength} tone="indigo" />
                      ))}
                    </div>
                    <Link href="/roadmap" className="block">
                      <Button size="sm" className="mt-2 w-full justify-between bg-white/5 text-white border border-white/10 hover:bg-white/10">
                        View Growth Roadmap
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                }
              />
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
    </PageContainer>
  );
}
