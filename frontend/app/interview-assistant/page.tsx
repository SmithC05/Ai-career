"use client";

import { useState } from "react";
import { BrainCircuit, ListChecks } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { SectionHeader } from "@/components/section-header";
import { FadeIn, SlideUp } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { InterviewSession } from "@/types";
import QuestionSetup from "./components/QuestionSetup";
import MockInterviewChat from "./components/MockInterviewChat";
import SessionSummary from "./components/SessionSummary";
import { cn } from "@/lib/utils";

type Stage = "setup" | "interview" | "summary";

export default function InterviewAssistantPage() {
  const ready = useAuthGuard();
  const [stage, setStage] = useState<Stage>("setup");
  const [session, setSession] = useState<InterviewSession | null>(null);

  if (!ready) return <AnimatedLoader text="Loading Interview Assistant..." fullScreen />;

  const handleStart = (s: InterviewSession) => {
    setSession(s);
    setStage("interview");
  };

  const handleEnd = (updated: InterviewSession) => {
    setSession(updated);
    setStage("summary");
  };

  const handleRestart = () => {
    setSession(null);
    setStage("setup");
  };

  return (
    <PageContainer className="gap-10">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/15 via-background to-background pointer-events-none" />

      <FadeIn>
        <SectionHeader
          align="center"
          badge="AI-Powered"
          icon={<BrainCircuit className="h-4 w-4 text-cyan-400" />}
          title="Interview Assistant"
          description="Practice with role-specific questions, get instant AI feedback, and review your performance with a detailed session summary."
        />

        {/* Stage indicator (breadcrumb) */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {(["setup", "interview", "summary"] as Stage[]).map((s, i) => {
            const labels: Record<Stage, string> = {
              setup: "Setup",
              interview: "Interview",
              summary: "Summary",
            };
            const isActive = stage === s;
            const isDone =
              (s === "setup" && stage !== "setup") ||
              (s === "interview" && stage === "summary");
            return (
              <>
                <div
                  key={s}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    isActive
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                      : isDone
                      ? "text-emerald-400"
                      : "text-white/30"
                  )}
                >
                  {isDone ? "✓ " : ""}{labels[s]}
                </div>
                {i < 2 && (
                  <span className="text-white/15 text-xs">→</span>
                )}
              </>
            );
          })}
        </div>
      </FadeIn>

      <SlideUp delay={0.1}>
        {stage === "setup" && <QuestionSetup onStart={handleStart} />}
        {stage === "interview" && session && (
          <MockInterviewChat session={session} onEnd={handleEnd} />
        )}
        {stage === "summary" && session && (
          <SessionSummary session={session} onRestart={handleRestart} />
        )}
      </SlideUp>
    </PageContainer>
  );
}
