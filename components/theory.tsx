"use client";

import Image from "next/image";
import {
  ArrowDown,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  CheckSquare2,
  Cpu,
  HelpCircle,
  Lightbulb,
  NotebookText,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { Lesson } from "@/lib/types";

export function TheoryPanel({ lesson }: { lesson: Lesson }) {
  const visual = theoryVisual(lesson.order);

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_.85fr]">
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="eyebrow">{lesson.eyebrow}</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{lesson.title}</h1>
            </div>
          </div>
          <p className="mt-5 text-lg font-medium leading-8 text-slate-700">{lesson.summary}</p>
        </div>

        {/* Deep Dive Breakdown */}
        {lesson.detailedContent && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700">
              <BookOpen size={16} />
              <span>Deep-Dive Explanation</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-800">{lesson.detailedContent}</p>
          </div>
        )}

        {/* Visual Graphic */}
        <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <Image
            unoptimized
            priority
            src={visual.src}
            alt={visual.alt}
            width={1536}
            height={1024}
            sizes="(max-width: 1280px) 100vw, 760px"
            className="aspect-[16/8] w-full object-cover"
          />
          <figcaption className="border-t border-slate-200 px-4 py-3 text-xs font-semibold leading-5 text-slate-500">
            {visual.caption}
          </figcaption>
        </figure>

        {/* Key Takeaways */}
        {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700">
              <CheckSquare2 size={16} />
              <span>Key Takeaways for Students</span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {lesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm font-semibold text-emerald-950">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Industry Example & Architecture Step */}
        <div className="grid gap-4 md:grid-cols-2">
          {lesson.industryExample && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700">
                <Building2 size={16} />
                <span>Real-World Industry Example</span>
              </div>
              <p className="mt-3 text-xs leading-6 text-amber-950 font-medium">{lesson.industryExample}</p>
            </div>
          )}

          {lesson.architectureStep && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700">
                <Cpu size={16} />
                <span>Architecture Layer</span>
              </div>
              <p className="mt-3 text-xs font-mono font-bold leading-6 text-indigo-950">{lesson.architectureStep}</p>
            </div>
          )}
        </div>

        {/* Intuition & Technical Idea */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-violet-700">
              <Users size={16} />
              <span>Real Life Analogy</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-violet-950">{lesson.analogy}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700">
              <NotebookText size={16} />
              <span>Technical Concept</span>
            </div>
            <p className="mt-3 font-mono text-sm leading-6 text-blue-950">{lesson.technicalIdea}</p>
          </div>
        </div>

        {/* Concept Check */}
        <ConceptCheck lesson={lesson} />
      </div>

      {/* Right Column: Workflow Diagram */}
      <AgentDiagram />
    </div>
  );
}

function theoryVisual(order: number) {
  if ([6, 9].includes(order))
    return {
      src: "/theory/shared-state.webp",
      alt: "Agents contributing information to a shared notebook",
      caption: "State works like one shared notebook: every specialist reads what is available and adds its result.",
    };
  if ([7, 8, 10, 11, 13].includes(order))
    return {
      src: "/theory/review-loop.webp",
      alt: "A reviewer routing an approved draft forward or a rejected draft back to the writer",
      caption: "A conditional edge reads the review result: approved work moves forward; rejected work loops back for revision.",
    };
  return {
    src: "/theory/agent-team.webp",
    alt: "Researcher, writer and reviewer agents handing work to each other",
    caption: "Specialist agents do one job well and pass useful results to the next teammate.",
  };
}

function ConceptCheck({ lesson }: { lesson: Lesson }) {
  return (
    <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <summary className="cursor-pointer list-none text-sm font-black text-slate-800 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <HelpCircle size={16} className="text-blue-600" />
          <span>Quick concept check: {lesson.question}</span>
        </span>
        <span className="text-xs text-blue-600 hover:underline">Reveal answer</span>
      </summary>
      <div className="mt-4 space-y-2">
        {lesson.options.map((option, index) => (
          <div
            key={option}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold flex items-center justify-between ${
              index === lesson.correctAnswer
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span>
              {String.fromCharCode(65 + index)}. {option}
            </span>
            {index === lesson.correctAnswer && <CheckCircle2 className="text-emerald-600" size={16} />}
          </div>
        ))}
      </div>
    </details>
  );
}

export function AgentDiagram({ large = false }: { large?: boolean }) {
  const agents = [
    { label: "Researcher Agent", icon: Search, color: "text-blue-600 bg-blue-50" },
    { label: "Writer Agent", icon: PenLine, color: "text-violet-600 bg-violet-50" },
    { label: "Reviewer Agent", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
  ];
  return (
    <div className={`rounded-2xl bg-slate-950 p-6 text-white shadow-xl ${large ? "md:p-10" : ""}`}>
      <div className="flex items-center gap-2">
        <Bot size={18} className="text-blue-400" />
        <p className="text-xs font-black uppercase tracking-[.16em] text-blue-300">Multi-Agent Pipeline Architecture</p>
      </div>
      <div className="mt-7 flex flex-col items-center">
        <span className="rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-300">
          User Mission & Input Topic
        </span>
        <ArrowDown className="my-2 text-slate-600" />
        {agents.map(({ label, icon: Icon, color }, index) => (
          <div key={label} className="flex w-full flex-col items-center">
            <div
              className={`flex w-full max-w-sm items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 ${
                large ? "md:p-6" : ""
              }`}
            >
              <span className={`grid size-11 place-items-center rounded-xl ${color}`}>
                <Icon size={19} />
              </span>
              <div>
                <p className="font-black">{label}</p>
                <p className="text-xs text-slate-500">
                  {index === 0
                    ? "Gathers & structures topic facts"
                    : index === 1
                    ? "Transforms research into draft"
                    : "Enforces quality & review loops"}
                </p>
              </div>
              {index === 2 && <CheckCircle2 className="ml-auto text-emerald-400" size={19} />}
            </div>
            {index < 2 && (
              <div className="flex flex-col items-center">
                <div className="h-5 w-px bg-gradient-to-b from-blue-500 to-violet-500" />
                <span className="rounded-full bg-slate-800 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Handoff & State Update
                </span>
                <div className="h-5 w-px bg-slate-700" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
