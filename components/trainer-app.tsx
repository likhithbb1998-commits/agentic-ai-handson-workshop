"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Award,
  Bot,
  BookOpen,
  Braces,
  ChevronRight,
  CirclePlay,
  Clock3,
  Download,
  Gift,
  MessageSquare,
  Radio,
  Search,
  Send,
  Star,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useWorkshop } from "@/components/workshop-provider";
import { Leaderboard, LivePill, LoadingScreen, PortalNav } from "@/components/shared";
import { TheoryPanel } from "@/components/theory";
import { LiveCode } from "@/components/live-code";
import { AgentSimulator } from "@/components/simulator";
import { ChallengeActivity, PollActivity, QuizActivity } from "@/components/activity";
import type { Feedback, Student } from "@/lib/types";
import {
  calculatePerformanceScore,
  exportFeedbackCSV,
  exportLeaderboardCSV,
  exportPerformanceCSV,
} from "@/lib/export-utils";

export function TrainerApp() {
  const pathname = usePathname();
  const { snapshot, loading, connected, error, act, runCode } = useWorkshop();

  if (loading || !snapshot) return <LoadingScreen />;

  const lesson = snapshot.lessons.find((item) => item.id === snapshot.session.lessonId) || snapshot.lessons[0];
  const quiz = snapshot.quizzes.find((item) => item.id === snapshot.session.activeQuizId);
  const poll = snapshot.polls.find((item) => item.id === snapshot.session.activePollId);
  const challenge = snapshot.challenges.find((item) => item.id === snapshot.session.activeChallengeId);

  let content: React.ReactNode;
  if (pathname === "/trainer/live")
    content = (
      <LiveTeaching
        snapshot={snapshot}
        lesson={lesson}
        quiz={quiz}
        poll={poll}
        challenge={challenge}
        act={act}
        runCode={runCode}
      />
    );
  else if (pathname === "/trainer/students") content = <StudentManagement students={snapshot.students} act={act} />;
  else if (pathname === "/trainer/feedback")
    content = <StudentFeedbackView feedbacks={snapshot.feedbacks || []} students={snapshot.students} />;
  else if (pathname === "/trainer/content") content = <ContentLibrary snapshot={snapshot} act={act} />;
  else if (pathname === "/trainer/leaderboard")
    content = <RewardManagement students={snapshot.students} rewards={snapshot.rewards} act={act} />;
  else content = <TrainerDashboard snapshot={snapshot} act={act} />;

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <PortalNav role="trainer" />
      <main className="p-4 md:p-7 lg:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">LiuantX trainer control</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {pathname === "/trainer"
                ? "Workshop control room"
                : pathname.split("/").pop()?.replaceAll("-", " ")}
            </h1>
          </div>
          <div className="flex gap-2">
            <LivePill connected={connected} isLive={snapshot.session.isLive} />
            <span className="metric-pill">
              <Users size={15} />
              {snapshot.students.length} students
            </span>
          </div>
        </header>
        {error && <div className="mb-5 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
        {content}
      </main>
    </div>
  );
}

type Act = (payload: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>;
type RunCode = (
  code: string
) => Promise<{ stdout?: string; stderr?: string; status?: string; durationMs?: number; error?: string }>;

function TrainerDashboard({
  snapshot,
  act,
}: {
  snapshot: NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>;
  act: Act;
}) {
  const lesson = snapshot.lessons.find((item) => item.id === snapshot.session.lessonId)!;
  const activities = [
    { id: "theory", label: "Theory", icon: BookOpen },
    { id: "code", label: "Live code", icon: Braces },
    { id: "simulator", label: "Simulator", icon: Radio },
    { id: "quiz", label: "Quiz", icon: Trophy },
    { id: "poll", label: "Poll", icon: Users },
    { id: "challenge", label: "Challenge", icon: Award },
  ];
  const stats: { label: string; value: string | number; icon: LucideIcon }[] = [
    { label: "Responses", value: snapshot.session.quizAnswers.length + snapshot.session.pollAnswers.length, icon: Users },
    { label: "Challenges", value: snapshot.session.challengeAnswers.length, icon: Award },
    { label: "Code line", value: snapshot.session.codeStep, icon: Braces },
    { label: "Activity", value: snapshot.session.activity, icon: Radio },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950 p-7 text-white shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[.16em] text-blue-300">
                Current lesson · {lesson.order}/13
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">{lesson.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{lesson.summary}</p>
            </div>
            <button
              onClick={() => act({ action: "START_SESSION" })}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black shadow-lg ${
                snapshot.session.isLive ? "bg-rose-500 text-white" : "bg-white text-blue-700"
              }`}
            >
              <CirclePlay size={18} />
              {snapshot.session.isLive ? "Pause session" : "Start live session"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="eyebrow">Current activity</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">Choose what students see</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {activities.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => act({ action: "SET_ACTIVITY", activity: id })}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-black transition ${
                  snapshot.session.activity === id
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-blue-200"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
          <a href="/trainer/live" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600">
            Open live teaching console <ChevronRight size={16} />
          </a>
        </section>
      </div>

      <div className="space-y-5">
        <AiModelCard />
        <Leaderboard students={snapshot.students} />
        <section className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Icon size={18} className="text-blue-600" />
              <p className="mt-5 text-xl font-black capitalize text-slate-900">{String(value)}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function LiveTeaching({
  snapshot,
  lesson,
  quiz,
  poll,
  challenge,
  act,
  runCode,
}: {
  snapshot: NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>;
  lesson: NonNullable<NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>["lessons"][number]>;
  quiz: NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>["quizzes"][number] | undefined;
  poll: NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>["polls"][number] | undefined;
  challenge: NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>["challenges"][number] | undefined;
  act: Act;
  runCode: RunCode;
}) {
  const lessonQuiz = snapshot.quizzes.find((item) => item.lessonId === lesson.id) || snapshot.quizzes[0];
  const lessonPoll = snapshot.polls.find((item) => item.lessonId === lesson.id) || snapshot.polls[0];
  const lessonChallenge = snapshot.challenges.find((item) => item.lessonId === lesson.id) || snapshot.challenges[0];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["theory", "code", "simulator", "quiz", "poll", "challenge", "leaderboard"].map((activity) => (
            <button
              key={activity}
              onClick={() => act({ action: "SET_ACTIVITY", activity })}
              className={`rounded-full px-4 py-2 text-xs font-black capitalize ${
                snapshot.session.activity === activity
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {activity}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => act({ action: "START_QUIZ", quizId: lessonQuiz.id })} className="secondary-button">
            <Clock3 size={15} />
            Start quiz
          </button>
          <button onClick={() => act({ action: "START_POLL", pollId: lessonPoll.id })} className="secondary-button">
            <Users size={15} />
            Start poll
          </button>
          <button
            onClick={() => act({ action: "START_CHALLENGE", challengeId: lessonChallenge.id })}
            className="primary-button"
          >
            <Award size={15} />
            Start challenge
          </button>
        </div>
      </div>
      {snapshot.session.activity === "theory" && <TheoryPanel lesson={lesson} />}
      {snapshot.session.activity === "code" && (
        <LiveCode
          trainer
          steps={snapshot.codeSteps}
          session={snapshot.session}
          onStep={(step) => {
            void act({ action: "SET_STEP", step });
          }}
          onRun={runCode}
          onCodeChange={(code) => {
            void fetch("/api/workshop", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "UPDATE_LIVE_CODE", code }),
            });
          }}
        />
      )}
      {snapshot.session.activity === "simulator" && <AgentSimulator />}
      {snapshot.session.activity === "quiz" && (
        <QuizActivity trainer quiz={quiz} session={snapshot.session} onNext={() => act({ action: "NEXT_QUIZ_QUESTION" })} />
      )}
      {snapshot.session.activity === "poll" && <PollActivity trainer poll={poll} session={snapshot.session} />}
      {snapshot.session.activity === "challenge" && (
        <ChallengeActivity trainer challenge={challenge} session={snapshot.session} />
      )}
      {snapshot.session.activity === "leaderboard" && (
        <Leaderboard students={snapshot.students} limit={Math.max(5, snapshot.students.length)} />
      )}
      {snapshot.session.winnerMessage && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm rounded-2xl bg-slate-950 p-5 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-400 text-slate-950">
              <Trophy size={19} />
            </span>
            <div>
              <p className="text-sm font-black">{snapshot.session.winnerMessage}</p>
              <p className="mt-1 text-xs text-slate-400">Leaderboard updated live</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AiModelCard() {
  const [prompt, setPrompt] = useState("Explain the current multi-agent concept in one classroom-friendly example.");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    setBusy(true);
    setResult("");
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json().catch(() => ({}));
    setResult(response.ok ? `${data.text}\n\nModel: ${data.model}` : data.error || "Model connection failed.");
    setBusy(false);
  }

  return (
    <section className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700">
          <Bot size={19} />
        </span>
        <div>
          <p className="eyebrow">Trainer only</p>
          <h2 className="font-black text-slate-900">OpenRouter model</h2>
        </div>
      </div>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="mt-4 min-h-24 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-violet-400"
      />
      <button onClick={ask} disabled={busy || prompt.trim().length < 2} className="primary-button mt-3 w-full">
        <Send size={15} />
        {busy ? "Connecting…" : "Ask model"}
      </button>
      {result && (
        <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-3 text-xs leading-5 text-slate-200">
          {result}
        </pre>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Server-side only. Students and projector never receive the API key or this panel.
      </p>
    </section>
  );
}

function StudentManagement({ students, act }: { students: Student[]; act: Act }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      students.filter((student) =>
        `${student.name} ${student.usn} ${student.email}`.toLowerCase().includes(query.toLowerCase())
      ),
    [students, query]
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
        <div>
          <p className="eyebrow">Student Management & Performance Matrix</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Student Directory & Calculated Scores</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search USN, name, Gmail"
              className="w-56 text-sm outline-none"
            />
          </label>
          <button
            onClick={() => exportPerformanceCSV(students)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-500 shadow-sm"
          >
            <Download size={15} />
            Export Performance (CSV)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              {[
                "Rank / Student",
                "USN",
                "Gmail",
                "Performance Score",
                "Coins / XP",
                "Quiz Score",
                "Challenges",
                "Simulators",
                "Participation",
                "Quick Award",
              ].map((heading) => (
                <th key={heading} className="px-5 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => {
              const score = calculatePerformanceScore(student);
              const scoreBadge =
                score >= 90
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : score >= 75
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : score >= 50
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-slate-100 text-slate-700 border-slate-300";

              return (
                <tr key={student.id} className="border-t border-slate-100 text-sm hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-800">
                      #{student.rank} · {student.name}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-600">{student.usn}</td>
                  <td className="px-5 py-4 text-slate-600">{student.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${scoreBadge}`}>
                      {score}% Performance
                    </span>
                  </td>
                  <td className="px-5 py-4 font-black text-amber-600">{student.coins}</td>
                  <td className="px-5 py-4 text-slate-600 font-semibold">{student.quizScore} / 13</td>
                  <td className="px-5 py-4 text-slate-600 font-semibold">{student.completedChallenges} / 3</td>
                  <td className="px-5 py-4 text-slate-600 font-semibold">{student.completedSimulatorIds?.length || 0}</td>
                  <td className="px-5 py-4 text-slate-600 font-semibold">{student.participation} pts</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => act({ action: "AWARD_COINS", studentId: student.id, amount: 25 })}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-black text-emerald-700 hover:bg-emerald-100"
                      >
                        +25
                      </button>
                      <button
                        onClick={() => act({ action: "AWARD_COINS", studentId: student.id, amount: -25 })}
                        className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-black text-rose-700 hover:bg-rose-100"
                      >
                        −25
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!filtered.length && <div className="p-12 text-center text-sm text-slate-400">No students match this view.</div>}
    </section>
  );
}

function StudentFeedbackView({ feedbacks, students }: { feedbacks: Feedback[]; students: Student[] }) {
  const [query, setQuery] = useState("");

  const avgRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const avgUnderstandability = useMemo(() => {
    if (!feedbacks.length) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.understandability, 0);
    return (sum / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const filtered = useMemo(
    () =>
      feedbacks.filter((fb) =>
        `${fb.studentName} ${fb.usn} ${fb.email} ${fb.comments} ${fb.favoriteLesson}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [feedbacks, query]
  );

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="eyebrow">Student Feedback Dashboard</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Workshop Reviews & Ratings</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-center">
            <p className="text-[10px] font-black uppercase text-amber-700">Average Rating</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-2xl font-black text-amber-900">
              <Star size={20} className="fill-amber-400 text-amber-400" />
              {avgRating} / 5
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-center">
            <p className="text-[10px] font-black uppercase text-blue-700">Understandability</p>
            <p className="mt-1 text-2xl font-black text-blue-900">{avgUnderstandability} / 5</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-center">
            <p className="text-[10px] font-black uppercase text-emerald-700">Total Submitted</p>
            <p className="mt-1 text-2xl font-black text-emerald-900">{feedbacks.length}</p>
          </div>

          <button
            onClick={() => exportFeedbackCSV(feedbacks)}
            disabled={!feedbacks.length}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white hover:bg-blue-500 shadow-sm disabled:opacity-50"
          >
            <Download size={16} />
            Export Feedback (CSV)
          </button>
        </div>
      </div>

      {/* Feedbacks Grid */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-900">All Submitted Student Feedback</h3>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search feedback comments, USN..."
              className="w-64 text-sm outline-none"
            />
          </label>
        </div>

        {filtered.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-slate-900">{fb.studentName}</h4>
                    <p className="text-xs font-semibold text-slate-500">
                      {fb.usn} · {fb.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                    <Star size={16} className="fill-amber-400" />
                    <span>{fb.rating}.0</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-800">
                    Favorite: {fb.favoriteLesson}
                  </span>
                  <span className="rounded-full bg-violet-100 px-3 py-1 font-bold text-violet-800">
                    Understandability: {fb.understandability}/5
                  </span>
                </div>

                {fb.comments && (
                  <p className="text-xs leading-6 text-slate-700 italic border-l-2 border-slate-300 pl-3">
                    "{fb.comments}"
                  </p>
                )}

                <p className="text-[10px] text-slate-400">Submitted at: {new Date(fb.submittedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <MessageSquare className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="font-bold text-slate-600">No student feedback submitted yet.</p>
            <p className="text-xs text-slate-400 mt-1">Students can submit feedback directly from their student portal.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ContentLibrary({
  snapshot,
  act,
}: {
  snapshot: NonNullable<ReturnType<typeof useWorkshop>["snapshot"]>;
  act: Act;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {snapshot.lessons.map((lesson) => {
        const codeCount = snapshot.codeSteps.filter((step) => step.lessonId === lesson.id).length;
        const activities =
          snapshot.quizzes.filter((item) => item.lessonId === lesson.id).length +
          snapshot.polls.filter((item) => item.lessonId === lesson.id).length +
          snapshot.challenges.filter((item) => item.lessonId === lesson.id).length;
        return (
          <button
            key={lesson.id}
            onClick={async () => {
              await act({ action: "SET_LESSON", lessonId: lesson.id });
              window.location.href = "/trainer/live";
            }}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              snapshot.session.lessonId === lesson.id ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">
                {lesson.order}
              </span>
              {snapshot.session.lessonId === lesson.id && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                  Active
                </span>
              )}
            </div>
            <h2 className="mt-6 text-lg font-black text-slate-900">{lesson.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{lesson.summary}</p>
            <div className="mt-5 flex gap-2">
              <span className="metric-pill">
                <Braces size={13} />
                {codeCount} lines
              </span>
              <span className="metric-pill">
                <CirclePlay size={13} />
                {activities} activities
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function RewardManagement({
  students,
  rewards,
  act,
}: {
  students: Student[];
  rewards: { rank: number; label: string }[];
  act: Act;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_.85fr]">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => exportLeaderboardCSV(students)}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-black text-white hover:bg-amber-500 shadow-sm"
          >
            <Download size={14} />
            Export Leaderboard (CSV)
          </button>
        </div>
        <Leaderboard students={students} limit={Math.max(5, students.length)} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Gift size={20} />
          </span>
          <div>
            <p className="eyebrow">Trainer confirmation</p>
            <h2 className="text-xl font-black text-slate-900">Top 5 rewards</h2>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {rewards.map((reward) => {
            const student = students[reward.rank - 1];
            return (
              <div key={reward.rank} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black">
                    #{reward.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-800">{student?.name || "Open position"}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{reward.label}</p>
                  </div>
                  {student && (
                    <button
                      onClick={() =>
                        act({
                          action: "MARK_REWARD",
                          studentId: student.id,
                          status: student.rewardStatus === "rewarded" ? "pending" : "rewarded",
                        })
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-black ${
                        student.rewardStatus === "rewarded" ? "bg-emerald-50 text-emerald-700" : "bg-blue-600 text-white"
                      }`}
                    >
                      {student.rewardStatus === "rewarded" ? "Rewarded" : "Mark given"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-500">
          No course is promised or issued automatically. Only this trainer action changes reward status.
        </p>
      </section>
    </div>
  );
}
