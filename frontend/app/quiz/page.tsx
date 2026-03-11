"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { JourneyStepper } from "@/components/journey-stepper";
import { FeedbackBanner } from "@/components/feedback-banner";
import { NextStepCard } from "@/components/next-step-card";
import { Button } from "@/components/ui/button";
import { evaluateQuiz, quizQuestions, saveQuizResult } from "@/lib/career-quiz";
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
  const progress = Math.round(((index) / quizQuestions.length) * 100);

  useEffect(() => {
    if (!ready) return;
    setFlowState(getGuidedFlowState());
  }, [ready]);

  const isLast = index === quizQuestions.length - 1;
  const canContinue = useMemo(() => Boolean(selectedOption), [selectedOption]);

  if (!ready) return null;

  const onSubmit = () => {
    if (!isLast) return;
    setSubmitting(true);
    setError(null);

    try {
      const recommendations = evaluateQuiz(answers);
      saveQuizResult(recommendations);
      setFlowState(setGuidedFlowState({ quizCompleted: true }));
      router.push("/recommendations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate quiz");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-32">
      {/* Immersive background graphic */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />
      
      <div className="w-full max-w-4xl mx-auto pt-8 px-4 flex-none">
        <JourneyStepper state={flowState} currentHref="/quiz" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 mt-8">
        
        {/* Progress indicator */}
        <div className="w-full max-w-lg mb-12">
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

        <div className="w-full relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex flex-col w-full"
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
        </div>

        {error ? <FeedbackBanner message={error} tone="error" className="mt-8 w-full max-w-2xl" /> : null}

        <div className="w-full max-w-2xl mt-12 flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={index === 0}
            onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
            className="text-white/50 hover:text-white"
          >
            ← Previous
          </Button>

          {!isLast ? (
            <Button 
              disabled={!canContinue} 
              onClick={() => setIndex((prev) => prev + 1)}
              className="rounded-full px-8 h-12 bg-white text-black hover:bg-white/90"
            >
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button 
              variant="premium"
              disabled={!canContinue || submitting} 
              onClick={onSubmit}
              className="rounded-full px-10 h-14 text-base"
            >
              {submitting ? "Analyzing Profile..." : "Analyze Profile"} 
              {!submitting && <Sparkles className="ml-2 w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto px-4 mt-24">
        <NextStepCard
          currentStep="Career Quiz"
          nextStep="View AI Recommendations"
          nextHref="/recommendations"
          helperText="Complete this quiz first to unlock personalized career matches."
        />
      </div>
    </div>
  );
}
