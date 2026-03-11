import Link from "next/link";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type QuickAction = {
  href: string;
  label: string;
};

type PageHeaderProps = {
  title: string;
  description: string;
  badge?: string;
  actions?: QuickAction[];
  rightContent?: ReactNode;
};

export function PageHeader({ title, description, badge, actions, rightContent }: PageHeaderProps) {
  return (
    <section className="section-shell p-7 md:p-10">
      <div className="pointer-events-none absolute -top-10 right-0 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-7">
        <div className="max-w-3xl space-y-4">
          {badge ? (
            <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100">
              {badge}
            </span>
          ) : null}
          <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">{title}</h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg leading-relaxed">{description}</p>
        </div>

        {rightContent ?? null}
      </div>

      {actions && actions.length > 0 ? (
        <div className="relative z-10 mt-7 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button size="sm" variant="secondary" className="rounded-full px-5">
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
