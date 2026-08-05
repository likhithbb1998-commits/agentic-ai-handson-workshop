"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Coins, MessageSquare, Radio, Send, Star, Trophy } from "lucide-react";
import { useWorkshop } from "@/components/workshop-provider";
import { Leaderboard, LivePill, LoadingScreen, PortalNav } from "@/components/shared";
import { TheoryPanel } from "@/components/theory";
import { LiveCode } from "@/components/live-code";
import { AgentSimulator } from "@/components/simulator";
import { ChallengeActivity, PollActivity, QuizActivity } from "@/components/activity";
import type { Lesson, Student } from "@/lib/types";

export function StudentApp() {
  const pathname = usePathname();
  const { snapshot, loading, connected, error, act, runCode } = useWorkshop();

  // Auto-scroll sync to match trainer scroll position live
  useEffect(() => {
    if (snapshot?.session?.scrollPosition !== undefined && snapshot.session.scrollPosition !== null) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const targetY = (snapshot.session.scrollPosition / 100) * scrollHeight;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }
  }, [snapshot?.session?.scrollPosition]);

  if (loading || !snapshot) return <LoadingScreen />;

  const student = snapshot.students.find((item) => item.id === snapshot.viewer.studentId);
  if (!student) return <LoadingScreen />;

  const lesson = snapshot.lessons.find((item) => item.id === snapshot.session.lessonId) || snapshot.lessons[0];
  const quiz = snapshot.quizzes.find((item) => item.id === snapshot.session.activeQuizId);
  const poll = snapshot.polls.find((item) => item.id === snapshot.session.activePollId);
  const challenge = snapshot.challenges.find((item) => item.id === snapshot.session.activeChallengeId);
  const activeMode = snapshot.session.activity;

  let content: React.ReactNode;

  if (pathname === "/student/feedback")
    content = <StudentFeedbackForm lessons={snapshot.lessons} act={act} existingFeedback={snapshot.feedbacks?.find((f) => f.studentId === student.id)} />;
  else if (pathname === "/student/code")
    content = activeMode === "code" ? <LiveCode steps={snapshot.codeSteps} session={snapshot.session} onRun={runCode} /> : <WaitingForTrainer activity="live coding" />;
  else if (pathname === "/student/simulator")
    content = activeMode === "simulator" ? (
      <AgentSimulator
        completed={student.completedSimulatorIds.includes(lesson.id)}
        onComplete={async () => {
          await act({ action: "COMPLETE_SIMULATOR", lessonId: lesson.id });
        }}
      />
    ) : (
      <WaitingForTrainer activity="simulator" />
    );
  else if (pathname === "/student/quiz")
    content = activeMode === "quiz" && quiz ? (
      <QuizActivity quiz={quiz} session={snapshot.session} student={student} onAnswer={(answer) => act({ action: "ANSWER_QUIZ", answer })} />
    ) : (
      <WaitingForTrainer activity="quiz" />
    );
  else if (pathname === "/student/poll")
    content = activeMode === "poll" && poll ? (
      <PollActivity poll={poll} session={snapshot.session} student={student} onAnswer={(answer) => act({ action: "ANSWER_POLL", answer })} />
    ) : (
      <WaitingForTrainer activity="poll" />
    );
  else if (pathname === "/student/challenges")
    content = activeMode === "challenge" && challenge ? (
      <ChallengeActivity
        challenge={challenge}
        session={snapshot.session}
        student={student}
        onRun={runCode}
        onSubmit={(code) => act({ action: "COMPLETE_CHALLENGE", challengeId: challenge.id, code })}
      />
    ) : (
      <WaitingForTrainer activity="challenge" />
    );
  else if (pathname === "/student/leaderboard")
    content = <Leaderboard students={snapshot.students} currentId={student.id} limit={Math.max(5, snapshot.students.length)} />;
  else if (pathname === "/student/lesson")
    content = activeMode === "theory" ? <TheoryPanel lesson={lesson} /> : <WaitingForTrainer activity="theory" />;
  else if (activeMode === "code") content = <LiveCode steps={snapshot.codeSteps} session={snapshot.session} onRun={runCode} />;
  else if (activeMode === "simulator")
    content = (
      <AgentSimulator
        completed={student.completedSimulatorIds.includes(lesson.id)}
        onComplete={async () => {
          await act({ action: "COMPLETE_SIMULATOR", lessonId: lesson.id });
        }}
      />
    );
  else if (activeMode === "quiz")
    content = <QuizActivity quiz={quiz} session={snapshot.session} student={student} onAnswer={(answer) => act({ action: "ANSWER_QUIZ", answer })} />;
  else if (activeMode === "poll")
    content = <PollActivity poll={poll} session={snapshot.session} student={student} onAnswer={(answer) => act({ action: "ANSWER_POLL", answer })} />;
  else if (activeMode === "challenge")
    content = (
      <ChallengeActivity
        challenge={challenge}
        session={snapshot.session}
        student={student}
        onRun={runCode}
        onSubmit={(code) => act({ action: "COMPLETE_CHALLENGE", challengeId: challenge?.id || "", code })}
      />
    );
  else if (activeMode === "leaderboard")
    content = <Leaderboard students={snapshot.students} currentId={student.id} limit={Math.max(5, snapshot.students.length)} />;
  else content = <TheoryPanel lesson={lesson} />;

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <PortalNav role="student" student={student} />
      <main className="p-4 md:p-6 lg:p-7">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Live workshop · Lesson {lesson.order} of 13</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{lesson.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LivePill connected={connected} isLive={snapshot.session.isLive} />
            <span className="metric-pill text-amber-700">
              <Coins size={15} />
              {student.coins} coins
            </span>
            <span className="metric-pill">
              <Trophy size={15} />
              Rank #{student.rank}
            </span>
          </div>
        </header>
        {error && <div className="mb-5 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">{content}</div>
          <aside className="hidden lg:block">
            <div className="sticky top-7">
              <Leaderboard students={snapshot.students} currentId={student.id} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StudentFeedbackForm({
  lessons,
  act,
  existingFeedback,
}: {
  lessons: Lesson[];
  act: (payload: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>;
  existingFeedback?: { rating: number; favoriteLesson: string; understandability: number; comments: string };
}) {
  const [rating, setRating] = useState(existingFeedback?.rating || 5);
  const [favoriteLesson, setFavoriteLesson] = useState(existingFeedback?.favoriteLesson || lessons[0]?.title || "Lesson 01");
  const [understandability, setUnderstandability] = useState(existingFeedback?.understandability || 5);
  const [comments, setComments] = useState(existingFeedback?.comments || "");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(Boolean(existingFeedback));
  const [msg, setMsg] = useState("");

  async function submit() {
    setBusy(true);
    setMsg("");
    const res = await act({
      action: "SUBMIT_FEEDBACK",
      rating,
      favoriteLesson,
      understandability,
      comments,
    });
    setBusy(false);
    if (res.ok) {
      setSubmitted(true);
      setMsg("🎉 Thank you! Your feedback has been recorded and +50 bonus coins awarded!");
    } else {
      setMsg(res.error || "Failed to submit feedback.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <MessageSquare size={22} />
        </span>
        <div>
          <p className="eyebrow">Workshop Feedback</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Share Your Workshop Experience</h2>
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-xl p-4 text-sm font-bold flex items-center gap-2 ${
            submitted ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {submitted && <CheckCircle2 size={18} className="text-emerald-600" />}
          <span>{msg}</span>
        </div>
      )}

      {submitted ? (
        <div className="rounded-2xl bg-emerald-50/50 border border-emerald-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-black">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span>Feedback Submitted</span>
          </div>
          <p className="text-sm leading-6 text-slate-700">
            Thank you for rating the workshop! Your response helps improve the AI agent curriculum.
          </p>
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-bold text-slate-600">
            <span className="rounded-full bg-white px-3 py-1 border border-slate-200">Overall Rating: {rating}/5 Stars</span>
            <span className="rounded-full bg-white px-3 py-1 border border-slate-200">Favorite: {favoriteLesson}</span>
            <span className="rounded-full bg-white px-3 py-1 border border-slate-200">Clarity: {understandability}/5 Stars</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-xl">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">Overall Workshop Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl border transition ${
                    star <= rating ? "bg-amber-50 border-amber-300 text-amber-500" : "bg-slate-50 border-slate-200 text-slate-300"
                  }`}
                >
                  <Star size={24} className={star <= rating ? "fill-amber-400" : ""} />
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Lesson */}
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">Which lesson was most valuable?</label>
            <select
              value={favoriteLesson}
              onChange={(e) => setFavoriteLesson(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 bg-white"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.title}>
                  Lesson {l.order}: {l.title}
                </option>
              ))}
            </select>
          </div>

          {/* Understandability */}
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">How clear and understandable were the concepts?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setUnderstandability(score)}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition ${
                    score === understandability
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-200"
                  }`}
                >
                  {score === 1 ? "1 - Complex" : score === 5 ? "5 - Very Clear" : score}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">Comments or Suggestions (Optional)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What did you enjoy most? What would make this workshop even better?"
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white hover:bg-blue-500 shadow-md disabled:opacity-50"
          >
            <Send size={16} />
            {busy ? "Submitting..." : "Submit Feedback & Claim 50 Coins"}
          </button>
        </div>
      )}
    </div>
  );
}

function WaitingForTrainer({ activity }: { activity: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
      <Radio className="mx-auto animate-pulse text-blue-500" size={32} />
      <h2 className="mt-4 text-xl font-black text-slate-900">Waiting for the trainer</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        The {activity} opens here only when the trainer starts it for the classroom.
      </p>
    </div>
  );
}
