import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedLoaderProps {
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function AnimatedLoader({ text = "Loading...", className, fullScreen = false }: AnimatedLoaderProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4",
      fullScreen ? "min-h-[60vh]" : "py-12",
      className
    )}>
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10">
        <div className="absolute inset-0 rounded-2xl animate-pulse bg-cyan-300/10" />
        <Loader2 className="relative z-10 h-6 w-6 animate-spin text-cyan-200" />
      </div>
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/55">
        {text}
      </p>
    </div>
  );
}
