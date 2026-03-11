"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Briefcase, TrendingUp, ArrowRight, Bookmark, BookmarkCheck } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { api } from "@/lib/api";
import { GuidedFlowState, getGuidedFlowState } from "@/lib/guided-flow";
import { setJourneyState } from "@/lib/journey";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { CareerSummary } from "@/types";

const defaultFlow: GuidedFlowState = {
  quizCompleted: false,
  recommendationsViewed: false,
  skillGapAnalyzed: false,
  roadmapStarted: false,
  advisorUsed: false,
};

function inferCategory(careerName: string): string {
  const name = careerName.toLowerCase();
  if (name.includes("data") || name.includes("software") || name.includes("cyber")) {
    return "Technology";
  }
  if (name.includes("design")) {
    return "Design";
  }
  if (name.includes("marketing") || name.includes("product")) {
    return "Business";
  }
  return "General";
}

export default function CareersPage() {
  const ready = useAuthGuard();
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [savedCareerIds, setSavedCareerIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [flowState, setFlowState] = useState<GuidedFlowState>(defaultFlow);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    Promise.all([api.getCareers(), api.getDashboard()])
      .then(([careerList, dashboard]) => {
        setCareers(careerList);
        setSavedCareerIds(new Set(dashboard.savedCareers.map((career) => career.id)));
        setFlowState(getGuidedFlowState());
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load careers"));
  }, [ready]);

  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      const matchesSearch = career.careerName.toLowerCase().includes(search.toLowerCase().trim());
      const category = inferCategory(career.careerName);
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "all" || career.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [careers, categoryFilter, difficultyFilter, search]);

  const difficulties = useMemo(() => {
    const unique = new Set(careers.map((career) => career.difficulty));
    return ["all", ...Array.from(unique)];
  }, [careers]);

  const categories = useMemo(() => {
    const unique = new Set(careers.map((career) => inferCategory(career.careerName)));
    return ["all", ...Array.from(unique)];
  }, [careers]);

  const onSave = async (careerId: string) => {
    setError(null);
    setMessage(null);
    setSavingId(careerId);

    try {
      await api.saveCareer(careerId);
      setSavedCareerIds((prev) => new Set([...prev, careerId]));
      setJourneyState({ savedCareer: true });
      setMessage("Career saved successfully. You can now compare it on the dashboard.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save career");
    } finally {
      setSavingId(null);
    }
  };

  if (!ready) return <AnimatedLoader text="Loading careers..." fullScreen />;

  return (
    <div className="flex flex-col gap-10 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <PageHeader
          badge="Career Explorer"
          title="Discover Opportunities"
          description="Browse through comprehensive career profiles, filter by domain, and find your next big jump."
          actions={[
            { href: "/recommendations", label: "View AI Matches" },
            { href: "/skill-analyzer", label: "Analyze Skill Gap" },
          ]}
        />
      </FadeIn>

      <SlideUp delay={0.1}>
        <JourneyStepper state={flowState} currentHref="/careers" />
      </SlideUp>

      <div className="space-y-6">
        <SlideUp delay={0.2}>
          <div className="sticky top-24 z-30 mb-8 p-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-glass flex flex-col md:flex-row gap-4 items-center justify-between">
             
             <div className="relative w-full md:w-1/2 lg:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                <Input
                  className="pl-10 h-12 bg-white/[0.03] border-white/10 text-white focus-visible:ring-indigo-500/50 rounded-xl"
                  placeholder="Search roles like 'Data Scientist'..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
             </div>

             <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-48">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                  <select
                    className="h-12 w-full pl-9 pr-4 rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none hover:border-white/20 transition-colors cursor-pointer"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Domains" : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1 md:w-48">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                  <select
                    className="h-12 w-full pl-9 pr-4 rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none hover:border-white/20 transition-colors cursor-pointer"
                    value={difficultyFilter}
                    onChange={(event) => setDifficultyFilter(event.target.value)}
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty === "all" ? "All Levels" : difficulty}
                      </option>
                    ))}
                  </select>
                </div>
             </div>
          </div>
        </SlideUp>

        {error && <FeedbackBanner message={error} tone="error" className="mb-2" />}
        {message && <FeedbackBanner message={message} tone="success" className="mb-2" />}

        {filteredCareers.length === 0 ? (
          <SlideUp delay={0.3}>
            <EmptyState
              title="No careers found"
              description="Try adjusting your filters or search terms to see more results."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("all");
                    setDifficultyFilter("all");
                  }}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              }
            />
          </SlideUp>
        ) : (
          <StaggerChildren staggerDelay={0.05} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCareers.map((career) => {
              const isSaved = savedCareerIds.has(career.id);
              const isSaving = savingId === career.id;
              const category = inferCategory(career.careerName);

              return (
                <StaggerItem key={career.id}>
                  <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass flex flex-col group hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)] hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <CardHeader className="p-6 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <CardTitle className="text-xl font-bold leading-tight line-clamp-2 text-white group-hover:text-indigo-300 transition-colors">
                            {career.careerName}
                          </CardTitle>
                          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-xs font-semibold uppercase tracking-wide">
                            {category}
                          </Badge>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className={`shrink-0 rounded-full h-10 w-10 transition-colors ${isSaved ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                          disabled={isSaved || isSaving}
                          onClick={(e) => {
                             e.preventDefault();
                             onSave(career.id);
                          }}
                          title={isSaved ? "Saved to Dashboard" : "Save Career"}
                        >
                           {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 pt-2 flex flex-col flex-1">
                      <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-3">
                           <div>
                             <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Avg Salary</p>
                             <p className="font-bold text-white">${career.avgSalary.toLocaleString()}</p>
                           </div>
                           <div>
                             <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Growth</p>
                             <p className="font-bold text-emerald-400">{career.growthRate}</p>
                           </div>
                        </div>
                        <div>
                           <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Difficulty</p>
                           <Badge variant="secondary" className="bg-white/5 text-white/70">
                             {career.difficulty} Focus Required
                           </Badge>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Link href={`/careers/${career.id}`} className="block">
                          <Button className="w-full bg-white text-black hover:bg-white/90 font-bold group/btn flex items-center justify-center gap-2 h-11">
                            Explore Profile <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        )}
      </div>

      <SlideUp delay={0.4}>
        <NextStepCard
          currentStep="Explore Careers"
          nextStep="Analyze Skill Gap"
          nextHref="/skill-analyzer"
          helperText="After shortlisting roles, analyze your current skills against your target role."
        />
      </SlideUp>
    </div>
  );
}
