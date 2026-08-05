"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, Code2, Coins, Send, Trophy, X } from "lucide-react";
import type { Challenge, Poll, Quiz, Student, WorkshopSession } from "@/lib/types";

export function QuizActivity({ quiz, session, student, trainer, onAnswer, onNext }: { quiz?: Quiz; session: WorkshopSession; student?: Student; trainer?: boolean; onAnswer?: (answer: number) => Promise<{ ok: boolean; error?: string }>; onNext?: () => Promise<{ ok: boolean; error?: string }> }) {
  const questionIndex = session.quizQuestionIndex;
  const question = quiz?.questions[questionIndex];
  const questionKey = `${quiz?.id || "none"}:${questionIndex}`;
  const [selection, setSelection] = useState<{ key: string; answer: number | null }>({ key: questionKey, answer: null });
  const [message, setMessage] = useState(""); const remaining = useTimer(session.timerEndsAt);
  const selected = selection.key === questionKey ? selection.answer : null;
  const record = student ? session.quizAnswers.find((answer) => answer.studentId === student.id && answer.questionIndex === questionIndex) : undefined;
  if (!quiz) return <ActivityWaiting type="quiz" />;
  if (!question) return <ActivityWaiting type="quiz question" />;
  async function submit() { if (selected === null || !onAnswer) return; const result = await onAnswer(selected); if (!result.ok) setMessage(result.error || "Could not submit."); }
  const currentAnswers = session.quizAnswers.filter((answer) => answer.questionIndex === questionIndex);
  const correctCount = currentAnswers.filter((answer) => answer.correct).length;
  return <ActivityFrame eyebrow={`${quiz.title} · Question ${questionIndex + 1} of ${quiz.questions.length}`} title={question.question} timer={remaining} answered={currentAnswers.length}>
    <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${((questionIndex + 1) / quiz.questions.length) * 100}%` }} /></div>
    <div className="grid gap-3 md:grid-cols-2">{question.options.map((option, index) => { const chosen = record ? record.answer === index : selected === index; const reveal = Boolean(record) || Boolean(trainer); return <button key={option} disabled={Boolean(record) || trainer} onClick={() => setSelection({ key: questionKey, answer: index })} className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-bold transition ${reveal && index === question.correctAnswer ? "border-emerald-300 bg-emerald-50 text-emerald-800" : reveal && chosen ? "border-rose-300 bg-rose-50 text-rose-700" : chosen ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"}`}><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs">{String.fromCharCode(65 + index)}</span>{option}{reveal && index === question.correctAnswer && <Check className="ml-auto" size={17} />}{reveal && chosen && index !== question.correctAnswer && <X className="ml-auto" size={17} />}</button>; })}</div>
    {!trainer && !record && <button onClick={submit} disabled={selected === null || remaining === 0} className="primary-button mt-5"><Send size={15} />Lock answer</button>}
    {record && <><ResultBanner good={record.correct || false} text={record.correct ? `Correct! +${record.reward} coins` : `Not this time. The correct answer is ${String.fromCharCode(65 + question.correctAnswer)}.`} /><p className="mt-3 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">{question.explanation}</p></>}
    {trainer && <><div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Trainer answer key</p><p className="mt-1 text-sm font-bold text-emerald-900">{String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}</p><p className="mt-2 text-sm leading-6 text-emerald-800">{question.explanation}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Stat label="Responses" value={currentAnswers.length} /><Stat label="Correct" value={correctCount} /><Stat label="Accuracy" value={`${currentAnswers.length ? Math.round(correctCount / currentAnswers.length * 100) : 0}%`} /></div>{onNext && <button onClick={async () => { const result = await onNext(); if (!result.ok) setMessage(result.error || "Could not continue."); }} disabled={questionIndex >= quiz.questions.length - 1} className="primary-button mt-4">{questionIndex >= quiz.questions.length - 1 ? "Quiz complete" : "Next question"}</button>}</>}
    {message && <p className="mt-4 text-sm font-bold text-rose-600">{message}</p>}
  </ActivityFrame>;
}

export function PollActivity({ poll, session, student, trainer, onAnswer }: { poll?: Poll; session: WorkshopSession; student?: Student; trainer?: boolean; onAnswer?: (answer: number) => Promise<{ ok: boolean; error?: string }> }) {
  const record = student ? session.pollAnswers.find((answer) => answer.studentId === student.id) : undefined; const [message, setMessage] = useState("");
  if (!poll) return <ActivityWaiting type="poll" />;
  const total = session.pollAnswers.length;
  async function vote(answer: number) { if (!onAnswer) return; const result = await onAnswer(answer); if (!result.ok) setMessage(result.error || "Could not vote."); }
  return <ActivityFrame eyebrow="Live opinion poll" title={poll.question} answered={total}>
    <div className="space-y-3">{poll.options.map((option, index) => { const count = session.pollAnswers.filter((answer) => answer.answer === index).length; const percentage = total ? Math.round(count / total * 100) : 0; return <button key={option} disabled={Boolean(record) || trainer} onClick={() => vote(index)} className={`relative w-full overflow-hidden rounded-xl border p-4 text-left ${record?.answer === index ? "border-violet-400" : "border-slate-200"}`}><span className="absolute inset-y-0 left-0 bg-violet-50 transition-all" style={{ width: `${percentage}%` }} /><span className="relative flex items-center justify-between gap-3 text-sm font-bold text-slate-700"><span>{option}</span><span className="text-violet-700">{percentage}%</span></span></button>; })}</div>
    {record && <ResultBanner good text={`Vote recorded. +${record.reward} participation coins`} />}{trainer && poll.correctAnswer !== undefined && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Trainer answer key</p><p className="mt-1 text-sm font-bold text-emerald-900">{String.fromCharCode(65 + poll.correctAnswer)}. {poll.options[poll.correctAnswer]}</p><p className="mt-2 text-sm leading-6 text-emerald-800">{poll.explanation}</p></div>}{message && <p className="mt-4 text-sm font-bold text-rose-600">{message}</p>}
  </ActivityFrame>;
}

export function ChallengeActivity({ challenge, session, student, trainer, onSubmit, onRun }: { challenge?: Challenge; session: WorkshopSession; student?: Student; trainer?: boolean; onSubmit?: (code: string) => Promise<{ ok: boolean; error?: string }>; onRun?: (code: string) => Promise<{ stdout?: string; stderr?: string; status?: string; error?: string }> }) {
  const [editor, setEditor] = useState({ challengeId: challenge?.id || "", code: challenge?.starterCode || "" }); const [message, setMessage] = useState(""); const [output, setOutput] = useState(""); const remaining = useTimer(session.timerEndsAt);
  const code = editor.challengeId === challenge?.id ? editor.code : challenge?.starterCode || "";
  const completed = student ? student.completedChallengeIds.includes(challenge?.id || "") : false;
  if (!challenge) return <ActivityWaiting type="challenge" />;
  async function submit() { if (!onSubmit) return; setMessage("Checking your code against hidden tests…"); const result = await onSubmit(code); setMessage(result.ok ? "Challenge complete—every hidden test passed and your coins are on the leaderboard." : result.error || "Try again."); }
  async function run() { if (!onRun) return; const result = await onRun(code); setOutput(result.error || result.stderr || result.stdout || "Code completed with no output."); }
  return <ActivityFrame eyebrow={`${challenge.type} challenge`} title={challenge.title} timer={remaining} answered={session.challengeAnswers.length}>
    <p className="mb-4 text-sm leading-6 text-slate-600">{challenge.prompt}</p><textarea value={code} onChange={(event) => setEditor({ challengeId: challenge.id, code: event.target.value })} disabled={trainer || completed} spellCheck={false} className="min-h-56 w-full resize-y rounded-xl bg-slate-950 p-4 font-mono text-sm leading-7 text-slate-200 outline-none ring-blue-500 focus:ring-2" aria-label="Challenge Python code" />
    {!trainer && <div className="mt-4 flex gap-2"><button onClick={run} className="secondary-button"><Code2 size={15} />Run safely</button><button onClick={submit} disabled={completed || remaining === 0} className="primary-button"><Trophy size={15} />{completed ? "Completed" : "Submit challenge"}</button></div>}
    {output && <pre className="mt-4 max-h-36 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-300">{output}</pre>}{message && <ResultBanner good={message.startsWith("Challenge complete")} text={message} />}
  </ActivityFrame>;
}

function ActivityFrame({ eyebrow, title, timer, answered, children }: { eyebrow: string; title: string; timer?: number; answered: number; children: React.ReactNode }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">{eyebrow}</p><h2 className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-slate-900">{title}</h2></div><div className="flex gap-2">{timer !== undefined && <span className="metric-pill"><Clock3 size={15} />{timer}s</span>}<span className="metric-pill"><Coins size={15} />{answered} joined</span></div></div>{children}</div>; }
function ActivityWaiting({ type }: { type: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Clock3 className="mx-auto text-slate-300" size={32} /><h3 className="mt-4 text-lg font-black text-slate-800">Waiting for the trainer</h3><p className="mt-2 text-sm text-slate-500">The live {type} will appear here as soon as it starts.</p></div>; }
function ResultBanner({ good, text }: { good: boolean; text: string }) { return <div className={`mt-5 rounded-xl border p-4 text-sm font-bold ${good ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{text}</div>; }
function Stat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>; }
function useTimer(endsAt: string | null) { const [remaining, setRemaining] = useState(() => endsAt ? Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000)) : 0); useEffect(() => { const update = () => setRemaining(endsAt ? Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000)) : 0); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, [endsAt]); return remaining; }
