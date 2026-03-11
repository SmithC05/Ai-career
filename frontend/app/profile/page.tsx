"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { UserCircle, Mail, GraduationCap, Calendar, BookOpen, Send, Sparkles } from "lucide-react";

import { FeedbackBanner } from "@/components/feedback-banner";
import { JourneyStepper } from "@/components/journey-stepper";
import { NextStepCard } from "@/components/next-step-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn, SlideUp, StaggerChildren, StaggerItem } from "@/components/motion";
import { GuidedFlowState, getGuidedFlowState } from "@/lib/guided-flow";
import { useAuthGuard } from "@/lib/use-auth-guard";

type StudentProfile = {
  fullName: string;
  email: string;
  education: string;
  year: string;
  skills: string[];
};

const PROFILE_KEY = "acn_student_profile_v1";

const defaultProfile: StudentProfile = {
  fullName: "",
  email: "",
  education: "Undergraduate",
  year: "1st Year",
  skills: [],
};

function ProfileStat({ title, value, caption, icon: Icon, delay = 0 }: { title: string, value: string, caption: string, icon: any, delay?: number }) {
  return (
    <StaggerItem>
      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden relative group h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/70 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/20 transition-all">
               <Icon className="w-5 h-5" />
             </div>
          </div>
          <p className="text-sm font-semibold text-white/50 mb-1">{title}</p>
          <p className="text-2xl font-black text-white whitespace-nowrap overflow-hidden text-ellipsis mb-1">{value}</p>
          <p className="text-xs text-white/40">{caption}</p>
        </CardContent>
      </Card>
    </StaggerItem>
  );
}

export default function ProfilePage() {
  const ready = useAuthGuard();
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [flowState, setFlowState] = useState<GuidedFlowState>({
    quizCompleted: false,
    recommendationsViewed: false,
    skillGapAnalyzed: false,
    roadmapStarted: false,
    advisorUsed: false,
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as StudentProfile;
      setProfile(parsed);
      setSkillsInput(parsed.skills.join(", "));
    } catch {
      // ignore broken local profile
    }

    setFlowState(getGuidedFlowState());
  }, [ready]);

  const skillCount = useMemo(() => profile.skills.length, [profile.skills]);

  if (!ready) return null;

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const skills = skillsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const nextProfile: StudentProfile = {
        ...profile,
        skills,
      };
      setProfile(nextProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
      setMessage("Profile saved successfully. Your recommendations will be updated.");
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-24 relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      <FadeIn>
        <PageHeader
          badge="Profile"
          title="Student Persona"
          description="Keep your education and skills updated to ensure highly accurate AI career matching."
        />
      </FadeIn>

      <SlideUp delay={0.1}>
        <JourneyStepper state={flowState} currentHref="/profile" />
      </SlideUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Column: Stats */}
         <div className="lg:col-span-1 border-r border-white/5 pr-0 lg:pr-6 pb-6 lg:pb-0 border-b lg:border-b-0 space-y-6">
            <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              <ProfileStat title="Skills Added" value={`${skillCount}`} caption="Total tagged skills" icon={BookOpen} />
              <ProfileStat title="Education" value={profile.education || "N/A"} caption="Current degree track" icon={GraduationCap} />
              <ProfileStat title="Stage" value={profile.year || "N/A"} caption="Academic timeline" icon={Calendar} />
            </StaggerChildren>
         </div>

         {/* Right Column: Profile Form */}
         <div className="lg:col-span-2 space-y-6">
            <SlideUp delay={0.2}>
              <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl"><UserCircle className="w-5 h-5 text-indigo-400" /> Identity & Settings</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="space-y-6" onSubmit={saveProfile}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/70">Full Name</label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                          <Input
                            className="pl-10 bg-white/[0.03] border-white/10 text-white focus-visible:ring-indigo-500/50"
                            value={profile.fullName}
                            onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/70">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                          <Input
                            type="email"
                            className="pl-10 bg-white/[0.03] border-white/10 text-white focus-visible:ring-indigo-500/50"
                            value={profile.email}
                            onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                            placeholder="student@university.edu"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/70">Academic Level</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-white/30 pointer-events-none" />
                          <select
                            className="h-10 w-full rounded-xl border border-white/10 bg-[#0a0a0a] pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none transition-colors hover:border-white/20"
                            value={profile.education}
                            onChange={(event) => setProfile((prev) => ({ ...prev, education: event.target.value }))}
                          >
                            <option>Post-12th</option>
                            <option>Diploma</option>
                            <option>Undergraduate</option>
                            <option>Postgraduate</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/70">Current Year Semester</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-white/30 pointer-events-none" />
                          <select
                            className="h-10 w-full rounded-xl border border-white/10 bg-[#0a0a0a] pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none transition-colors hover:border-white/20"
                            value={profile.year}
                            onChange={(event) => setProfile((prev) => ({ ...prev, year: event.target.value }))}
                          >
                            <option>1st Year</option>
                            <option>2nd Year</option>
                            <option>3rd Year</option>
                            <option>Final Year</option>
                            <option>Graduate</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                         <Sparkles className="w-4 h-4 text-amber-400" />
                         Technical & Soft Skills
                      </label>
                      <p className="text-xs text-white/40 mb-2">Separate skills with commas (e.g., Python, React, Public Speaking)</p>
                      <Input
                        className="bg-white/[0.03] border-white/10 text-white focus-visible:ring-indigo-500/50"
                        value={skillsInput}
                        onChange={(event) => setSkillsInput(event.target.value)}
                        placeholder="e.g. Python, UI/UX Design, Agile"
                      />
                      <div className="mt-4 flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                        {skillsInput
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 px-3 py-1 font-medium">
                              {skill}
                            </Badge>
                          ))}
                        {skillsInput.trim() === "" && <span className="text-sm text-white/30 italic m-auto">No skills added yet</span>}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                       <div className="flex-1 pr-4">
                          {message && <FeedbackBanner message={message} tone="success" className="py-2" />}
                          {error && <FeedbackBanner message={error} tone="error" className="py-2" />}
                       </div>
                       <Button type="submit" variant="premium" className="px-6 flex items-center gap-2">
                          <Send className="w-4 h-4" /> Save Profile
                       </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </SlideUp>

            <SlideUp delay={0.3}>
              <NextStepCard
                currentStep="Profile"
                nextStep="Go to Dashboard"
                nextHref="/dashboard"
                helperText="Return to dashboard to continue your guided career workflow."
              />
            </SlideUp>
         </div>
      </div>
    </div>
  );
}
