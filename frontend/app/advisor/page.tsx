"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bot, SendHorizonal, Sparkles, MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn, SlideUp } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { api } from "@/lib/api";
import { GuidedFlowState, getGuidedFlowState, setGuidedFlowState } from "@/lib/guided-flow";
import { setJourneyState } from "@/lib/journey";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { AdvisorChatHistoryItem } from "@/types";

const promptSuggestions = [
  "How do I become a data scientist from a B.Com background?",
  "Which is better for me: software engineering or cybersecurity?",
  "What should I learn in the next 3 months for UI/UX?",
];

export default function AdvisorPage() {
  const ready = useAuthGuard();
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<AdvisorChatHistoryItem[]>([]);
  const [flowState, setFlowState] = useState<GuidedFlowState>({
    quizCompleted: false,
    recommendationsViewed: false,
    skillGapAnalyzed: false,
    roadmapStarted: false,
    advisorUsed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;

    api.getAdvisorHistory()
      .then((history) => {
        setChat(history);
        if (history.length > 0) {
          setFlowState(setGuidedFlowState({ advisorUsed: true }));
        } else {
          setFlowState(getGuidedFlowState());
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load advisor history"));
  }, [ready]);

  useEffect(() => {
    if (chat.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, loading]);

  if (!ready) return null;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = question.trim();
    if (trimmed.length < 3) return;

    setLoading(true);
    setError(null);
    setQuestion("");

    // Optimistic user message (optional, but good for UX)
    const tempId = Date.now().toString();
    setChat(prev => [...prev, { id: tempId, question: trimmed, answer: "", suggestedCareers: [], nextSteps: [], createdAt: "" }]);

    try {
      await api.careerAdvice(trimmed);
      const history = await api.getAdvisorHistory();
      setChat(history);
      setJourneyState({ askedAdvisor: true });
      setFlowState(setGuidedFlowState({ advisorUsed: true }));
    } catch (err) {
      setChat(prev => prev.filter(msg => msg.id !== tempId));
      setError(err instanceof Error ? err.message : "Failed to fetch advice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-24 relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <div className="w-full pt-8">
          <JourneyStepper state={flowState} currentHref="/advisor" />
        </div>
      </FadeIn>

      <SlideUp className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-2">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">AI Consultation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
          Career Expert Advisor
        </h1>
        <p className="text-lg text-white/60 mb-6">
          Ask specific role questions, get interview prep, or explore alternative career pivots.
        </p>
      </SlideUp>

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Chat History */}
        <div className="flex-1 space-y-8 pb-4">
          {chat.length === 0 && !loading ? (
             <SlideUp delay={0.2} className="w-full">
               <Card className="p-12 text-center border-dashed border-white/10 bg-white/[0.01]">
                  <Bot className="w-12 h-12 text-white/10 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Start a conversation</h3>
                  <p className="text-white/40 max-w-md mx-auto">Ask about specific roles, salary expectations, or what skills to learn next. I&apos;ll provide actionable advice.</p>
               </Card>
             </SlideUp>
          ) : (
            <AnimatePresence initial={false}>
              {chat.map((entry) => (
                <motion.div 
                  key={entry.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-6"
                >
                  {/* User Message */}
                  <div className="flex w-full justify-end">
                    <div className="flex max-w-[85%] items-end gap-3 md:max-w-[75%]">
                      <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-purple-500 px-5 py-3.5 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)]">
                        <p className="text-[15px] leading-relaxed">{entry.question}</p>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/20 text-indigo-300">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* AI Message */}
                  {entry.answer && (
                    <div className="flex w-full justify-start">
                      <div className="flex max-w-[90%] items-end gap-3 md:max-w-[85%]">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-400 mb-1 shadow-[0_0_15px_rgba(56,189,248,0.15)] glow relative">
                          <Bot className="h-4 w-4 relative z-10" />
                          <div className="absolute inset-0 bg-sky-400/20 blur-md rounded-full pointer-events-none" />
                        </div>
                        <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl px-6 py-5 shadow-glass">
                          <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{entry.answer}</p>
                          </div>

                          {entry.suggestedCareers && entry.suggestedCareers.length > 0 && (
                            <div className="mt-6 border-t border-white/10 pt-5">
                              <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-sky-400">Suggested Roles</p>
                              <div className="flex flex-wrap gap-2">
                                {entry.suggestedCareers.map((career) => (
                                  <Badge key={career} variant="secondary" className="bg-sky-500/10 text-sky-200 border-sky-500/20 hover:bg-sky-500/20 px-3 py-1">
                                    {career}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {entry.nextSteps && entry.nextSteps.length > 0 && (
                            <div className="mt-6 rounded-xl bg-black/20 p-5 border border-white/5 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-sky-400" />
                              <p className="mb-4 text-[11px] font-black uppercase tracking-widest text-indigo-400 ml-2">Action Plan</p>
                              <ul className="space-y-3.5 ml-2">
                                {entry.nextSteps.map((step, i) => (
                                  <li key={i} className="flex gap-3 items-start group">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 mt-0.5 group-hover:bg-indigo-500/20 transition-colors">{i + 1}</span>
                                    <span className="text-[14px] text-white/80 leading-snug">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Loading Indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start mt-6">
              <div className="flex items-end gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-400 glow">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5 py-4 shadow-glass items-center h-[52px]">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="h-2 w-2 rounded-full bg-sky-400" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-2 w-2 rounded-full bg-indigo-400" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-2 w-2 rounded-full bg-purple-400" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-6 z-20 mt-auto">
          <SlideUp delay={0.3}>
            <Card className="border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_−10px_40px_rgba(0,0,0,0.5)] overflow-visible relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-purple-500/20 rounded-xl blur pointer-events-none opacity-50" />
              <CardContent className="p-4 relative bg-[#0a0a0a] rounded-xl border border-white/10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {promptSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setQuestion(prompt)}
                      className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/60 transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <form className="relative flex items-end gap-3" onSubmit={onSubmit}>
                  <Textarea
                    className="resize-none pr-14 bg-white/[0.02] text-white text-[15px] min-h-[60px] max-h-[150px] rounded-xl border-white/10 focus-visible:ring-1 focus-visible:ring-sky-500/50 focus-visible:border-sky-500/50 backdrop-blur-sm py-3.5 placeholder:text-white/20"
                    placeholder="Ask for advice, interview prep, or curriculum details..."
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (question.trim().length >= 3 && !loading) {
                           onSubmit(e as any);
                        }
                      }
                    }}
                    required
                    rows={1}
                  />
                  <Button 
                    type="submit" 
                    variant="premium"
                    size="icon" 
                    className="absolute right-2 bottom-2 h-10 w-10 mb-[3px] rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_0_15px_rgba(56,189,248,0.4)] border-none" 
                    disabled={loading || question.trim().length < 3}
                  >
                    <SendHorizonal className="h-5 w-5 text-white" />
                  </Button>
                </form>

                {!ready && <AnimatedLoader text="Connecting to AI Advisor..." fullScreen />}
              </CardContent>
            </Card>
          </SlideUp>
        </div>
        
        <SlideUp delay={0.4} className="mt-4">
          <NextStepCard
            currentStep="AI Career Advisor"
            nextStep="Review Profile and Dashboard"
            nextHref="/profile"
            helperText="Update education and skills in profile so future guidance is more accurate."
          />
        </SlideUp>
      </div>
    </div>
  );
}
