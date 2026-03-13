"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { JourneyStepper } from "@/components/journey-stepper";
import { FeedbackBanner } from "@/components/feedback-banner";
import { NextStepCard } from "@/components/next-step-card";
import { AnimatedLoader } from "@/components/animated-loader";
import { Button } from "@/components/ui/button";
import { quizQuestions, saveQuizResult } from "@/lib/career-quiz";
import { api } from "@/lib/api";
import { GuidedFlowState, getGuidedFlowState, setGuidedFlowState } from "@/lib/guided-flow";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CareerQuizPage() {
  const ready = useAuthGuard();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [flowState, setFlowState] = useState<GuidedFlowState>({
    quizCompleted: false,
    recommendationsViewed: false,
    skillGapAnalyzed: false,
    roadmapStarted: false,
    advisorUsed: false,
  });

  const question = quizQuestions[index];
  const selectedOption = answers[question?.id];
  const progress = Math.round(((index + 1) / quizQuestions.length) * 100);

  useEffect(() => {
    if (!ready) return;
    setFlowState(getGuidedFlowState());
  }, [ready]);

  const isLast = index === quizQuestions.length - 1;
  const canContinue = useMemo(() => Boolean(selectedOption), [selectedOption]);

  if (!ready) return <AnimatedLoader text="Loading quiz..." fullScreen />;

  const onSubmit = async () => {
    if (!isLast) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await api.submitQuiz(answers);
      saveQuizResult(result);
      setFlowState(setGuidedFlowState({ quizCompleted: true }));
      router.push("/recommendations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process quiz results. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col pb-12">
      {/* Immersive background graphic */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />
      
      <div className="w-full max-w-4xl mx-auto pt-8 px-4 flex-none">
        <JourneyStepper state={flowState} currentHref="/quiz" />
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 pt-10 pb-14 md:pt-14">
        
        {/* Progress indicator */}
        <div className="w-full max-w-lg mx-auto mb-12">
           <div className="flex justify-between items-end mb-3">
             <span className="text-sm font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-2">
               <Sparkles className="w-4 h-4" /> Discovery Quiz
             </span>
             <span className="text-xs text-white/40 font-mono">{index + 1} / {quizQuestions.length}</span>
           </div>
           <div className="h-1 rounded-full bg-white/5 overflow-hidden">
             <motion.div 
               className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
               initial={{ width: 0 }} 
               animate={{ width: `${progress}%` }} 
               transition={{ duration: 0.5, ease: "easeOut" }} 
             />
           </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col w-full"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-10 leading-tight tracking-tight text-white text-center">
              {question.question}
            </h2>

            <div className="grid gap-4 w-full max-w-2xl mx-auto">
              {question.options.map((option, i) => {
                const active = selectedOption === option.id;
                return (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    key={option.id}
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                    className={`group relative overflow-hidden rounded-2xl border px-8 py-5 text-left transition-all duration-300 ${
                      active
                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`text-lg font-medium ${active ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                        {option.label}
                      </span>
                      {active && (
                        <motion.div layoutId="check" className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </motion.div>
                      )}
                    </div>
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-2xl mx-auto mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            disabled={index === 0}
            onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
            className="order-2 justify-center text-white/50 hover:text-white sm:order-1 sm:justify-start"
          >
            Previous
          </Button>

          {!isLast ? (
            <Button
              disabled={!canContinue}
              onClick={() => setIndex((prev) => prev + 1)}
              className="order-1 h-12 w-full rounded-full bg-white px-8 text-black hover:bg-white/90 sm:order-2 sm:w-auto"
            >
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="premium"
              disabled={!canContinue || submitting}
              onClick={onSubmit}
              className="order-1 h-14 w-full rounded-full px-10 text-base sm:order-2 sm:w-auto"
            >
              {submitting ? "Analyzing Profile..." : "Analyze Profile"}
              {!submitting && <Sparkles className="ml-2 w-4 h-4" />}
            </Button>
          )}
        </div>

        {error ? <FeedbackBanner message={error} tone="error" className="mt-8 w-full max-w-2xl mx-auto" /> : null}

        <div className="w-full max-w-4xl mx-auto mt-10">
          <NextStepCard
            currentStep="Career Quiz"
            nextStep="View AI Recommendations"
            nextHref="/recommendations"
            helperText="Finish this quiz to unlock personalized career matches."
            ctaLabel="Finish Quiz First"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

