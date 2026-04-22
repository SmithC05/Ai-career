"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/feedback-banner";
import { api } from "@/lib/api";
import { ResumeAnalysis } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  onLoading: (loading: boolean) => void;
  onResult: (result: ResumeAnalysis) => void;
}

export default function ResumeUpload({ onLoading, onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    setError(null);
    setIsLoading(true);
    onLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim());
      }
      const result = await api.analyseResume(formData);
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-glass">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none rounded-lg" />
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-xl flex items-center gap-2 text-white">
          <Upload className="w-5 h-5 text-violet-400" />
          Upload Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 relative z-10">

        {/* Drop Zone */}
        <div
          id="resume-drop-zone"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !file && fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
            isDragging
              ? "border-violet-500/60 bg-violet-500/10"
              : file
              ? "border-emerald-500/40 bg-emerald-500/5 cursor-default"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          )}
        >
          {file ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-white">{file.name}</p>
                <p className="text-xs text-white/40 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-white/30" />
              </div>
              <div>
                <p className="font-semibold text-white/80">
                  Drag &amp; drop your PDF here
                </p>
                <p className="text-sm text-white/40 mt-1">or click to browse</p>
                <p className="text-xs text-white/25 mt-2">PDF only · max 10 MB</p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={onFileChange}
            className="hidden"
            id="resume-file-input"
            aria-label="Resume PDF upload"
          />
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1">
            Job Description <span className="text-white/30 normal-case font-normal">(optional — improves match score)</span>
          </label>
          <textarea
            id="resume-jd-textarea"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to get a compatibility score..."
            rows={6}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 resize-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none transition-all"
          />
        </div>

        {error && <FeedbackBanner message={error} tone="error" />}

        <Button
          id="resume-analyse-btn"
          onClick={handleSubmit}
          disabled={isLoading || !file}
          variant="premium"
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-500 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Analysing Resume...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Analyse Resume
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
