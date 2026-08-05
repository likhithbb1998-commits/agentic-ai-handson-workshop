"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronDown, Coins, Gauge, LogOut, MessageSquare, Radio, Sparkles, Trophy, Users } from "lucide-react";
import type { Student } from "@/lib/types";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Sparkles size={20} /></span>{!compact && <div><p className="text-lg font-black tracking-tight text-slate-950">LIUANTX</p><p className="text-[9px] font-bold uppercase tracking-[.22em] text-slate-500">Live Workshop</p></div>}</Link>;
}

export function LivePill({ connected, isLive }: { connected: boolean; isLive: boolean }) {
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${isLive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}><span className={`size-2 rounded-full ${connected && isLive ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`} />{isLive ? "Session live" : "Session paused"}</span>;
}

export function Leaderboard({ students, currentId, limit = 5 }: { students: Student[]; currentId?: string; limit?: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2"><Trophy size={18} className="text-amber-500" /><h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Live leaderboard</h2></div><span className="text-xs font-semibold text-slate-400">Top {Math.min(limit, students.length || limit)}</span></div>
    <div className="space-y-2">{students.length ? students.slice(0, limit).map((student) => <div key={student.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${student.id === currentId ? "bg-blue-50 ring-1 ring-blue-200" : "bg-slate-50"}`}><span className={`grid size-7 place-items-center rounded-lg text-xs font-black ${student.rank === 1 ? "bg-amber-100 text-amber-700" : student.rank === 2 ? "bg-slate-200 text-slate-700" : student.rank === 3 ? "bg-orange-100 text-orange-700" : "text-slate-500"}`}>{student.rank}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{student.id === currentId ? `${student.name} (You)` : student.name}</p><p className="text-[10px] font-semibold text-slate-400">{student.usn}</p></div><span className="flex items-center gap-1 text-sm font-black text-amber-600">{student.coins}<Coins size={13} /></span></div>) : <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">Students appear here after joining.</div>}</div>
  </div>;
}

const studentLinks = [
  ["/student", "Live workshop", Radio],
  ["/student/feedback", "Workshop Feedback", MessageSquare],
] as const;

const trainerLinks = [
  ["/trainer", "Control room", Gauge],
  ["/trainer/live", "Live teaching", Radio],
  ["/trainer/students", "Students & Performance", Users],
  ["/trainer/feedback", "Student Feedback", MessageSquare],
  ["/trainer/content", "Content", BookOpen],
  ["/trainer/leaderboard", "Leaderboard", Trophy],
] as const;

export function PortalNav({ role, student }: { role: "student" | "trainer"; student?: Student }) {
  const pathname = usePathname(); const router = useRouter(); const links = role === "student" ? studentLinks : trainerLinks;
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push(role === "trainer" ? "/trainer/login" : "/student/login"); router.refresh(); }
  return <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col"><Brand /><div className="mt-10 flex-1 space-y-1">{links.map(([href, label, Icon]) => { const active = pathname === href; return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><Icon size={18} />{label}</Link>; })}</div>{student && <div className="mb-3 rounded-xl bg-slate-50 p-3"><p className="truncate text-sm font-black text-slate-800">{student.name}</p><p className="mt-1 text-xs text-slate-500">Rank #{student.rank} · {student.coins} coins</p></div>}<button onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600"><LogOut size={18} />Sign out</button></aside>
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden"><Brand compact /><p className="text-sm font-black text-slate-800">{role === "trainer" ? "Trainer" : student?.name || "Student"}</p><details className="relative"><summary className="list-none rounded-lg border border-slate-200 p-2 text-slate-600"><ChevronDown size={18} /></summary><div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">{links.map(([href, label]) => <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">{label}</Link>)}<button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50">Sign out</button></div></details></header>
  </>;
}

export function LoadingScreen() { return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="text-center"><span className="mx-auto mb-4 grid size-12 animate-pulse place-items-center rounded-2xl bg-blue-600 text-white"><Sparkles /></span><p className="text-sm font-bold text-slate-500">Preparing the live classroom…</p></div></div>; }
