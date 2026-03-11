"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChartNoAxesColumn,
  CheckCircle2,
  Compass,
  Layers3,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  WandSparkles,
} from "lucide-react";

import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const journeySteps = [
  {
    id: "01",
    title: "Discover Your Direction",
    description: "Take a fast, guided quiz that maps your strengths, motivation style, and technical interests.",
    icon: Compass,
  },
  {
    id: "02",
    title: "See Your Skill Gap",
    description: "Get an AI skill-gap snapshot against high-growth roles so you know exactly what is missing.",
    icon: Target,
  },
  {
    id: "03",
    title: "Execute a Personal Plan",
    description: "Generate a role-ready roadmap with milestones, weekly focus, and an advisor to stay accountable.",
    icon: Route,
  },
];

const featureCards = [
  {
    title: "Live Career Radar",
    copy: "Track role trends, demand signals, and career-fit clarity in one place.",
    icon: ChartNoAxesColumn,
  },
  {
    title: "AI Mentor Chat",
    copy: "Ask role-specific questions and get practical action steps, not generic advice.",
    icon: Bot,
  },
  {
    title: "Roadmap Engine",
    copy: "Convert confusion into a timeline with clear phases and completion tracking.",
    icon: WandSparkles,
  },
  {
    title: "Portfolio Accelerator",
    copy: "Generate role-aligned resume bullets and project concepts that stand out.",
    icon: Layers3,
  },
];

const trustSignals = [
  "No guesswork between quiz, analysis, roadmap, and advisor",
  "Single workflow from exploration to execution",
  "Built for students transitioning into in-demand careers",
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-24 pb-24 md:gap-28">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/75 via-slate-950/60 to-cyan-950/35 px-6 pb-10 pt-14 md:px-12 md:pb-14 md:pt-20">
        <div className="pointer-events-none absolute -left-20 top-14 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-300/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Career clarity in one guided flow
              </div>
            </FadeIn>

            <SlideUp delay={0.1}>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                A premium AI workspace to
                <span className="text-gradient-accent"> discover, plan, and launch </span>
                your career path.
              </h1>
            </SlideUp>

            <SlideUp delay={0.2}>
              <p className="mt-5 max-w-2xl text-base text-white/70 md:text-lg">
                Understand what role fits you, what to learn next, and which step to take today. No scattered tools. No random advice.
              </p>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="premium" size="lg" className="w-full rounded-full px-8">
                    Start Free Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/quiz" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full rounded-full px-8">
                    Take Career Quiz
                  </Button>
                </Link>
              </div>
            </SlideUp>
          </div>

          <SlideUp delay={0.35}>
            <Card className="rounded-3xl border-cyan-300/20 bg-slate-950/70">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <BrainCircuit className="h-5 w-5 text-cyan-200" />
                  Journey Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                {journeySteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-200/45 bg-cyan-300/12 text-xs font-bold text-cyan-100">
                          {step.id}
                        </span>
                        <p className="font-display text-base font-bold text-white">{step.title}</p>
                      </div>
                      <p className="text-sm text-white/65">{step.description}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </section>

      <section id="how-it-works" className="space-y-8">
        <SlideUp>
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">How It Works</p>
            <h2 className="font-display text-3xl font-black text-white md:text-5xl">From confusion to confidence in three guided moves.</h2>
            <p className="text-white/65 md:text-lg">Every step unlocks the next one so users always understand what to do now and why it matters.</p>
          </div>
        </SlideUp>

        <StaggerChildren staggerDelay={0.1} className="grid gap-5 md:grid-cols-3">
          {journeySteps.map((step) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.id}>
                <Card className="h-full rounded-3xl">
                  <CardHeader className="pb-3">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/80">Step {step.id}</span>
                    <CardTitle className="mt-2 flex items-center gap-2 text-white">
                      <Icon className="h-5 w-5 text-cyan-200" />
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/70">{step.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </section>

      <section id="features" className="space-y-8">
        <SlideUp>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Product Experience</p>
              <h2 className="font-display text-3xl font-black text-white md:text-5xl">Modern SaaS clarity with creative interaction energy.</h2>
            </div>
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-5">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </SlideUp>

        <StaggerChildren staggerDelay={0.08} className="grid gap-5 md:grid-cols-2">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title}>
                <Card className="h-full rounded-3xl">
                  <CardContent className="p-6 md:p-7">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/35 bg-cyan-300/10 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-2xl font-black text-white">{feature.title}</h3>
                    <p className="mt-3 text-white/68">{feature.copy}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </section>

      <section className="section-shell p-6 md:p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Why Students Choose This</p>
            <h2 className="mt-3 font-display text-3xl font-black text-white md:text-4xl">A complete action path, not disconnected tools.</h2>
            <p className="mt-4 text-white/68">
              AI Career Navigator is designed to answer four critical questions quickly: what should I pursue, how do I start, what is missing,
              and what step should I take next.
            </p>
          </div>

          <div className="space-y-3">
            {trustSignals.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p className="text-sm text-white/78">{item}</p>
              </div>
            ))}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/45">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              <span>Structured progression</span>
              <TimerReset className="ml-3 h-4 w-4 text-cyan-200" />
              <span>Fast setup</span>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="rounded-[2rem] border border-cyan-200/20 bg-gradient-to-r from-sky-900/35 via-cyan-900/25 to-emerald-900/30 px-6 py-14 text-center md:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">Ready To Start</p>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-black text-white md:text-5xl">Move from career uncertainty to a clear, guided execution plan.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/70 md:text-lg">Create your account, run the quiz, and begin your personalized roadmap in minutes.</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="premium" className="w-full rounded-full px-9">
              Create Free Account
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full rounded-full px-9">
              Login
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
