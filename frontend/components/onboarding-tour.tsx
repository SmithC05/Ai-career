"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type TourStep = {
  targetId: string;
  title: string;
  description: string;
};

type OnboardingTourProps = {
  steps: TourStep[];
  storageKey: string;
  forceStartToken?: number;
};

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function readDone(storageKey: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(storageKey) === "done";
}

function markDone(storageKey: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(storageKey, "done");
}

function getRect(targetId: string): Rect | null {
  if (typeof window === "undefined") {
    return null;
  }

  const element = document.querySelector(`[data-tour-id="${targetId}"]`) as HTMLElement | null;
  if (!element) {
    return null;
  }

  const box = element.getBoundingClientRect();
  return {
    top: box.top,
    left: box.left,
    width: box.width,
    height: box.height,
  };
}

export function OnboardingTour({ steps, storageKey, forceStartToken }: OnboardingTourProps) {
  const [active, setActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const currentStep = steps[currentIndex] ?? null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (forceStartToken !== undefined) {
      setCurrentIndex(0);
      setActive(true);
      return;
    }

    if (!readDone(storageKey)) {
      const timer = window.setTimeout(() => {
        setCurrentIndex(0);
        setActive(true);
      }, 700);

      return () => window.clearTimeout(timer);
    }
  }, [forceStartToken, storageKey]);

  useEffect(() => {
    if (!active || !currentStep) {
      return;
    }

    const update = () => {
      const nextRect = getRect(currentStep.targetId);
      setRect(nextRect);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, currentStep]);

  const tooltipStyle = useMemo(() => {
    if (!rect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } as const;
    }

    const spaceBelow = window.innerHeight - (rect.top + rect.height);
    const showAbove = spaceBelow < 220;
    const top = showAbove ? rect.top - 170 : rect.top + rect.height + 14;
    const left = Math.min(Math.max(rect.left, 12), window.innerWidth - 380);

    return {
      top: `${Math.max(top, 12)}px`,
      left: `${left}px`,
      transform: "none",
    } as const;
  }, [rect]);

  if (!active || !currentStep) {
    return null;
  }

  const onSkip = () => {
    markDone(storageKey);
    setActive(false);
  };

  const onNext = () => {
    if (currentIndex >= steps.length - 1) {
      markDone(storageKey);
      setActive(false);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-slate-950/65 backdrop-blur-[2px]" />

      {rect ? (
        <div
          className="fixed z-[71] rounded-xl border-2 border-cyan-300/60 shadow-[0_0_0_9999px_rgba(2,6,15,0.6)] transition-all duration-300"
          style={{
            top: `${Math.max(rect.top - 6, 4)}px`,
            left: `${Math.max(rect.left - 6, 4)}px`,
            width: `${rect.width + 12}px`,
            height: `${rect.height + 12}px`,
          }}
        />
      ) : null}

      <div
        className="fixed z-[72] w-[360px] max-w-[92vw] rounded-xl border border-cyan-300/30 bg-slate-950/92 p-4 text-white shadow-2xl"
        style={tooltipStyle}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Guided Tour {currentIndex + 1}/{steps.length}
        </p>
        <p className="mt-1 font-display text-base font-black">{currentStep.title}</p>
        <p className="mt-2 text-sm text-white/70">{currentStep.description}</p>

        <div className="mt-4 flex justify-between">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
          <Button size="sm" onClick={onNext}>
            {currentIndex >= steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </>
  );
}
