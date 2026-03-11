import { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-white/20 bg-slate-950/45">
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-12 pt-12 text-center">
        <h3 className="font-display text-2xl font-black text-white">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        <div className="pt-4">
          {action ?? null}
        </div>
      </CardContent>
    </Card>
  );
}
