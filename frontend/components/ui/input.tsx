import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-2 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300",
          "placeholder:text-muted-foreground placeholder:transition-opacity focus:placeholder:opacity-50",
          "hover:border-white/25 hover:bg-slate-900/55",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35 focus-visible:border-cyan-300/45 focus-visible:bg-slate-900/70 focus-visible:shadow-[0_0_0_3px_rgba(56,189,248,0.08)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
