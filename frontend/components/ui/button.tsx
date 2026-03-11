import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center whitespace-nowrap rounded-xl border text-sm font-semibold tracking-[0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-sky-300/40 bg-sky-300/90 text-slate-950 shadow-[0_12px_28px_-14px_rgba(125,211,252,0.9)] hover:border-sky-200 hover:bg-sky-200",
        secondary: "border-white/20 bg-white/[0.08] text-foreground backdrop-blur-xl hover:border-sky-300/40 hover:bg-white/[0.16]",
        outline: "border-white/25 bg-transparent text-foreground hover:border-sky-300/45 hover:bg-sky-300/10",
        ghost: "border-transparent bg-transparent text-foreground hover:border-white/20 hover:bg-white/[0.08]",
        premium: "border-cyan-200/40 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 text-slate-950 shadow-[0_18px_34px_-16px_rgba(45,212,191,0.95)] hover:from-sky-400 hover:via-cyan-300 hover:to-emerald-300",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-[3.25rem] rounded-2xl px-8 text-base",
        icon: "h-11 w-11 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, disabled, ...props }, ref) => {
    return (
      <motion.button
        whileHover={disabled ? undefined : { y: -1.5, scale: 1.01 }}
        whileTap={disabled ? undefined : { y: 0, scale: 0.985 }}
        transition={{ type: "spring", stiffness: 420, damping: 24, mass: 0.7 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
