"use client";

import { CheckCircle2, XCircle, Lightbulb, TrendingUp, Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedLoader } from "@/components/animated-loader";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import { ResumeAnalysis } from "@/types";

interface Props {
  analysis: ResumeAnalysis | null;
  loading: boolean;
}

function CircularScore({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color =
    score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{score}%</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Match</span>
      </div>
    </div>
  );
}

export default function AnalysisResult({ analysis, loading }: Props) {
  if (loading) {
    return (
      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass min-h-[500px] flex items-center justify-center">
        <AnimatedLoader text="Analysing your resume..." />
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-dashed border-white/10 bg-white/[0.01] min-h-[500px] flex items-center justify-center">
        <div className="p-12 text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Analysis Yet</h3>
          <p className="text-white/40 leading-relaxed text-sm">
            Upload a PDF resume on the left to see your skill match score, extracted skills, and improvement suggestions.
          </p>
        </div>
      </Card>
    );
  }

  const matchedSkills = analysis.extractedSkills;
  const missingAreas = analysis.improvementAreas;

  return (
    <div className="flex flex-col gap-6">
      {/* Score Card */}
      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-emerald-500/5 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CircularScore score={analysis.matchScore} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Compatibility Score</p>
              <p className="text-lg font-black text-white">
                {analysis.matchScore >= 75
                  ? "Strong Match 🎯"
                  : analysis.matchScore >= 50
                  ? "Moderate Match ⚡"
                  : "Needs Improvement 📈"}
              </p>
              <p className="text-sm text-white/50 mt-1">
                {analysis.jobDescription
                  ? "Based on your resume vs. provided job description"
                  : "General skills extraction (no JD provided)"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Skills */}
      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Detected Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 text-sm"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1.5 inline" />
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 italic">No common skills detected. Try adding more specific technical terms to your resume.</p>
          )}
        </CardContent>
      </Card>

      {/* Missing / Improvement Areas */}
      {missingAreas.length > 0 && (
        <Card className="border-rose-500/20 bg-rose-500/[0.02]">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              Gap Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {missingAreas.map((area, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1 text-sm"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/[0.02]">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <StaggerChildren staggerDelay={0.08} className="space-y-3">
              {analysis.suggestions.map((suggestion, i) => (
                <StaggerItem key={i}>
                  <div className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed">{suggestion}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
