"use client";

import { useState } from "react";
import { ArrowDown, BookOpen, CheckCircle2, PenLine, Play, RotateCcw, Search, ShieldCheck } from "lucide-react";

const stages = [
  { name: "Researcher", detail: "Collecting focused facts", icon: Search, state: "Research" },
  { name: "Writer", detail: "Turning facts into a draft", icon: PenLine, state: "Draft" },
  { name: "Reviewer", detail: "Checking clarity and quality", icon: ShieldCheck, state: "Review" },
];

export function AgentSimulator({
  completed,
  onComplete,
  trainer = false,
}: {
  completed?: boolean;
  onComplete?: () => Promise<void>;
  trainer?: boolean;
}) {
  const [localStage, setStage] = useState(completed ? 3 : -1);
  const [rejected, setRejected] = useState(false);
  const [awarding, setAwarding] = useState(false);

  const stage = completed ? 3 : localStage;

  async function next() {
    if (stage < 2) {
      setStage(stage + 1);
      return;
    }
    if (!rejected) {
      setRejected(true);
      setStage(1);
      return;
    }
    setStage(3);
    if (!completed && onComplete && !trainer) {
      setAwarding(true);
      await onComplete();
      setAwarding(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{trainer ? "Trainer Demonstration" : "Become the agent"}</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Run the workflow</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStage(-1);
                setRejected(false);
              }}
              className="secondary-button"
            >
              <RotateCcw size={15} />
              Reset
            </button>
            <button
              onClick={next}
              disabled={stage === 3 || awarding}
              className="primary-button"
            >
              <Play size={15} />
              {stage < 0 ? "Run workflow" : stage === 3 ? "Completed" : "Next handoff"}
            </button>
          </div>
        </div>
        <div className="mt-8 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {stages.map(({ name, detail, icon: Icon }, index) => (
            <div key={name} className="contents">
              <div
                className={`rounded-2xl border p-5 transition-all ${
                  stage === index
                    ? "border-blue-400 bg-blue-50 shadow-lg shadow-blue-500/10"
                    : stage > index
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className={`mb-4 grid size-11 place-items-center rounded-xl ${
                    stage >= index ? "bg-blue-600 text-white" : "bg-white text-slate-400"
                  }`}
                >
                  {stage > index || stage === 3 ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>
                <p className="font-black text-slate-900">{name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {stage === index ? `${detail}…` : stage > index ? "Handoff complete" : "Waiting for state"}
                </p>
              </div>
              {index < 2 && (
                <ArrowDown
                  className={`mx-auto rotate-0 md:-rotate-90 ${stage > index ? "text-emerald-500" : "text-slate-300"}`}
                />
              )}
            </div>
          ))}
        </div>
        {rejected && stage < 3 && (
          <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-bold text-orange-700">
            Reviewer rejected version one. Feedback was stored and routed back to Writer.
          </div>
        )}
        {stage === 3 && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            Approved! The final result is ready.
            {!trainer && !completed && " +50 coins earned."}
          </div>
        )}
      </div>
      <SharedState stage={stage} rejected={rejected} />
    </div>
  );
}

function SharedState({ stage, rejected }: { stage: number; rejected: boolean }) {
  const fields = [
    ["Topic", "AI Agents", true],
    ["Research", "Specialist agents improve focus and control.", stage >= 0],
    ["Draft", rejected ? "A revised guide to multi-agent teams…" : "A guide to multi-agent teams…", stage >= 1],
    ["Review", stage >= 3 ? "APPROVED" : rejected ? "REVISION REQUESTED" : "Waiting", stage >= 2],
    ["Status", stage >= 3 ? "COMPLETED" : "IN PROGRESS", stage >= 0],
  ];
  return (
    <aside className="rounded-2xl bg-slate-950 p-5 text-white shadow-xl">
      <div className="flex items-center gap-2">
        <BookOpen size={17} className="text-violet-400" />
        <p className="text-xs font-black uppercase tracking-[.16em] text-violet-300">Shared state</p>
      </div>
      <div className="mt-5 space-y-3">
        {fields.map(([label, value, visible]) => (
          <div
            key={String(label)}
            className={`rounded-xl border border-slate-800 bg-slate-900 p-3 transition-all ${
              visible ? "opacity-100" : "opacity-35"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p
              className={`mt-1 text-xs font-semibold ${
                label === "Review" && value === "APPROVED" ? "text-emerald-400" : "text-slate-300"
              }`}
            >
              {visible ? value : "Waiting for agent…"}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
