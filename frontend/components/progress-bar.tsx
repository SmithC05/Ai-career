import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  label?: string;
  valueLabel?: string;
  className?: string;
  barClassName?: string;
};

export function ProgressBar({ value, label, valueLabel, className, barClassName }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white/70">{label}</p>
          <p className="text-xs font-bold text-white/60">{valueLabel ?? `${normalized}%`}</p>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all", barClassName)}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
