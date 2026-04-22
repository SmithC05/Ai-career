"use client";

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { SectionHeader } from "@/components/section-header";
import { FadeIn, SlideUp } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { ResumeAnalysis } from "@/types";
import ResumeUpload from "./components/ResumeUpload";
import AnalysisResult from "./components/AnalysisResult";

export default function ResumeAnalyserPage() {
  const ready = useAuthGuard();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ready) return <AnimatedLoader text="Loading Resume Analyser..." fullScreen />;

  return (
    <PageContainer className="gap-10">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/15 via-background to-background pointer-events-none" />

      <FadeIn>
        <SectionHeader
          align="center"
          badge="AI-Powered"
          icon={<FileText className="h-4 w-4 text-violet-400" />}
          title="Resume Analyser"
          description="Upload your PDF resume, add a job description, and get instant skill matching, a compatibility score, and improvement suggestions."
        />
      </FadeIn>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 max-w-6xl mx-auto w-full items-start">
        {/* Left — Upload Panel */}
        <SlideUp delay={0.1}>
          <ResumeUpload
            onLoading={setLoading}
            onResult={setAnalysis}
          />
        </SlideUp>

        {/* Right — Results Panel */}
        <SlideUp delay={0.2}>
          <AnalysisResult analysis={analysis} loading={loading} />
        </SlideUp>
      </div>
    </PageContainer>
  );
}
