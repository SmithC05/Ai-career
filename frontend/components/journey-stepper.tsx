import Link from "next/link";
import { Check } from "lucide-react";

import { guidedSteps, GuidedFlowState } from "@/lib/guided-flow";
import { cn } from "@/lib/utils";

type JourneyStepperProps = {
  state: GuidedFlowState;
  currentHref?: string;
};

export function JourneyStepper({ state, currentHref }: JourneyStepperProps) {
  const completedIndex = guidedSteps.reduce((lastDone, step, index) => (state[step.key] ? index : lastDone), -1);
  const activeIndex = guidedSteps.findIndex((step) => currentHref === step.href || currentHref?.startsWith(`${step.href}/`));
  const progressIndex = Math.max(completedIndex, activeIndex);
  const progressWidth = guidedSteps.length <= 1 ? 0 : Math.max(0, (progressIndex / (guidedSteps.length - 1)) * 100);

  return (
    <div className="w-full">
      <div className="glass-panel relative mx-auto flex max-w-4xl items-start justify-between rounded-2xl px-3 py-4 sm:px-5">
        <div className="pointer-events-none absolute left-8 right-8 top-[1.65rem] h-px bg-white/15" />
        <div
          className="pointer-events-none absolute left-8 right-8 top-[1.65rem] h-px origin-left bg-gradient-to-r from-sky-300/80 via-cyan-300/75 to-emerald-300/80 transition-transform duration-500"
          style={{ transform: `scaleX(${Math.max(0, Math.min(1, progressWidth / 100))})` }}
        />

        {guidedSteps.map((step, index) => {
          const done = state[step.key];
          const active = currentHref === step.href;

          return (
            <Link
              key={step.key}
              href={step.href}
              className="relative z-10 flex min-w-[58px] flex-1 flex-col items-center text-center group"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 sm:h-10 sm:w-10 sm:text-sm",
                  done
                    ? "border-cyan-200/80 bg-gradient-to-br from-sky-300 to-emerald-300 text-slate-900 shadow-[0_0_0_6px_rgba(56,189,248,0.15)]"
                    : active
                      ? "border-cyan-300/60 bg-slate-950/80 text-cyan-200 shadow-[0_0_0_6px_rgba(56,189,248,0.1)]"
                      : "border-white/25 bg-slate-950/65 text-white/50 group-hover:border-white/45 group-hover:text-white/80"
                )}
              >
                {done ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="mt-2 max-w-[88px]">
                <p
                  className={cn(
                    "text-[10px] leading-tight tracking-wide sm:text-xs",
                    active ? "text-cyan-200" : done ? "text-white/80" : "text-white/45 group-hover:text-white/70"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
