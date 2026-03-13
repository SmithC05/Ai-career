import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SkillTagProps = {
  label: string;
  tone?: "default" | "indigo" | "emerald" | "rose" | "amber";
  className?: string;
};

const toneClass: Record<NonNullable<SkillTagProps["tone"]>, string> = {
  default: "bg-white/5 text-white/80 border-white/10",
  indigo: "bg-indigo-500/10 text-indigo-200 border-indigo-500/20",
  emerald: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
  rose: "bg-rose-500/10 text-rose-200 border-rose-500/20",
  amber: "bg-amber-500/10 text-amber-200 border-amber-500/20",
};

export function SkillTag({ label, tone = "default", className }: SkillTagProps) {
  return (
    <Badge variant="secondary" className={cn("px-3 py-1 text-xs font-medium", toneClass[tone], className)}>
      {label}
    </Badge>
  );
}
