"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  HelpCircle,
  Info,
  Lightbulb,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import type { CodeStep, WorkshopSession } from "@/lib/types";

type RunResult = { stdout?: string; stderr?: string; status?: string; durationMs?: number; error?: string };

export function LiveCode({
  steps,
  session,
  trainer,
  onStep,
  onRun,
  onCodeChange,
}: {
  steps: CodeStep[];
  session: WorkshopSession;
  trainer?: boolean;
  onStep?: (step: number) => void;
  onRun?: (code: string) => Promise<RunResult>;
  onCodeChange?: (code: string) => void;
}) {
  const lessonSteps = useMemo(
    () => steps.filter((step) => step.lessonId === session.lessonId).sort((a, b) => a.order - b.order),
    [steps, session.lessonId]
  );
  if (!trainer) return <StudentLiveCode steps={lessonSteps} session={session} />;
  if (!lessonSteps.length) return <EmptyCode trainer={trainer} />;
  return (
    <TrainerLiveCode
      lessonSteps={lessonSteps}
      session={session}
      onStep={onStep}
      onRun={onRun}
      onCodeChange={onCodeChange}
    />
  );
}

function TrainerLiveCode({
  lessonSteps,
  session,
  onStep,
  onRun,
  onCodeChange,
}: {
  lessonSteps: CodeStep[];
  session: WorkshopSession;
  onStep?: (step: number) => void;
  onRun?: (code: string) => Promise<RunResult>;
  onCodeChange?: (code: string) => void;
}) {
  const [editor, setEditor] = useState({ lessonId: session.lessonId, code: session.liveCode || "" });
  const [running, setRunning] = useState(false);
  const [localOutput, setLocalOutput] = useState<RunResult | null>(null);
  const syncTimer = useRef<number | null>(null);
  const lastSync = useRef(0);

  useEffect(() => () => {
    if (syncTimer.current) window.clearTimeout(syncTimer.current);
  }, [session.lessonId]);

  const code = editor.lessonId === session.lessonId ? editor.code : session.liveCode || "";
  const currentIndex = Math.min(Math.max(session.codeStep - 1, 0), lessonSteps.length - 1);
  const current = lessonSteps[currentIndex];

  function changeCode(value: string) {
    setEditor({ lessonId: session.lessonId, code: value });
    const elapsed = Date.now() - lastSync.current;
    const send = () => {
      lastSync.current = Date.now();
      onCodeChange?.(value);
    };
    if (elapsed >= 120) send();
    else {
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
      syncTimer.current = window.setTimeout(send, 120 - elapsed);
    }
  }

  function loadCumulativeCode(stepIndex: number) {
    const cumulative = lessonSteps
      .slice(0, stepIndex + 1)
      .map((s) => s.code)
      .join("\n\n");
    changeCode(cumulative);
    onStep?.(stepIndex + 1);
  }

  async function run() {
    if (!onRun) return;
    setRunning(true);
    setLocalOutput(await onRun(code));
    setRunning(false);
  }

  function reset() {
    changeCode("");
    onStep?.(0);
    setLocalOutput(null);
  }

  const output = localOutput || session.codeOutput;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[0.75fr_1.25fr_1fr]">
        {/* Left Column: Trainer Guidance & Live Progress */}
        <section className="border-b border-slate-200 bg-slate-50 p-5 xl:border-b-0 xl:border-r">
          <p className="eyebrow">Trainer Guidance</p>
          <h3 className="mt-2 text-xl font-black text-slate-900">{current?.concept || "Live Code"}</h3>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700">
                <Info size={14} />
                <span>What is it?</span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-blue-950">{current?.explanation}</p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700">
                <Lightbulb size={14} />
                <span>Why are we adding this?</span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-amber-950">{current?.why}</p>
            </div>

            <div className="rounded-xl border border-violet-100 bg-violet-50/80 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-violet-700">
                <HelpCircle size={14} />
                <span>Real-World Analogy</span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-violet-950">{current?.analogy}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-600">Teaching progress</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.max(8, (Math.max(1, session.codeStep) / lessonSteps.length) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-600">
              Step {Math.max(1, session.codeStep)} of {lessonSteps.length}
            </p>
          </div>
        </section>

        {/* Middle Column: Live Code Editor & Runner */}
        <section className="min-w-0 bg-[#090d1a] p-5 text-white">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-emerald-400">
              <Radio size={12} />
              Typing Live to Students
            </span>
          </div>

          <textarea
            value={code}
            onChange={(event) => changeCode(event.target.value)}
            placeholder="Type or load step code from the right panel..."
            spellCheck={false}
            className="min-h-80 w-full resize-none bg-transparent font-mono text-sm leading-8 text-slate-200 outline-none placeholder:text-slate-700"
            aria-label="Trainer Python code"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const prev = Math.max(0, session.codeStep - 2);
                loadCumulativeCode(prev);
              }}
              className="code-button"
            >
              <ChevronLeft size={15} />
              Prev Step
            </button>
            <button
              onClick={() => {
                const next = Math.min(lessonSteps.length - 1, session.codeStep);
                loadCumulativeCode(next);
              }}
              className="code-button"
            >
              Next Step
              <ChevronRight size={15} />
            </button>
            <button
              onClick={() => loadCumulativeCode(lessonSteps.length - 1)}
              className="code-button text-amber-300!"
            >
              <Sparkles size={14} />
              Load All Steps
            </button>
            <button
              onClick={run}
              disabled={running || !code.trim()}
              className="code-button bg-blue-600! text-white! hover:bg-blue-500!"
            >
              <Play size={15} />
              {running ? "Running…" : "Run Code"}
            </button>
            <button onClick={reset} className="code-button">
              <RotateCcw size={14} />
              Clear
            </button>
          </div>
        </section>

        {/* Right Column: Instructor Script & Structured Explanation */}
        <section className="border-t border-slate-200 p-5 xl:border-l xl:border-t-0">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-blue-600" />
            <p className="eyebrow">Instructor Script & Steps</p>
          </div>

          <div className="mt-4 max-h-52 space-y-2 overflow-auto pr-1">
            {lessonSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex w-full items-start justify-between rounded-lg border p-2.5 transition ${
                  index === currentIndex
                    ? "border-blue-400 bg-blue-50/80 ring-1 ring-blue-200"
                    : "border-slate-200 bg-slate-50 hover:border-blue-200"
                }`}
              >
                <button
                  onClick={() => onStep?.(index + 1)}
                  className="flex items-start gap-2 text-left min-w-0 flex-1"
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-black ${
                      index < session.codeStep - 1
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white text-slate-500"
                    }`}
                  >
                    {index < session.codeStep - 1 ? <CheckCircle2 size={12} /> : index + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{step.concept}</span>
                    <code className="block whitespace-pre-wrap text-[11px] font-bold leading-5 text-slate-700">
                      {step.code}
                    </code>
                  </div>
                </button>
                <button
                  onClick={() => loadCumulativeCode(index)}
                  title="Append / Sync up to this step"
                  className="ml-2 shrink-0 rounded p-1 text-slate-400 hover:bg-white hover:text-blue-600"
                >
                  <Copy size={13} />
                </button>
              </div>
            ))}
          </div>

          <OutputPanel output={output} trainer />
        </section>
      </div>
    </div>
  );
}

function StudentLiveCode({ steps, session }: { steps: CodeStep[]; session: WorkshopSession }) {
  const lines = (session.liveCode || "").split("\n");
  const currentIndex = Math.min(Math.max((session.codeStep || 1) - 1, 0), steps.length - 1);
  const currentStep = steps[currentIndex] || steps[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="eyebrow">Trainer Code & Structured Explanations</p>
          <h2 className="mt-1 text-lg font-black text-slate-900">Watch code build & learn step-by-step</h2>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          LIVE
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_340px]">
        {/* Code View */}
        <section className="min-h-[430px] bg-[#090d1a] p-5 font-mono text-sm leading-8 text-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            {currentStep && (
              <span className="rounded-full bg-blue-500/20 px-3 py-1 font-sans text-xs font-bold text-blue-300">
                Step {session.codeStep || 1}: {currentStep.concept}
              </span>
            )}
          </div>

          {session.liveCode ? (
            <div>
              {lines.map((line, index) => (
                <div
                  key={`${index}-${line}`}
                  className={`flex rounded px-2 ${
                    index === lines.length - 1
                      ? "border-l-2 border-blue-400 bg-blue-400/10 text-blue-100"
                      : "text-slate-400"
                  }`}
                >
                  <span className="mr-4 w-6 select-none text-right text-slate-600">{index + 1}</span>
                  <span className="whitespace-pre-wrap">{line || " "}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center text-center">
              <div>
                <Radio className="mx-auto animate-pulse text-blue-500" />
                <p className="mt-4 font-sans text-sm font-bold text-slate-500">
                  Waiting for the trainer to type code…
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Right Explanation & Output Panel for Student */}
        <aside className="space-y-4 border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
          {currentStep && (
            <div className="space-y-3">
              <p className="eyebrow">Code Explanation</p>
              <div className="rounded-xl border border-blue-200 bg-white p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700">
                  <Info size={14} />
                  <span>What is it?</span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-700">{currentStep.explanation}</p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700">
                  <Lightbulb size={14} />
                  <span>Why are we adding this?</span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-700">{currentStep.why}</p>
              </div>

              <div className="rounded-xl border border-violet-200 bg-white p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-violet-700">
                  <HelpCircle size={14} />
                  <span>Real-World Analogy</span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-700">{currentStep.analogy}</p>
              </div>
            </div>
          )}

          <OutputPanel output={session.codeOutput} />
        </aside>
      </div>
    </div>
  );
}

function OutputPanel({
  output,
  trainer,
}: {
  output: RunResult | WorkshopSession["codeOutput"];
  trainer?: boolean;
}) {
  return (
    <div className={`${trainer ? "mt-4" : ""} rounded-xl bg-slate-950 p-4 text-white`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
        <TerminalSquare size={15} />
        Code Output
      </div>
      {output ? (
        <>
          <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-300">
            {("error" in output ? output.error : "") || output.stderr || output.stdout || "Code completed with no output."}
          </pre>
          {output.durationMs !== undefined && (
            <p className="mt-3 text-[10px] font-bold text-slate-500">
              {output.status} · {output.durationMs} ms
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-500">Execution output will appear here.</p>
      )}
    </div>
  );
}

function EmptyCode({ trainer }: { trainer?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 font-mono text-xl font-black text-slate-500">
        {`{}`}
      </span>
      <h3 className="mt-4 text-lg font-black text-slate-800">No coding script in this lesson</h3>
      <p className="mt-2 text-sm text-slate-500">
        {trainer
          ? "Choose Build the Researcher, Writer, Reviewer, or Final Pipeline."
          : "The trainer will open a coding lesson when it is time to build."}
      </p>
    </div>
  );
}
