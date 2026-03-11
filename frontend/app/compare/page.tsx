"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Sparkles, AlertCircle, TrendingUp, BriefcaseBusiness, Compass, Activity, ShieldCheck, Scale, Award } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FeedbackBanner } from "@/components/feedback-banner";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { api } from "@/lib/api";
import { setJourneyState } from "@/lib/journey";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { CareerComparison, CareerSummary } from "@/types";

function metricTone(value: string): string {
  if (value.toLowerCase().includes("high") || value.toLowerCase().includes("very")) {
    return "text-emerald-400";
  }
  if (value.toLowerCase().includes("low")) {
    return "text-amber-400";
  }
  return "text-white/70";
}

function StatRow({ label, valA, valB, toneA = "text-white/90", toneB = "text-white/90", icon: Icon }: { label: string, valA: React.ReactNode, valB: React.ReactNode, toneA?: string, toneB?: string, icon?: any }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4 border-b border-white/5 last:border-0 relative">
      <div className={`text-right font-medium text-sm md:text-base ${toneA}`}>{valA}</div>
      <div className="flex flex-col items-center justify-center w-24 shrink-0 text-white/40">
        {Icon && <Icon className="w-4 h-4 mb-1 text-slate-500" />}
        <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
      </div>
      <div className={`text-left font-medium text-sm md:text-base ${toneB}`}>{valB}</div>
    </div>
  );
}

export default function ComparePage() {
  const ready = useAuthGuard();
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [careerA, setCareerA] = useState("");
  const [careerB, setCareerB] = useState("");
  const [result, setResult] = useState<CareerComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;

    api.getCareers()
      .then((items) => {
        setCareers(items);
        if (items.length >= 2) {
          setCareerA(items[0].id);
          setCareerB(items[1].id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load careers"));
  }, [ready]);

  const selectedA = useMemo(() => careers.find((career) => career.id === careerA) ?? null, [careerA, careers]);
  const selectedB = useMemo(() => careers.find((career) => career.id === careerB) ?? null, [careerB, careers]);

  const canCompare = Boolean(careerA && careerB && careerA !== careerB);

  const onCompare = async () => {
    if (!canCompare) {
      setError("Choose two different careers to compare.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const comparison = await api.compareCareers(careerA, careerB);
      setResult(comparison);
      setJourneyState({ comparedCareers: true });
      setTimeout(() => {
        document.getElementById("compare-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-10 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <PageHeader
          badge="Step 2"
          title="Compare Careers"
          description="Evaluate and benchmark two distinct career paths head-to-head."
          actions={[
            { href: "/advisor", label: "Ask AI Advisor" },
            { href: "/roadmap", label: "Build Roadmap" },
          ]}
        />
      </FadeIn>

      {error && <FeedbackBanner message={error} tone="error" className="mb-2" />}

      {careers.length < 2 ? (
        <SlideUp>
          <EmptyState
            title="Insufficient Career Data"
            description="Comparison requires at least two distinct careers. Explore the job market to collect more roles."
            action={<Button onClick={() => window.location.href='/careers'}>Explore Careers</Button>}
          />
        </SlideUp>
      ) : (
        <div className="space-y-8">
          <SlideUp delay={0.1}>
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-50 pointer-events-none" />
              <CardContent className="p-6 md:p-8 relative">
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Career A Select */}
                  <div className="w-full md:w-5/12 space-y-3 relative z-10">
                    <label className="text-xs uppercase font-black tracking-widest text-blue-400">Path A</label>
                    <select
                      className="h-14 w-full rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md px-4 text-base font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none transition-colors hover:border-white/20 shadow-inner"
                      value={careerA}
                      onChange={(event) => setCareerA(event.target.value)}
                    >
                      {careers.map((career) => (
                        <option key={career.id} value={career.id}>
                          {career.careerName}
                        </option>
                      ))}
                    </select>
                    {selectedA && (
                      <div className="flex items-center justify-between px-2 pt-2 pb-1">
                        <span className="text-sm font-black text-white">${selectedA.avgSalary.toLocaleString()}</span>
                        <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/50">{selectedA.difficulty}</Badge>
                      </div>
                    )}
                  </div>

                  {/* VS Badge */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white font-black text-xl italic z-10 border-4 border-[#0a0a0a]">
                    VS
                  </div>

                  {/* Career B Select */}
                  <div className="w-full md:w-5/12 space-y-3 relative z-10">
                    <label className="text-xs uppercase font-black tracking-widest text-purple-400 text-right block">Path B</label>
                    <select
                      className="h-14 w-full rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md px-4 text-base font-semibold text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none transition-colors hover:border-white/20 shadow-inner text-right"
                      value={careerB}
                      onChange={(event) => setCareerB(event.target.value)}
                      dir="rtl"
                    >
                      {careers.map((career) => (
                        <option key={career.id} value={career.id}>
                          {career.careerName}
                        </option>
                      ))}
                    </select>
                    {selectedB && (
                      <div className="flex items-center justify-between px-2 pt-2 pb-1 flex-row-reverse">
                        <span className="text-sm font-black text-white">${selectedB.avgSalary.toLocaleString()}</span>
                        <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/50">{selectedB.difficulty}</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-center z-20 relative">
                  <Button 
                    onClick={onCompare} 
                    disabled={!canCompare || loading}
                    className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><Activity className="w-5 h-5 animate-pulse" /> Benchmarking Data...</span>
                    ) : (
                      <span className="flex items-center gap-2">Execute Benchmark <ArrowRightLeft className="w-4 h-4 ml-1" /></span>
                    )}
                  </Button>
                </div>

              </CardContent>
            </Card>
          </SlideUp>

          {result && (
            <SlideUp delay={0.2}>
              <div id="compare-results" className="pt-4 space-y-8">
                
                {/* Visual Summary Head */}
                <div className="text-center max-w-2xl mx-auto space-y-4">
                  <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-1.5 uppercase tracking-widest text-xs">
                    Comparison Complete
                  </Badge>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base border border-white/5 bg-white/[0.02] p-6 rounded-2xl shadow-glass">
                    {result.summary}
                  </p>
                </div>

                {/* detailed breakdown table styling */}
                <Card className="border-white/10 bg-white/[0.01] backdrop-blur-2xl shadow-glass overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 border-b border-white/5 bg-white/[0.03]">
                     <div className="text-right font-black text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400">{result.careerA.careerName}</div>
                     <div className="w-24 shrink-0 text-center"><ShieldCheck className="w-6 h-6 mx-auto text-slate-600" /></div>
                     <div className="text-left font-black text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">{result.careerB.careerName}</div>
                  </div>
                  <CardContent className="p-0">
                    <StatRow 
                      label="Avg Salary" 
                      valA={`$${result.careerA.avgSalary.toLocaleString()}`} 
                      valB={`$${result.careerB.avgSalary.toLocaleString()}`} 
                      toneA={result.careerA.avgSalary > result.careerB.avgSalary ? "text-emerald-400 font-black text-lg" : "text-white/60"}
                      toneB={result.careerB.avgSalary > result.careerA.avgSalary ? "text-emerald-400 font-black text-lg" : "text-white/60"}
                      icon={BriefcaseBusiness}
                    />
                    <StatRow 
                      label="Job Demand" 
                      valA={result.careerA.jobDemand} 
                      valB={result.careerB.jobDemand} 
                      toneA={metricTone(result.careerA.jobDemand)}
                      toneB={metricTone(result.careerB.jobDemand)}
                      icon={TrendingUp}
                    />
                    <StatRow 
                      label="Difficulty" 
                      valA={result.careerA.difficulty} 
                      valB={result.careerB.difficulty} 
                      toneA={result.careerA.difficulty === "Low" ? "text-emerald-400" : result.careerA.difficulty === "High" ? "text-amber-400" : "text-white/70"}
                      toneB={result.careerB.difficulty === "Low" ? "text-emerald-400" : result.careerB.difficulty === "High" ? "text-amber-400" : "text-white/70"}
                      icon={Activity}
                    />
                    <StatRow 
                      label="Work-Life Balance" 
                      valA={result.careerA.workLifeBalance} 
                      valB={result.careerB.workLifeBalance} 
                      toneA={metricTone(result.careerA.workLifeBalance)}
                      toneB={metricTone(result.careerB.workLifeBalance)}
                      icon={Scale}
                    />
                  </CardContent>
                </Card>

              </div>
            </SlideUp>
          )}

        </div>
      )}
    </div>
  );
}
