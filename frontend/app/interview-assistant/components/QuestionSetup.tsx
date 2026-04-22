"use client";

import { useState } from "react";
import { Briefcase, ChevronDown, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/feedback-banner";
import { api } from "@/lib/api";
import { InterviewSession } from "@/types";

const QUICK_ROLES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "UX Designer",
  "DevOps Engineer",
  "Marketing Manager",
  "Business Analyst",
  "ML Engineer",
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { value: "medium", label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  { value: "hard", label: "Hard", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
];

interface Props {
  onStart: (session: InterviewSession) => void;
}

export default function QuestionSetup({ onStart }: Props) {
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!role.trim()) {
      setError("Please enter or select a target role.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const session = await api.startInterviewSession(role.trim(), difficulty);
      onStart(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-8">
      {/* Role Input */}
      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-lg" />
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-xl flex items-center gap-2 text-white">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            Target Role
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5 relative z-10">
          <div className="space-y-2">
            <label
              htmlFor="interview-role-input"
              className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1"
            >
              Role / Position
            </label>
            <input
              id="interview-role-input"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all"
            />
          </div>

          {/* Quick-select chips */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 ml-1">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    role === r
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/5 border-white/10 text-white/55 hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty */}
      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none rounded-lg" />
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-xl flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-purple-400" />
            Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                id={`difficulty-${d.value}`}
                onClick={() => setDifficulty(d.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-semibold text-sm ${
                  difficulty === d.value
                    ? `${d.bg} ${d.color} shadow-lg scale-[1.03]`
                    : "border-white/10 bg-white/[0.02] text-white/45 hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-xl">
                  {d.value === "easy" ? "🟢" : d.value === "medium" ? "🟡" : "🔴"}
                </span>
                {d.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && <FeedbackBanner message={error} tone="error" />}

      <Button
        id="interview-start-btn"
        onClick={handleStart}
        disabled={loading}
        variant="premium"
        className="w-full h-14 text-base bg-gradient-to-r from-cyan-600 to-sky-500 border-cyan-500/50 shadow-[0_0_24px_rgba(6,182,212,0.3)]"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Generating Questions...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Start Mock Interview
          </span>
        )}
      </Button>
    </div>
  );
}
