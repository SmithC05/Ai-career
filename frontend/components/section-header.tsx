import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
  icon?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  title,
  description,
  badge,
  icon,
  align = "left",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div className={cn("space-y-3", centered && "text-center", className)}>
      {badge ? (
        <Badge
          variant="outline"
          className={cn(
            "gap-2 border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80",
            centered && "mx-auto w-fit"
          )}
        >
          {icon}
          {badge}
        </Badge>
      ) : null}

      <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h2>

      {description ? (
        <p className={cn("max-w-3xl text-white/60", centered && "mx-auto")}>{description}</p>
      ) : null}
    </div>
  );
}
