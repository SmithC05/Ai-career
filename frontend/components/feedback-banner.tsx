import { cn } from "@/lib/utils";

type FeedbackBannerProps = {
  message: string;
  tone?: "error" | "success" | "info";
  className?: string;
};

const toneStyles: Record<NonNullable<FeedbackBannerProps["tone"]>, string> = {
  error: "border-rose-300/40 bg-rose-500/15 text-rose-100",
  success: "border-emerald-300/40 bg-emerald-500/15 text-emerald-100",
  info: "border-cyan-300/40 bg-cyan-500/15 text-cyan-100",
};

export function FeedbackBanner({ message, tone = "info", className }: FeedbackBannerProps) {
  return (
    <p
      role="status"
      className={cn("rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-md shadow-glass", toneStyles[tone], className)}
    >
      {message}
    </p>
  );
}
