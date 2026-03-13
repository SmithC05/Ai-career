import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RoadmapStageProps = {
  phase: number;
  title: string;
  details: string;
  resources: string[];
  completed: boolean;
  onToggleComplete: () => void;
};

export function RoadmapStage({
  phase,
  title,
  details,
  resources,
  completed,
  onToggleComplete,
}: RoadmapStageProps) {
  return (
    <div className="relative pl-16 group">
      <div
        className={cn(
          "absolute left-4 top-5 w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-500 shadow-xl",
          completed ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/20 group-hover:border-emerald-500/50"
        )}
      >
        {completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-emerald-500/50" />}
      </div>

      <Card
        className={cn(
          "overflow-hidden transition-all duration-500",
          completed
            ? "border-emerald-500/30 bg-emerald-500/[0.03] shadow-[0_0_30px_rgba(16,185,129,0.05)]"
            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        )}
      >
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Phase {phase}</span>
              <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/60 max-w-2xl">{details}</p>

            <div className="pt-4 border-t border-white/5">
              <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/40">Key Milestones</h4>
              <div className="grid gap-2">
                {resources.map((resource) => (
                  <div key={`${phase}-${resource}`} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/60" />
                    <span className="text-sm text-white/80">{resource}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center pt-2 md:pt-0">
            <Button
              variant={completed ? "secondary" : "outline"}
              onClick={onToggleComplete}
              className={cn(
                "h-10 rounded-xl px-6 font-semibold transition-all w-full md:w-auto",
                completed
                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-none"
                  : "bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-white border-white/10"
              )}
            >
              {completed ? "Completed" : "Mark as Done"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
