"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";

import { FeedbackBanner } from "@/components/feedback-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { isAuthenticated, setToken } from "@/lib/auth";
import { setGuidedFlowState } from "@/lib/guided-flow";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await api.register({ fullName, email, password });
      setToken(result.token);
      setGuidedFlowState({
        quizCompleted: false,
        recommendationsViewed: false,
        skillGapAnalyzed: false,
        roadmapStarted: false,
        advisorUsed: false,
      });
      router.push("/quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[78vh] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/75 via-slate-950/65 to-emerald-950/25 p-5 md:p-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_500px] lg:items-center">
        <div className="space-y-5 p-2 md:p-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            Start your path
          </span>
          <h1 className="font-display text-4xl font-black leading-tight text-white md:text-5xl">Create your account and get a structured career plan in minutes.</h1>
          <p className="max-w-xl text-white/68 md:text-lg">
            Register once, complete the quiz, and unlock recommendations, skill-gap analysis, roadmap generation, and AI advisor support.
          </p>

          <div className="grid gap-3 text-sm text-white/78 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">Clear next actions after every step</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">Designed for student career transitions</div>
          </div>
        </div>

        <Card className="rounded-3xl border-emerald-300/20 bg-slate-950/80">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl font-black text-white">Create account</CardTitle>
            <p className="text-sm text-white/60">Set up your profile to begin personalized guidance.</p>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">Full name</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="Alex Doe" className="h-12 pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" className="h-12 pl-10" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">Password</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Min 8 chars" className="h-12 pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">Confirm</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      placeholder="Repeat password"
                      className="h-12 pl-10"
                    />
                  </div>
                </div>
              </div>

              {error ? <FeedbackBanner message={error} tone="error" /> : null}

              <Button type="submit" variant="premium" className="mt-2 h-12 w-full rounded-xl" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/55">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-cyan-100 hover:text-white">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
