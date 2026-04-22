"use client";

import { useState } from "react";
import { Send, ChevronRight, Flag, MessageSquare, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackBanner } from "@/components/feedback-banner";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import { api } from "@/lib/api";
import { InterviewSession, InterviewFeedback } from "@/types";

interface Props {
  session: InterviewSession;
  onEnd: (updatedSession: InterviewSession) => void;
}

type LocalFeedback = NonNullable<InterviewFeedback>;

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    : score >= 5 ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-bold ${color}`}>
      <Star className="w-3.5 h-3.5" />
      {score}/10
    </span>
  );
}

export default function MockInterviewChat({ session, onEnd }: Props) {
  const questions = session.questions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedbackMap, setFeedbackMap] = useState<Record<number, LocalFeedback>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentFeedback = feedbackMap[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const hasSubmitted = currentIndex in feedbackMap;

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Please type your answer before submitting.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fb = await api.evaluateInterviewAnswer(session.id, currentIndex, answer.trim());
      setFeedbackMap((prev) => ({ ...prev, [currentIndex]: fb }));
      setAnswers((prev) => ({ ...prev, [currentIndex]: answer.trim() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setAnswer("");
    setError(null);
    setCurrentIndex((i) => i + 1);
  };

  const handleEnd = () => {
    const mergedAnswers = questions.map((_, i) => answers[i] ?? "");
    const mergedFeedback = questions.map((_, i) => feedbackMap[i] ?? null);
    onEnd({ ...session, answers: mergedAnswers, feedback: mergedFeedback });
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-white/40">Question</span>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < currentIndex
                    ? "bg-emerald-500 w-6"
                    : i === currentIndex
                    ? "bg-cyan-400 w-8"
                    : "bg-white/15 w-4"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-white/60">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="bg-white/5 border border-white/10 text-white/55 text-xs uppercase tracking-wider"
        >
          {currentQuestion.type || "General"}
        </Badge>
      </div>

      {/* Question Card */}
      <Card className="border-cyan-500/20 bg-cyan-500/[0.03] backdrop-blur-xl shadow-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-lg" />
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-base flex items-center gap-2 text-cyan-300">
            <MessageSquare className="w-4 h-4" />
            Interview Question
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 relative z-10">
          <p className="text-white text-lg leading-relaxed font-medium">
            {currentQuestion.question}
          </p>
          {currentQuestion.expectedKeywords?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {currentQuestion.expectedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40 text-xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Area */}
      {!hasSubmitted && (
        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass">
          <CardContent className="pt-5 space-y-4">
            <label
              htmlFor={`interview-answer-${currentIndex}`}
              className="text-xs font-bold uppercase tracking-wider text-white/50"
            >
              Your Answer
            </label>
            <textarea
              id={`interview-answer-${currentIndex}`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here… Be as detailed as you would in a real interview."
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 resize-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all"
            />
            {error && <FeedbackBanner message={error} tone="error" />}
            <Button
              id={`submit-answer-btn-${currentIndex}`}
              onClick={handleSubmit}
              disabled={loading}
              variant="premium"
              className="w-full h-11 bg-gradient-to-r from-cyan-600 to-sky-500 border-cyan-500/50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Evaluating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Submit Answer
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feedback Card */}
      {currentFeedback && (
        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-emerald-500/5 pointer-events-none rounded-lg" />
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                AI Feedback
              </CardTitle>
              <ScoreBadge score={currentFeedback.score} />
            </div>
          </CardHeader>
          <CardContent className="pt-5 relative z-10 space-y-5">
            <p className="text-white/75 leading-relaxed text-sm">{currentFeedback.feedback}</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Strengths */}
              {currentFeedback.strengths?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    Strengths
                  </p>
                  <StaggerChildren staggerDelay={0.07} className="space-y-2">
                    {currentFeedback.strengths.map((s, i) => (
                      <StaggerItem key={i}>
                        <div className="flex gap-2 items-start p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <p className="text-sm text-white/70">{s}</p>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </div>
              )}

              {/* Improvements */}
              {currentFeedback.improvements?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-400">
                    Improvements
                  </p>
                  <StaggerChildren staggerDelay={0.07} className="space-y-2">
                    {currentFeedback.improvements.map((imp, i) => (
                      <StaggerItem key={i}>
                        <div className="flex gap-2 items-start p-2.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/15">
                          <span className="text-rose-400 mt-0.5">↑</span>
                          <p className="text-sm text-white/70">{imp}</p>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              {!isLast ? (
                <Button
                  id="interview-next-btn"
                  onClick={handleNext}
                  variant="secondary"
                  className="flex-1 h-11"
                >
                  <span className="flex items-center gap-2">
                    Next Question <ChevronRight className="w-4 h-4" />
                  </span>
                </Button>
              ) : null}
              <Button
                id="interview-end-btn"
                onClick={handleEnd}
                variant={isLast ? "premium" : "outline"}
                className={`h-11 ${isLast ? "flex-1 bg-gradient-to-r from-purple-600 to-indigo-500 border-purple-500/50" : "px-6"}`}
              >
                <span className="flex items-center gap-2">
                  <Flag className="w-4 h-4" /> End Session
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
