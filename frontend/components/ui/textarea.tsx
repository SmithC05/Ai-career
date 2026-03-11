import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-24 w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300",
          "hover:border-white/25 hover:bg-slate-900/55",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35 focus-visible:border-cyan-300/45 focus-visible:bg-slate-900/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
