"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, TrendingUp, DollarSign, Activity, Shield, Scale, Briefcase, Zap, CheckCircle2 } from "lucide-react";

import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { api } from "@/lib/api";
import { GuidedFlowState, getGuidedFlowState } from "@/lib/guided-flow";
import { setJourneyState } from "@/lib/journey";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { CareerDetail } from "@/types";

type PageProps = {
  params: {
    id: string;
  };
};

function MetricCard({ title, value, icon: Icon, tone = "text-white" }: { title: string, value: React.ReactNode, icon: any, tone?: string }) {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex items-start gap-4 group">
      <div className="p-3 rounded-xl bg-white/5 text-white/50 group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{title}</p>
        <div className={`font-semibold text-base ${tone}`}>{value}</div>
      </div>
    </div>
  );
}

export default function CareerDetailPage({ params }: PageProps) {
  const ready = useAuthGuard();
  const [career, setCareer] = useState<CareerDetail | null>(null);
  const [flowState, setFlowState] = useState<GuidedFlowState>({
    quizCompleted: false,
    recommendationsViewed: false,
    skillGapAnalyzed: false,
    roadmapStarted: false,
    advisorUsed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;

    api.getCareerById(params.id)
      .then(setCareer)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load career"));

    setFlowState(getGuidedFlowState());
  }, [ready, params.id]);

  const onSaveCareer = async () => {
    if (!career) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await api.saveCareer(career.id);
      setJourneyState({ savedCareer: true });
      setMessage("Career saved successfully. Continue your journey to build a roadmap.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save career");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;

  if (error && !career) {
    return <FeedbackBanner message={error} tone="error" className="mt-8 mx-4" />;
  }

  if (!career) {
    return <AnimatedLoader text="Loading career profile..." fullScreen />;
  }

  const salaryMin = Math.round(career.avgSalary * 0.8);
  const salaryMax = Math.round(career.avgSalary * 1.2);
  const growthOutlook = career.growthRate.toLowerCase().includes("high")
    ? "Strong Future Outlook"
    : career.growthRate.toLowerCase().includes("moderate")
      ? "Stable Future Outlook"
      : "Evolving Market Status";

  return (
    <div className="flex flex-col gap-10 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <Link href="/careers" className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors w-fit mb-4">
           <ArrowLeft className="w-4 h-4" /> Back to Exploratory View
        </Link>
        <PageHeader
          badge="Role Deep Dive"
          title={career.careerName}
          description={career.description}
          actions={[
            { href: "/compare", label: "Compare Roles" },
            { href: "/roadmap", label: "Generate Roadmap" },
          ]}
        />
      </FadeIn>

      <SlideUp delay={0.1}>
         <JourneyStepper state={flowState} currentHref={`/careers/${career.id}`} />
      </SlideUp>

      {error && <FeedbackBanner message={error} tone="error" />}
      {message && <FeedbackBanner message={message} tone="success" />}

      <SlideUp delay={0.2}>
        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-3"><Briefcase className="w-6 h-6 text-blue-400" /> Career Snapshot</CardTitle>
            <Button 
               onClick={onSaveCareer} 
               disabled={saving}
               className="bg-white/10 hover:bg-white/20 text-white font-bold h-11 px-6 rounded-full border border-white/10 transition-colors"
            >
              {saving ? "Saving Profile..." : <span className="flex items-center gap-2"><Bookmark className="w-4 h-4" /> Save Career Data</span>}
            </Button>
          </CardHeader>
          
          <CardContent className="p-8 pt-6">
            <StaggerChildren staggerDelay={0.05} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
              <StaggerItem><MetricCard title="Average Salary" value={`$${career.avgSalary.toLocaleString()}`} icon={DollarSign} tone="text-emerald-400" /></StaggerItem>
              <StaggerItem><MetricCard title="Salary Range" value={`$${(salaryMin/1000).toFixed(0)}k - $${(salaryMax/1000).toFixed(0)}k`} icon={Activity} /></StaggerItem>
              <StaggerItem><MetricCard title="Growth Rate" value={career.growthRate} icon={TrendingUp} tone={career.growthRate.toLowerCase().includes('high') ? 'text-emerald-400' : 'text-white'} /></StaggerItem>
              <StaggerItem><MetricCard title="Market Outlook" value={growthOutlook} icon={Zap} /></StaggerItem>
              <StaggerItem><MetricCard title="Role Difficulty" value={career.difficulty} icon={Briefcase} tone={career.difficulty === 'High' ? 'text-amber-400' : 'text-white'} /></StaggerItem>
              <StaggerItem><MetricCard title="Job Security" value={career.jobSecurity} icon={Shield} /></StaggerItem>
              <StaggerItem><MetricCard title="Job Demand" value={career.jobDemand} icon={TrendingUp} /></StaggerItem>
              <StaggerItem><MetricCard title="Work-Life Balance" value={career.workLifeBalance} icon={Scale} /></StaggerItem>
            </StaggerChildren>

            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Core Competencies & Required Skills
              </p>
              <div className="flex flex-wrap gap-2.5">
                {career.requiredSkills.map((skill, i) => (
                  <SlideUp key={skill} delay={0.2 + (i * 0.05)}>
                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-200 border-indigo-500/20 px-4 py-1.5 text-sm font-medium hover:bg-indigo-500/20 transition-colors cursor-default">
                      {skill}
                    </Badge>
                  </SlideUp>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>
      </SlideUp>

      <SlideUp delay={0.4}>
        <NextStepCard
          currentStep="Career Detail"
          nextStep="Analyze Skill Gap"
          nextHref="/skill-analyzer"
          helperText="Now validate your current skills and identify exactly what you need to learn next to bridge the gap."
        />
      </SlideUp>
    </div>
  );
}
