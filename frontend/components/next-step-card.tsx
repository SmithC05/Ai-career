import Link from "next/link";

import { Button } from "@/components/ui/button";

type NextStepCardProps = {
  currentStep: string;
  nextStep: string;
  nextHref: string;
  helperText?: string;
};

export function NextStepCard({
  currentStep,
  nextStep,
  nextHref,
  helperText = "Follow the guided journey to maximize your career clarity.",
}: NextStepCardProps) {
  return (
    <div className="spotlight-ring relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-slate-950/75 via-slate-900/80 to-slate-950/70 p-5 shadow-[0_22px_48px_-34px_rgba(0,10,28,0.95)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.24),transparent_52%)]" />
      <div className="relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-100/85">Next Recommended Step</p>
        <p className="mt-1 text-xs text-white/55">Current: {currentStep}</p>
        <p className="mt-1 font-display text-xl font-black text-white">{nextStep}</p>
        <p className="mt-2 text-sm text-white/65">{helperText}</p>
      </div>
      <Link href={nextHref} className="relative z-10 mt-4 inline-flex">
        <Button size="sm" variant="premium" className="rounded-full px-5">
          Continue
        </Button>
      </Link>
    </div>
  );
}
