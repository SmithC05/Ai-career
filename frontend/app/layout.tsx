import type { Metadata } from "next";

import "./globals.css";
import { AmbientBackground } from "@/components/ambient-background";
import { NavBar } from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "AI Career Navigator",
  description: "Explore careers, identify skill gaps, and generate AI-powered learning roadmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AmbientBackground />
        <NavBar />
        <main className="relative z-10 mx-auto w-full max-w-[1240px] px-4 pb-20 pt-28 sm:px-6 lg:px-10 lg:pt-32">
          {children}
        </main>
        <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-4 py-8 text-sm text-white/60 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p className="font-medium">AI Career Navigator</p>
            <p className="text-white/40">Build clarity. Close skill gaps. Ship your future role.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
