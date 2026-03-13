"use client";

import { FormEvent, useEffect, useState } from "react";
import { User, Briefcase, GraduationCap, Monitor, FileText, Activity, Terminal, Link as LinkIcon, Star, CheckCircle2, ChevronRight, FolderDot, LayoutTemplate } from "lucide-react";

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
  GeneratedResumePortfolioResponse,
  ResumePortfolioListItem,
  ResumePortfolioResult,
} from "@/types";

function splitCsv(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseResumePortfolio(content: string): ResumePortfolioResult | null {
  try {
    const parsed = JSON.parse(content) as ResumePortfolioResult;
    if (!parsed.headline || !Array.isArray(parsed.resumeSections)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export default function ResumeBuilderPage() {
  const ready = useAuthGuard();

  const [targetCareer, setTargetCareer] = useState("");
  const [fullName, setFullName] = useState("");
  const [education, setEducation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [projectsInput, setProjectsInput] = useState("");
  const [achievementsInput, setAchievementsInput] = useState("");
  const [experiencesInput, setExperiencesInput] = useState("");
  const [linksInput, setLinksInput] = useState("");

  const [generated, setGenerated] = useState<GeneratedResumePortfolioResponse | null>(null);
  const [history, setHistory] = useState<ResumePortfolioListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    setLoadingHistory(true);

    api.getResumePortfolios()
      .then((items) => {
        setHistory(items);
        if (items.length > 0) {
          setJourneyState({ builtResumePortfolio: true });
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load resume history. Please try again.")
      )
      .finally(() => setLoadingHistory(false));
  }, [ready]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.generateResumePortfolio({
        targetCareer,
        fullName,
        education,
        skills: splitCsv(skillsInput),
        projects: splitCsv(projectsInput),
        achievements: splitCsv(achievementsInput),
        experiences: splitCsv(experiencesInput),
        links: splitCsv(linksInput),
      });

      setGenerated(response);
      setJourneyState({ builtResumePortfolio: true });

      const content = JSON.stringify(response.resumePortfolio);
      setHistory((prev) => [
        {
          id: response.resumePortfolioId,
          title: `Resume + portfolio pack for ${targetCareer}`,
          targetCareer,
          content,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      
      setTimeout(() => {
         document.getElementById("generated-resume")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate resume and portfolio pack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return <AnimatedLoader text="Loading resume builder..." fullScreen />;

  return (
    <div className="flex flex-col gap-10 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <PageHeader
          badge="Step 6"
          title="Resume + Portfolio Builder"
          description="Generate ATS-focused resume sections and standout portfolio project ideas tailored specifically to your target role."
          actions={[
            { href: "/dashboard", label: "Back to Dashboard" },
            { href: "/learning-path", label: "Learning Path" },
          ]}
        />
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Main Content Area */}
        <div className="space-y-8">
          <SlideUp delay={0.1}>
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Career Profile Inputs</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form className="space-y-6" onSubmit={onSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white/70">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                        <Input 
                          value={fullName} 
                          onChange={(event) => setFullName(event.target.value)} 
                          placeholder="e.g. Alex Doe"
                          className="pl-10 bg-white/[0.03] border-white/10 text-white focus-visible:ring-blue-500/50" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white/70">Target Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                        <Input 
                          value={targetCareer} 
                          onChange={(event) => setTargetCareer(event.target.value)} 
                          placeholder="e.g. Data Scientist"
                          className="pl-10 bg-white/[0.03] border-white/10 text-white focus-visible:ring-blue-500/50" 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Education</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                      <Input 
                        value={education} 
                        onChange={(event) => setEducation(event.target.value)} 
                        placeholder="e.g. B.Tech in Computer Science, Final Year"
                        className="pl-10 bg-white/[0.03] border-white/10 text-white focus-visible:ring-blue-500/50" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/70"><Terminal className="w-4 h-4 text-sky-400" /> Core Skills</label>
                    <p className="text-xs text-white/40 mb-2">Comma separated technical and soft skills.</p>
                    <Input 
                      value={skillsInput} 
                      onChange={(event) => setSkillsInput(event.target.value)} 
                      placeholder="e.g. Python, SQL, Machine Learning"
                      className="bg-white/[0.03] border-white/10 text-white focus-visible:ring-blue-500/50" 
                      required 
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/70"><Monitor className="w-4 h-4 text-indigo-400" /> Existing Projects</label>
                    <p className="text-xs text-white/40 mb-2">Comma separated brief project names or descriptions.</p>
                    <Input 
                      value={projectsInput} 
                      onChange={(event) => setProjectsInput(event.target.value)} 
                      placeholder="e.g. Sales forecasting model"
                      className="bg-white/[0.03] border-white/10 text-white focus-visible:ring-blue-500/50" 
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 pt-2 border-t border-white/5">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-white/70"><Star className="w-4 h-4 text-amber-400" /> Achievements</label>
                      <Input 
                        value={achievementsInput} 
                        onChange={(event) => setAchievementsInput(event.target.value)} 
                        className="bg-white/[0.03] border-white/10 text-white focus-visible:ring-blue-500/50" 
                        placeholder="Hackathon winner, Certifications..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-white/70"><Briefcase className="w-4 h-4 text-emerald-400" /> Experience</label>
                      <Input 
                        value={experiencesInput} 
                        onChange={(event) => setExperiencesInput(event.target.value)} 
                        className="bg-white/[0.03] border-white/10 text-white focus-visible:ring-blue-500/50" 
                        placeholder="Internships, clubs, volunteering..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/70"><LinkIcon className="w-4 h-4 text-pink-400" /> Portfolio Links</label>
                    <Input 
                      value={linksInput} 
                      onChange={(event) => setLinksInput(event.target.value)} 
                      className="bg-white/[0.03] border-white/10 text-white focus-visible:ring-blue-500/50" 
                      placeholder="github.com/xx, linkedin.com/in/xx"
                    />
                  </div>

                  {error && <FeedbackBanner message={error} tone="error" className="mb-4" />}

                  <Button type="submit" disabled={loading} variant="premium" className="w-full mt-2 h-12 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white">
                    {loading ? (
                       <span className="flex items-center gap-2"> <Activity className="w-5 h-5 animate-pulse" /> Engineering Career Artifacts...</span>
                    ) : (
                       <span className="flex items-center gap-2"><LayoutTemplate className="w-5 h-5" /> Generate Resume & Portfolio Pack</span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Generated Results Area */}
          {generated && (
            <SlideUp delay={0.2}>
              <div id="generated-resume" className="space-y-6 pt-6">
                 <div className="flex items-center gap-3">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-500/30 px-4 py-1.5 uppercase tracking-widest text-[10px] font-black">
                      AI Generated Artifacts
                    </Badge>
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                 </div>

                 <Card className="border-white/10 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <CardHeader className="pb-6 border-b border-white/5 relative">
                      <CardTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 leading-tight">
                        {generated.resumePortfolio.headline}
                      </CardTitle>
                      <p className="text-white/70 text-base mt-4 leading-relaxed font-medium">
                        {generated.resumePortfolio.professionalSummary}
                      </p>

                      <div className="mt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mb-3 flex items-center gap-2">
                           <CheckCircle2 className="w-3.5 h-3.5" /> High-Value ATS Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {generated.resumePortfolio.atsKeywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-3 py-1 font-medium">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-8 pt-6 relative">
                      
                      {/* Resume Sections */}
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-indigo-400" /> Tailored Resume Sections</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          {generated.resumePortfolio.resumeSections.map((section, idx) => (
                            <div key={`section-${idx}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 shadow-sm hover:bg-white/[0.04] transition-colors group">
                              <p className="font-bold text-indigo-300 mb-3 uppercase tracking-wide text-xs">{section.heading}</p>
                              <ul className="space-y-3">
                                {section.bullets.map((bullet, i) => (
                                  <li key={`bullet-${i}`} className="text-sm text-white/80 flex items-start gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 mt-1.5 shrink-0" />
                                    <span className="leading-relaxed">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Portfolio Projects */}
                      <div className="pt-6 border-t border-white/5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><FolderDot className="w-5 h-5 text-sky-400" /> Standout Portfolio Concepts</h3>
                        
                        <div className="space-y-4">
                          {generated.resumePortfolio.portfolioProjects.map((project, idx) => (
                            <div key={`proj-${idx}`} className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-6 shadow-sm group hover:border-sky-500/30 transition-all">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
                                 <h4 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">{project.name}</h4>
                                 <div className="flex flex-wrap gap-2">
                                   {project.stack.map((tech) => (
                                     <Badge key={`${project.name}-${tech}`} variant="outline" className="bg-white/5 border-white/10 text-white/70">
                                       {tech}
                                     </Badge>
                                   ))}
                                 </div>
                              </div>

                              <div className="grid md:grid-cols-3 gap-6">
                                 <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-amber-500/80">The Problem</p>
                                    <p className="text-sm text-white/70 leading-relaxed">{project.problem}</p>
                                 </div>
                                 <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-sky-500/80">The Solution</p>
                                    <p className="text-sm text-white/70 leading-relaxed">{project.solution}</p>
                                 </div>
                                 <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500/80">The Impact</p>
                                    <p className="text-sm text-white/70 leading-relaxed font-semibold text-emerald-100">{project.impact}</p>
                                 </div>
                              </div>
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
                title="Awaiting Input"
                description="Complete the profile form and generate your personalized resume content."
              />
            </SlideUp>
          )}
        </div>

        {/* Sidebar: History */}
        <div className="space-y-6">
           <SlideUp delay={0.3}>
             <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass sticky top-24">
               <CardHeader className="border-b border-white/5 pb-3">
                 <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Generation History</CardTitle>
               </CardHeader>
               <CardContent className="pt-4 p-0">
                  {loadingHistory ? (
                    <AnimatedLoader text="Loading generation history..." className="py-8" />
                  ) : history.length === 0 ? (
                    <div className="p-6 text-center text-white/40 text-sm">No saved resume packs yet.</div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                      {history.map((item) => {
                        const parsed = parseResumePortfolio(item.content);
                        const summary = parsed?.professionalSummary ?? `Target career: ${item.targetCareer}`;
                        const dateRaw = new Date(item.createdAt);
                        const isToday = dateRaw.toDateString() === new Date().toDateString();
                        const displayDate = isToday ? "Today" : dateRaw.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                        return (
                          <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                             <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-1">{item.title}</p>
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
