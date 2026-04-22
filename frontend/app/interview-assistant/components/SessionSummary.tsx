"use client";

import { useMemo, useState } from "react";
import { RotateCcw, ChevronDown, ChevronUp, Trophy, TrendingUp, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import { InterviewSession, InterviewFeedback } from "@/types";

interface Props {
  session: InterviewSession;
  onRestart: () => void;
}

function CircularAvg({ score }: { score: number }) {
  const max = 10;
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const dash = (score / max) * circ;
  const color = score >= 7 ? "#10b981" : score >= 5 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.9s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score.toFixed(1)}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">/ 10</span>
      </div>
    </div>
  );
}

function AccordionItem({
  index,
  question,
  answer,
  feedback,
}: {
  index: number;
  question: string;
  answer: string;
  feedback: NonNullable<InterviewFeedback>;
}) {
  const [open, setOpen] = useState(false);
  const scoreColor =
    feedback.score >= 7 ? "text-emerald-400" : feedback.score >= 5 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-white/[0.04] transition-colors"
        aria-expanded={open}
        id={`summary-q-${index}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/15 text-white/60 text-xs font-black flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <p className="text-sm text-white/75 truncate">{question}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-black ${scoreColor}`}>{feedback.score}/10</span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-white/30" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/30" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/5 p-4 space-y-4">
          {/* Your answer */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1.5">Your Answer</p>
            <p className="text-sm text-white/60 leading-relaxed bg-white/[0.03] rounded-xl p-3 border border-white/5">
              {answer || <span className="italic text-white/25">No answer recorded.</span>}
            </p>
          </div>
          {/* Feedback */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1.5">AI Feedback</p>
            <p className="text-sm text-white/70 leading-relaxed">{feedback.feedback}</p>
          </div>
          {/* Strengths / Improvements */}
          <div className="grid sm:grid-cols-2 gap-3">
            {feedback.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Strengths</p>
                <ul className="space-y-1.5">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-white/60 flex gap-2">
                      <span className="text-emerald-400">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.improvements?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2">Improvements</p>
                <ul className="space-y-1.5">
                  {feedback.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-white/60 flex gap-2">
                      <span className="text-rose-400">↑</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionSummary({ session, onRestart }: Props) {
  const validFeedback = (session.feedback ?? []).filter(
    (f): f is NonNullable<InterviewFeedback> => f !== null && f !== undefined
  );

  const avgScore = useMemo(() => {
    if (validFeedback.length === 0) return 0;
    return validFeedback.reduce((sum, f) => sum + (f?.score ?? 0), 0) / validFeedback.length;
  }, [validFeedback]);

  const allStrengths = useMemo(
    () => [...new Set(validFeedback.flatMap((f) => f?.strengths ?? []))].slice(0, 5),
    [validFeedback]
  );
  const allImprovements = useMemo(
    () => [...new Set(validFeedback.flatMap((f) => f?.improvements ?? []))].slice(0, 5),
    [validFeedback]
  );

  const label =
    avgScore >= 8 ? "Outstanding Performance 🏆" : avgScore >= 6 ? "Good Job! 🎯" : avgScore >= 4 ? "Keep Practising ⚡" : "Needs More Work 📈";

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
      {/* Overall Score */}
      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-cyan-500/5 pointer-events-none rounded-lg" />
        <CardContent className="pt-8 pb-8 relative z-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Session Complete</p>
            <p className="text-2xl font-black text-white">{label}</p>
          </div>
          <CircularAvg score={avgScore} />
          <p className="text-sm text-white/50">
            Averaged across {validFeedback.length} evaluated question{validFeedback.length !== 1 ? "s" : ""}
            {" · "}
            <span className="text-white/70 font-semibold">{session.targetRole}</span>
            {" · "}
            <span className="capitalize">{session.difficulty}</span>
          </p>
        </CardContent>
      </Card>

      {/* Top Strengths & Improvements */}
      {(allStrengths.length > 0 || allImprovements.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-6">
          {allStrengths.length > 0 && (
            <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-300">
                  <Star className="w-4 h-4" /> Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <StaggerChildren staggerDelay={0.08} className="space-y-2">
                  {allStrengths.map((s, i) => (
                    <StaggerItem key={i}>
                      <div className="flex gap-2.5 p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        <p className="text-sm text-white/70">{s}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </CardContent>
            </Card>
          )}

          {allImprovements.length > 0 && (
            <Card className="border-rose-500/20 bg-rose-500/[0.02]">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-base flex items-center gap-2 text-rose-300">
                  <TrendingUp className="w-4 h-4" /> Key Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <StaggerChildren staggerDelay={0.08} className="space-y-2">
                  {allImprovements.map((imp, i) => (
                    <StaggerItem key={i}>
                      <div className="flex gap-2.5 p-2.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/15">
                        <span className="text-rose-400 shrink-0">↑</span>
                        <p className="text-sm text-white/70">{imp}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Per-question Accordion */}
      {session.questions?.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
            Question Breakdown
          </p>
          {session.questions.map((q, i) => {
            const fb = (session.feedback ?? [])[i];
            if (!fb) return null;
            return (
              <AccordionItem
                key={i}
                index={i}
                question={q.question}
                answer={(session.answers ?? [])[i] ?? ""}
                feedback={fb as NonNullable<InterviewFeedback>}
              />
            );
          })}
        </div>
      )}

      <Button
        id="interview-restart-btn"
        onClick={onRestart}
        variant="premium"
        className="w-full h-14 text-base bg-gradient-to-r from-cyan-600 to-sky-500 border-cyan-500/50 shadow-[0_0_24px_rgba(6,182,212,0.25)]"
      >
        <span className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5" /> Start New Session
        </span>
      </Button>
    </div>
  );
}
