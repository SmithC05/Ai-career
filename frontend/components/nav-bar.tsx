"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearToken, isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";

const authedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/careers", label: "Careers" },
  { href: "/skill-analyzer", label: "Skill Gap" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/advisor", label: "AI Advisor" },
];

const publicLinks = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#features", label: "Features" },
  { href: "/#cta", label: "Get Started" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = authed ? authedLinks : publicLinks;

  const logout = () => {
    clearToken();
    setAuthed(false);
    setMenuOpen(false);
    router.push("/login");
  };

  const activePath = useMemo(() => {
    if (!authed) {
      return pathname === "/" ? "/#how-it-works" : "";
    }
    return links.find((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))?.href || "";
  }, [authed, links, pathname]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto mx-auto w-full max-w-[1240px]"
      >
        <div className="glass-panel flex items-center justify-between gap-4 rounded-2xl px-3 py-2.5 sm:px-4">
          <Link href="/" className="group flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200/40 bg-cyan-200/15 text-sm font-black text-cyan-100">
              AC
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-sm font-black tracking-[0.04em] text-white">AI CAREER NAVIGATOR</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Future-ready pathing</p>
            </div>
          </Link>

          <nav className="relative mx-2 hidden flex-1 items-center justify-center md:flex" onMouseLeave={() => setHoveredPath(null)}>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
              {links.map((link) => {
                const isActive = activePath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredPath(link.href)}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive ? "text-slate-950" : "text-white/70 hover:text-white"
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="desktop-active-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-200"
                        transition={{ type: "spring", stiffness: 360, damping: 28 }}
                      />
                    ) : null}
                    {!isActive && hoveredPath === link.href ? (
                      <motion.span
                        layoutId="desktop-hover-pill"
                        className="absolute inset-0 rounded-full bg-white/10"
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      />
                    ) : null}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!authed ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="h-10 rounded-full px-5">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="premium" className="h-10 rounded-full px-5">
                    Start Free
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile">
                  <Button variant="secondary" className="h-10 rounded-full px-5">
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={logout}
                  className="h-10 w-10 rounded-full"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel mt-2 overflow-hidden rounded-2xl md:hidden"
            >
              <div className="space-y-1 p-3">
                {links.map((link) => {
                  const isActive = activePath === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-200 text-slate-900"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-white/10 p-3">
                {!authed ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login">
                      <Button variant="secondary" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="premium" className="w-full">
                        Start Free
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/profile">
                      <Button variant="secondary" className="w-full">
                        Profile
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={logout}>
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
