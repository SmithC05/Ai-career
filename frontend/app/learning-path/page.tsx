"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Map, Target, Clock, Calendar, Sparkles, Send, Activity, ChevronRight, GraduationCap } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FeedbackBanner } from "@/components/feedback-banner";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { AnimatedLoader } from "@/components/animated-loader";
import { api } from "@/lib/api";
import { setJourneyState } from "@/lib/journey";
import { useAuthGuard } from "@/lib/use-auth-guard";
import {
  GeneratedLearningPathResponse,
  LearningPathListItem,
  LearningPathResult,
} from "@/types";

const learningStyleOptions = [
  "Project-based",
  "Visual",
  "Reading/Writing",
  "Mentor-guided",
];

function parseLearningPath(content: string): LearningPathResult | null {
  try {
    const parsed = JSON.parse(content) as LearningPathResult;
    if (!parsed.summary || !Array.isArray(parsed.milestones)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export default function LearningPathPage() {
  const ready = useAuthGuard();

  const [targetCareer, setTargetCareer] = useState("Data Scientist");
  const [skillsInput, setSkillsInput] = useState("Python, SQL, Statistics");
  const [learningStyle, setLearningStyle] = useState(learningStyleOptions[0]);
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [timelineMonths, setTimelineMonths] = useState(6);
  const [generated, setGenerated] = useState<GeneratedLearningPathResponse | null>(null);
  const [history, setHistory] = useState<LearningPathListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSkills = useMemo(
    () =>
      skillsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [skillsInput]
  );

  useEffect(() => {
    if (!ready) return;

    api.getLearningPaths()
      .then((items) => {
        setHistory(items);
        if (items.length > 0) {
          setJourneyState({ generatedLearningPath: true });
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load learning paths"));
  }, [ready]);

  const generatePath = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.generateLearningPath({
        targetCareer,
        currentSkills,
        weeklyHours,
        learningStyle,
        timelineMonths,
      });

      setGenerated(response);
      setJourneyState({ generatedLearningPath: true });

      const content = JSON.stringify(response.learningPath);
      setHistory((prev) => [
        {
          id: response.learningPathId,
          title: `Personalized learning path for ${targetCareer}`,
          content,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setTimeout(() => {
         document.getElementById("generated-path")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate learning path");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-10 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <PageHeader
          badge="Step 5"
          title="Personalized Learning Path"
          description="Convert your target role, current skills, and weekly availability into a customized sprint-based curriculum."
          actions={[
            { href: "/dashboard", label: "Back to Dashboard" },
            { href: "/resume-builder", label: "Resume Builder" },
          ]}
        />
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Main Content Area */}
        <div className="space-y-8">
          <SlideUp delay={0.1}>
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2"><Map className="w-5 h-5 text-purple-400" /> Learning Parameters</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form className="space-y-6" onSubmit={generatePath}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white/70">Target Role</label>
                      <div className="relative">
                        <Target className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                        <Input 
                          value={targetCareer} 
                          onChange={(event) => setTargetCareer(event.target.value)} 
                          className="pl-10 bg-white/[0.03] border-white/10 text-white focus-visible:ring-purple-500/50" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white/70">Learning StylePreference</label>
                      <div className="relative">
                        <Sparkles className="absolute left-3 top-3 h-4 w-4 text-white/30 pointer-events-none" />
                        <select
                          className="h-10 w-full rounded-xl border border-white/10 bg-[#0a0a0a] pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none transition-colors hover:border-white/20"
                          value={learningStyle}
                          onChange={(event) => setLearningStyle(event.target.value)}
                        >
                          {learningStyleOptions.map((style) => (
                            <option key={style} value={style}>
                              {style}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Current Foundations (comma separated)</label>
                    <Input 
                      value={skillsInput} 
                      onChange={(event) => setSkillsInput(event.target.value)} 
                      className="bg-white/[0.03] border-white/10 text-white focus-visible:ring-purple-500/50" 
                      required 
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20 px-3 py-1 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {currentSkills.length === 0 && <span className="text-sm text-white/30 italic">Add some starting skills</span>}
                    </div>
                  </div>
                  {loading && (
          <SlideUp delay={0.2} className="lg:col-span-8">
            <AnimatedLoader text="Generating your personalized learning path..." />
          </SlideUp>
        )}
                  <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-white/5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-semibold text-white/70 flex items-center gap-2"><Clock className="w-4 h-4 text-sky-400" /> Weekly Hours</label>
                        <span className="text-sm font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">{weeklyHours} hrs</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={30}
                        value={weeklyHours}
                        onChange={(event) => setWeeklyHours(Number(event.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-sky-400"
                        style={{
                          background: `linear-gradient(to right, #38bdf8 ${(weeklyHours - 1) * 100 / 29}%, rgba(255,255,255,0.1) ${(weeklyHours - 1) * 100 / 29}%)`
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-semibold text-white/70 flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-400" /> Target Timeline</label>
                        <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{timelineMonths} months</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={24}
                        value={timelineMonths}
                        onChange={(event) => setTimelineMonths(Number(event.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-400"
                        style={{
                          background: `linear-gradient(to right, #34d399 ${(timelineMonths - 1) * 100 / 23}%, rgba(255,255,255,0.1) ${(timelineMonths - 1) * 100 / 23}%)`
                        }}
                      />
                    </div>
                  </div>

                  {error && <FeedbackBanner message={error} tone="error" className="mb-4" />}

                  <Button type="submit" disabled={loading} variant="premium" className="w-full mt-2 h-12 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    {loading ? (
                       <span className="flex items-center gap-2"> <Activity className="w-5 h-5 animate-pulse" /> Generating Custom Curriculum...</span>
                    ) : (
                       <span className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Architect My Learning Path</span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Generated Results Area */}
          {generated && (
            <SlideUp delay={0.2}>
              <div id="generated-path" className="space-y-6 pt-6">
                 <div className="flex items-center gap-3">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                    <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-500/30 px-4 py-1.5 uppercase tracking-widest text-[10px] font-black">
                      AI Generated Curriculum
                    </Badge>
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                 </div>

                 <Card className="border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-black text-white">Your Pathway to {targetCareer}</CardTitle>
                      <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-2xl">{generated.learningPath.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{generated.learningPath.timelineMonths} Month Horizon</Badge>
                        <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-sky-500/20">{generated.learningPath.weeklyHours} Hrs/Wk Dedication</Badge>
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">{generated.learningPath.learningStyle} Focus</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-8 pt-4">
                      
                      {/* Milestones Timeline */}
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Activity className="w-5 h-5 text-purple-400" /> Milestone Sprints</h3>
                        
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500/50 before:via-sky-500/50 before:to-transparent">
                          {generated.learningPath.milestones.map((milestone, idx) => (
                            <div key={`ms-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#0a0a0a] bg-gradient-to-br from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                                  <span className="text-sm font-black text-white">{milestone.week}</span>
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-glass group-hover:bg-white/[0.05] group-hover:border-purple-500/30 transition-all ml-4 md:ml-0">
                                  <h4 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors uppercase tracking-wide text-sm">{milestone.focus}</h4>
                                  
                                  <div className="space-y-3 mb-4">
                                     <p className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5 pb-1">Primary Tasks</p>
                                     <ul className="space-y-2">
                                       {milestone.tasks.map((task, i) => (
                                          <li key={`task-${i}`} className="text-sm text-white/70 flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> 
                                            <span className="leading-snug">{task}</span>
                                          </li>
                                       ))}
                                     </ul>
                                  </div>

                                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                                     <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500/50 mb-2">Sprint Outcomes</p>
                                     <ul className="space-y-1.5">
                                       {milestone.outcomes.map((outcome, i) => (
                                          <li key={`out-${i}`} className="text-xs text-white/80 flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                                            <span>{outcome}</span>
                                          </li>
                                       ))}
                                     </ul>
                                  </div>
                                </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div className="pt-6 border-t border-white/5">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4 text-sky-400" /> Recommended Learning Materials</h3>
                        <div className="flex flex-wrap gap-2">
                          {generated.learningPath.resources.map((resource, i) => (
                            <div key={`res-${i}`} className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.02] text-sm text-white hover:bg-white/10 transition-colors cursor-default">
                              {resource}
                            </div>
                          ))}
                        </div>
                      </div>

                    </CardContent>
                 </Card>
              </div>
            </SlideUp>
          )}

          {!generated && !loading && (
            <SlideUp delay={0.2}>
               <EmptyState
                title="Curriculum Engine Ready"
                description="Adjust your parameters above and initialize the engine to generate your sprint-based learning path."
              />
            </SlideUp>
          )}
        </div>

        {/* Sidebar: History */}
        <div className="space-y-6">
           <SlideUp delay={0.3}>
             <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass sticky top-24">
               <CardHeader className="border-b border-white/5 pb-3">
                 <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> Path History</CardTitle>
               </CardHeader>
               <CardContent className="pt-4 p-0">
                  {history.length === 0 ? (
                    <div className="p-6 text-center text-white/40 text-sm">No saved learning paths yet.</div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                      {history.map((item) => {
                        const parsed = parseLearningPath(item.content);
                        const summary = parsed?.summary ?? item.title;
                        const dateRaw = new Date(item.createdAt);
                        const isToday = dateRaw.toDateString() === new Date().toDateString();
                        const displayDate = isToday ? "Today" : dateRaw.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                        return (
                          <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                             <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{item.title}</p>
                                <span className="text-[10px] text-white/40 whitespace-nowrap ml-2 bg-white/5 px-2 py-0.5 rounded">{displayDate}</span>
                             </div>
                             <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{summary}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
               </CardContent>
             </Card>
           </SlideUp>
        </div>
      </div>
    </div>
  );
}
