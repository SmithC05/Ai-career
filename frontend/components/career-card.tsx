import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CareerCardProps = {
  title: string;
  category?: string;
  salary?: number;
  growthRate?: string;
  difficulty?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  leadingAction?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function CareerCard({
  title,
  category,
  salary,
  growthRate,
  difficulty,
  description,
  href,
  actionLabel = "View Career",
  leadingAction,
  footer,
  className,
}: CareerCardProps) {
  return (
    <Card
      className={cn(
        "h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass flex flex-col transition-all duration-300 hover:bg-white/[0.04]",
        className
      )}
    >
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="line-clamp-2 text-xl font-bold text-white">{title}</CardTitle>
            {category ? (
              <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs uppercase">
                {category}
              </Badge>
            ) : null}
          </div>
          {leadingAction}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2 flex flex-col flex-1">
        {description ? <p className="text-sm leading-relaxed text-white/70 mb-4">{description}</p> : null}

        {(salary || growthRate || difficulty) && (
          <div className="mb-6 grid grid-cols-1 gap-2 border-y border-white/5 py-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Avg Salary</p>
              <p className="font-semibold text-white">{salary ? `$${salary.toLocaleString()}` : "-"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Growth</p>
              <p className="font-semibold text-emerald-400">{growthRate ?? "-"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Difficulty</p>
              <p className="font-semibold text-white/90">{difficulty ?? "-"}</p>
            </div>
          </div>
        )}

        {footer ? <div className="mb-4">{footer}</div> : null}

        {href ? (
          <div className="mt-auto">
            <Link href={href} className="block">
              <Button className="w-full bg-white text-black hover:bg-white/90 font-bold h-11">
                {actionLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
