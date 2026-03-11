"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, Mail, Sparkles } from "lucide-react";

import { FeedbackBanner } from "@/components/feedback-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { isAuthenticated, setToken } from "@/lib/auth";
import { getGuidedFlowState } from "@/lib/guided-flow";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await api.login({ email, password });
      setToken(result.token);
      const flow = getGuidedFlowState();
      router.push(flow.quizCompleted ? "/dashboard" : "/quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[78vh] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/75 via-slate-950/65 to-cyan-950/30 p-5 md:p-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
        <div className="space-y-5 p-2 md:p-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome back
          </span>
          <h1 className="font-display text-4xl font-black leading-tight text-white md:text-5xl">Resume your career journey from where you left off.</h1>
          <p className="max-w-xl text-white/68 md:text-lg">Your dashboard keeps quiz progress, saved careers, roadmap milestones, and advisor history in sync.</p>

          <div className="grid gap-3 text-sm text-white/78 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">Guided next step recommendations</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">Personalized AI planning workflow</div>
          </div>
        </div>

        <Card className="rounded-3xl border-cyan-300/20 bg-slate-950/80">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl font-black text-white">Sign in</CardTitle>
            <p className="text-sm text-white/60">Use your account credentials to access your workspace.</p>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@example.com"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="........"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              {error ? <FeedbackBanner message={error} tone="error" /> : null}

              <Button type="submit" variant="premium" className="mt-2 h-12 w-full rounded-xl" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/55">
              No account yet?{" "}
              <Link href="/register" className="font-semibold text-cyan-100 hover:text-white">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
