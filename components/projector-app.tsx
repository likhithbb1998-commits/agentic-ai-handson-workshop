"use client";

import { useEffect, useState } from "react";
import { Braces, Coins, Radio, Sparkles, Trophy, Users } from "lucide-react";
import { useWorkshop } from "@/components/workshop-provider";
import { AgentDiagram, TheoryPanel } from "@/components/theory";
import { LiveCode } from "@/components/live-code";
import { Leaderboard, LivePill, LoadingScreen } from "@/components/shared";
import { AgentSimulator } from "@/components/simulator";
import { ChallengeActivity, PollActivity, QuizActivity } from "@/components/activity";

export function ProjectorApp() {
  const { snapshot, loading, connected } = useWorkshop();
  if (loading || !snapshot) return <LoadingScreen />;
  const lesson = snapshot.lessons.find((item) => item.id === snapshot.session.lessonId) || snapshot.lessons[0];
  const quiz = snapshot.quizzes.find((item) => item.id === snapshot.session.activeQuizId);
  const poll = snapshot.polls.find((item) => item.id === snapshot.session.activePollId);
  const challenge = snapshot.challenges.find((item) => item.id === snapshot.session.activeChallengeId);
  let content: React.ReactNode = <TheoryPanel lesson={lesson} />;
  if (snapshot.session.activity === "code") content = <LiveCode steps={snapshot.codeSteps} session={snapshot.session} />;
  if (snapshot.session.activity === "simulator") content = <AgentSimulator />;
  if (snapshot.session.activity === "quiz") content = <QuizActivity quiz={quiz} session={snapshot.session} />;
  if (snapshot.session.activity === "poll") content = <PollActivity poll={poll} session={snapshot.session} />;
  if (snapshot.session.activity === "challenge") content = <ChallengeActivity trainer challenge={challenge} session={snapshot.session} />;
  if (snapshot.session.activity === "leaderboard") content = <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]"><Leaderboard students={snapshot.students} limit={10} /><AgentDiagram large /></div>;
  return <main className="min-h-screen bg-slate-50 p-6 md:p-8"><header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-blue-600 text-white"><Sparkles size={23} /></span><div><p className="text-xl font-black tracking-tight text-slate-950">LIUANTX LIVE WORKSHOP</p><p className="mt-0.5 text-xs font-bold uppercase tracking-[.16em] text-slate-400">Student projector · live trainer control</p></div></div><div className="flex items-center gap-3"><LivePill connected={connected} isLive={snapshot.session.isLive} /><span className="metric-pill"><Users size={15} />{snapshot.students.length}</span></div></header><section className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Lesson {lesson.order} · Current activity</p><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{lesson.title}</h1></div><span className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black capitalize text-white">{snapshot.session.activity === "code" ? <Braces size={18} /> : snapshot.session.activity === "leaderboard" ? <Trophy size={18} /> : <Radio size={18} />}{snapshot.session.activity}</span></section><div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><aside><div className="sticky top-6"><Leaderboard students={snapshot.students} limit={10} /></div></aside><section className="min-w-0">{content}</section></div><ProjectorCelebration celebration={snapshot.session.celebration} students={snapshot.students} /></main>;
}

function ProjectorCelebration({ celebration, students }: { celebration: NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>["session"]["celebration"]; students: NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>["students"] }) {
  const [now, setNow] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 200); return () => window.clearInterval(timer); }, []);
  if (!celebration) return null;
  const visible = now - new Date(celebration.createdAt).getTime() < 2000;
  if (!visible) return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/95 p-10"><div className="w-full max-w-3xl"><Leaderboard students={students} limit={10} /></div></div>;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-gradient-to-br from-blue-700 via-violet-700 to-slate-950 p-10 text-center text-white"><div><span className="mx-auto grid size-24 place-items-center rounded-full bg-amber-400 text-slate-950 shadow-2xl"><Trophy size={50} /></span><p className="mt-8 text-2xl font-black uppercase tracking-[.2em] text-blue-200">Congratulations</p><h2 className="mt-3 text-6xl font-black tracking-tight">{celebration.studentName}</h2><p className="mt-5 flex items-center justify-center gap-3 text-3xl font-black text-amber-300"><Coins size={30} />You earned {celebration.reward} coins!</p><p className="mt-5 text-lg font-semibold text-blue-100">The live leaderboard has been updated.</p></div></div>;
}
