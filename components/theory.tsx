"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  CheckSquare2,
  Cpu,
  Database,
  FileText,
  GitBranch,
  HelpCircle,
  Layers,
  Lightbulb,
  Network,
  NotebookText,
  PenLine,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import type { Lesson } from "@/lib/types";

export function TheoryPanel({ lesson }: { lesson: Lesson }) {
  const visual = theoryVisual(lesson.order);

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_.9fr]">
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

        {/* Interactive Architectural Flow Diagram */}
        <LessonFlowDiagram lessonOrder={lesson.order} />

        {/* Visual Graphic */}
        <figure className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-2 shadow-inner">
          <Image
            unoptimized
            priority
            src={visual.src}
            alt={visual.alt}
            width={1536}
            height={1024}
            sizes="(max-width: 1280px) 100vw, 760px"
            className="aspect-[16/8] w-full rounded-xl object-cover opacity-90 transition hover:opacity-100"
          />
          <figcaption className="border-t border-slate-800 bg-slate-950/80 px-4 py-3 text-xs font-semibold leading-5 text-slate-300 backdrop-blur">
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

      {/* Right Column: Unique Lesson Animation */}
      <div className="space-y-6">
        <LessonSpecificAnimation lessonOrder={lesson.order} />
        <AgentDiagram />
      </div>
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

/** Tailored Interactive Flow Diagrams for every lesson */
function LessonFlowDiagram({ lessonOrder }: { lessonOrder: number }) {
  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 text-white shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-[.16em] text-blue-300">
            System Flow Diagram · Lesson {lessonOrder} Architecture
          </h3>
        </div>
        <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold text-blue-300 border border-blue-500/30">
          Live Flowchart
        </span>
      </div>

      {/* Lesson 1: Monolithic vs Multi-Agent Flow */}
      {lessonOrder === 1 && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3 text-center text-xs font-bold">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300 space-y-1">
              <p className="font-black text-rose-400">1. Single Prompt</p>
              <p className="text-[10px] text-slate-400">Tries all jobs at once</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-300 space-y-1">
              <p className="font-black text-amber-400">2. Context Overload</p>
              <p className="text-[10px] text-slate-400">Model loses precision</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300 space-y-1">
              <p className="font-black text-emerald-400">3. Specialist Team</p>
              <p className="text-[10px] text-slate-400">High precision & clarity</p>
            </div>
          </div>
        </div>
      )}

      {/* Lesson 2 & 3: Multi-Agent Handoff Pipeline Flow */}
      {(lessonOrder === 2 || lessonOrder === 3) && (
        <div className="flex flex-wrap items-center justify-around gap-2 text-center text-xs font-bold">
          <div className="rounded-xl border border-blue-500/40 bg-blue-500/20 px-4 py-3 text-blue-300">
            <Search size={18} className="mx-auto mb-1 text-blue-400" />
            <span>Researcher</span>
          </div>
          <ArrowRight className="text-slate-500 animate-pulse" size={18} />
          <div className="rounded-xl border border-violet-500/40 bg-violet-500/20 px-4 py-3 text-violet-300">
            <PenLine size={18} className="mx-auto mb-1 text-violet-400" />
            <span>Writer</span>
          </div>
          <ArrowRight className="text-slate-500 animate-pulse" size={18} />
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-3 text-emerald-300">
            <ShieldCheck size={18} className="mx-auto mb-1 text-emerald-400" />
            <span>Reviewer</span>
          </div>
        </div>
      )}

      {/* Lesson 4: Researcher Flow */}
      {lessonOrder === 4 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-slate-300">
            <span className="text-blue-400 font-bold">Input Topic</span>: &quot;AI Agents&quot;
          </div>
          <ArrowRight className="text-blue-400 animate-pulse" size={16} />
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-300 font-bold">
            ask_ai(researcher_prompt)
          </div>
          <ArrowRight className="text-blue-400 animate-pulse" size={16} />
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300 font-bold">
            state[&quot;research&quot;] Updated
          </div>
        </div>
      )}

      {/* Lesson 5: Writer Flow */}
      {lessonOrder === 5 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-300">
            Read: state[&quot;research&quot;]
          </div>
          <ArrowRight className="text-violet-400 animate-pulse" size={16} />
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-violet-300 font-bold">
            writer_agent(notes)
          </div>
          <ArrowRight className="text-violet-400 animate-pulse" size={16} />
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300 font-bold">
            Write: state[&quot;draft&quot;]
          </div>
        </div>
      )}

      {/* Lesson 6: Shared State Data Flow */}
      {lessonOrder === 6 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
            CENTRAL SHARED STATE DICT {`{ "topic", "research", "draft", "review" }`}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">🔍 Writes Research</div>
            <div className="p-2 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">✍️ Reads Notes & Writes Draft</div>
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">🛡️ Validates Draft Quality</div>
          </div>
        </div>
      )}

      {/* Lesson 7, 8, 11: Self-Healing Critique Loop Flow */}
      {(lessonOrder === 7 || lessonOrder === 8 || lessonOrder === 11) && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-violet-300 font-bold">Writer generates Draft</span>
            <ArrowRight size={16} className="text-slate-500" />
            <span className="text-emerald-300 font-bold">Reviewer checks Quality</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              ✅ If APPROVED $\rightarrow$ Output Final State
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300">
              🔄 If REJECTED $\rightarrow$ Route back to Writer
            </div>
          </div>
        </div>
      )}

      {/* Lesson 9: Short-Term vs Long-Term Memory Flow */}
      {lessonOrder === 9 && (
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900 border border-violet-500/30 space-y-2">
            <div className="flex items-center gap-2 text-violet-300 font-bold">
              <Layers size={16} /> Short-Term RAM
            </div>
            <p className="text-[11px] text-slate-400">Stores active messages in Python list [] during workflow execution.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <Database size={16} /> Long-Term Disk
            </div>
            <p className="text-[11px] text-slate-400">Saves facts to agent_memory.json file so memory persists across restarts.</p>
          </div>
        </div>
      )}

      {/* Lesson 10: LangGraph Graph Execution Flow */}
      {lessonOrder === 10 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-between text-center">
          <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 font-bold">START</span>
          <ArrowRight size={14} className="text-slate-500" />
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200">Node: &quot;researcher&quot;</span>
          <ArrowRight size={14} className="text-slate-500" />
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200">Node: &quot;writer&quot;</span>
          <ArrowRight size={14} className="text-slate-500" />
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">END</span>
        </div>
      )}

      {/* Lesson 12 & 13: CrewAI / Final Capstone Flow */}
      {(lessonOrder === 12 || lessonOrder === 13) && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span>1. Create Agents (Role, Goal, Backstory)</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>2. Define Tasks (Description, Expected Output)</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span>3. Crew(agents, tasks, process=Sequential).kickoff()</span>
            <Sparkles size={14} className="text-emerald-400" />
          </div>
        </div>
      )}
    </div>
  );
}

function LessonSpecificAnimation({ lessonOrder }: { lessonOrder: number }) {
  // Lesson 1: Monolithic Prompt vs Specialist Split
  if (lessonOrder === 1) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
          <XCircle size={16} />
          <span>Single Prompt Monolith (High Failure Rate)</span>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 font-mono">
          1 Prompt trying to Research + Write + Code + Safety Check... <span className="text-rose-400 font-bold">❌ Hallucination Risk</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider pt-2">
          <CheckCircle2 size={16} />
          <span>Specialist Multi-Agent Team (High Accuracy)</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">Researcher</div>
          <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">Writer</div>
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Reviewer</div>
        </div>
      </div>
    );
  }

  // Lesson 2: Multi-Agent System Topology
  if (lessonOrder === 2) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider">
          <Network size={16} />
          <span>Multi-Agent System Topology</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-around text-center">
          <div className="space-y-1">
            <Search size={20} className="mx-auto text-blue-400" />
            <p className="text-[10px] font-bold">Research Node</p>
          </div>
          <ArrowRight size={16} className="text-slate-600 animate-pulse" />
          <div className="space-y-1">
            <PenLine size={20} className="mx-auto text-violet-400" />
            <p className="text-[10px] font-bold">Writer Node</p>
          </div>
          <ArrowRight size={16} className="text-slate-600 animate-pulse" />
          <div className="space-y-1">
            <ShieldCheck size={20} className="mx-auto text-emerald-400" />
            <p className="text-[10px] font-bold">Reviewer Node</p>
          </div>
        </div>
      </div>
    );
  }

  // Lesson 3: Agent Anatomy
  if (lessonOrder === 3) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider mb-2">
          <Bot size={16} />
          <span>Agent Anatomy Breakdown</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className="text-slate-400">Role:</span> Senior Specialist</div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className="text-slate-400">Prompt:</span> System Rules</div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className="text-slate-400">API:</span> OpenRouter</div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className="text-slate-400">Function:</span> ask_ai(prompt)</div>
        </div>
      </div>
    );
  }

  // Lesson 4: Researcher Agent Node
  if (lessonOrder === 4) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider mb-2">
          <Search size={16} />
          <span>Researcher Agent Node Output</span>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-mono space-y-1.5">
          <p className="text-blue-300 font-bold">Input: &quot;Multi-Agent Systems&quot;</p>
          <p className="text-slate-300">✓ Fact 1: Specialist role isolation</p>
          <p className="text-slate-300">✓ Fact 2: Shared state dict passing</p>
          <p className="text-slate-300">✓ Fact 3: Self-healing quality retries</p>
        </div>
      </div>
    );
  }

  // Lesson 5: Writer Handoff
  if (lessonOrder === 5) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-violet-400 font-black text-xs uppercase tracking-wider mb-2">
          <PenLine size={16} />
          <span>Agent-to-Agent Handoff Animation</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-blue-400 font-bold uppercase">Upstream Output</span>
            <p className="font-mono text-slate-300">researcher_notes</p>
          </div>
          <ArrowRight className="text-violet-400 animate-pulse" size={20} />
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-violet-400 font-bold uppercase">Downstream Input</span>
            <p className="font-mono text-slate-300">writer(notes)</p>
          </div>
        </div>
      </div>
    );
  }

  // Lesson 6: Shared State
  if (lessonOrder === 6) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider mb-4">
          <Database size={16} />
          <span>Shared State Notebook (Live LED Animation)</span>
        </div>
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">&quot;topic&quot;:</span>
            <span className="text-blue-400 font-bold">&quot;Multi-Agent Systems&quot;</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between animate-pulse">
            <span className="text-slate-400">&quot;research&quot;:</span>
            <span className="text-emerald-400 font-bold">&quot;3 key facts gathered&quot;</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">&quot;draft&quot;:</span>
            <span className="text-violet-400 font-bold">&quot;Technical draft ready&quot;</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">&quot;review&quot;:</span>
            <span className="text-amber-400 font-bold">&quot;APPROVED&quot;</span>
          </div>
        </div>
      </div>
    );
  }

  // Lesson 7: Reviewer Gate
  if (lessonOrder === 7) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider mb-2">
          <ShieldCheck size={16} />
          <span>Reviewer Quality Stamp</span>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono flex items-center justify-between">
          <span>draft_length &gt;= 20 chars</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black">APPROVED</span>
        </div>
      </div>
    );
  }

  // Lesson 8: Review & Retry Loop
  if (lessonOrder === 8) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider mb-4">
          <RefreshCw size={16} className="animate-spin" />
          <span>Self-Healing Critique Loop Animation</span>
        </div>
        <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black">
            <span>Status: REJECTED</span>
            <RefreshCw size={12} className="animate-spin" />
          </div>
          <ArrowRight className="mx-auto text-amber-400 rotate-90 my-2 animate-bounce" size={20} />
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            Writer revising draft with Reviewer feedback...
          </div>
        </div>
      </div>
    );
  }

  // Lesson 9: Memory Architecture
  if (lessonOrder === 9) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-violet-400 font-black text-xs uppercase tracking-wider mb-4">
          <Layers size={16} />
          <span>Memory Persistence Architecture</span>
        </div>
        <div className="grid gap-3 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-violet-500/30 flex items-center justify-between">
            <div>
              <p className="font-bold text-violet-300">Short-Term Memory</p>
              <p className="text-[10px] text-slate-400">In-RAM List []</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-violet-500/20 text-violet-300 font-bold text-[10px]">Active Session</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="font-bold text-emerald-300">Long-Term Memory</p>
              <p className="text-[10px] text-slate-400">agent_memory.json File</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Persisted Disk</span>
          </div>
        </div>
      </div>
    );
  }

  // Lesson 10: LangGraph Graph Concept
  if (lessonOrder === 10) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider mb-2">
          <GitBranch size={16} />
          <span>LangGraph StateGraph Abstraction</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-2">
          <p className="text-slate-400">StateGraph(LangGraphState)</p>
          <p className="text-blue-300">.add_node(&quot;researcher&quot;, researcher_fn)</p>
          <p className="text-violet-300">.add_edge(&quot;researcher&quot;, &quot;writer&quot;)</p>
          <p className="text-emerald-300">.compile()</p>
        </div>
      </div>
    );
  }

  // Lesson 11: Conditional Edge Routing
  if (lessonOrder === 11) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-orange-400 font-black text-xs uppercase tracking-wider mb-2">
          <GitBranch size={16} />
          <span>Conditional Edge Track Switch</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center">
            If APPROVED<br /><span className="font-bold">Route to END</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-center">
            If REJECTED<br /><span className="font-bold">Route to Writer</span>
          </div>
        </div>
      </div>
    );
  }

  // Lesson 12: CrewAI Team Framework
  if (lessonOrder === 12) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-violet-400 font-black text-xs uppercase tracking-wider mb-2">
          <Users size={16} />
          <span>CrewAI Enterprise Abstractions</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className="text-violet-400 font-bold">Agent:</span> Role + Goal</div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className="text-blue-400 font-bold">Task:</span> Description</div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className="text-emerald-400 font-bold">Crew:</span> Team Array</div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800"><span className="text-amber-400 font-bold">Process:</span> Sequential</div>
        </div>
      </div>
    );
  }

  // Lesson 13: Final Capstone Pipeline
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl space-y-3">
      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider mb-2">
        <Sparkles size={16} />
        <span>Capstone Pipeline Execution Success</span>
      </div>
      <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono text-center text-emerald-300 space-y-1">
        <p className="font-bold">🎉 MULTI-AGENT PIPELINE COMPLETE!</p>
        <p className="text-[10px] text-slate-400">Researcher $\rightarrow$ Writer $\rightarrow$ Reviewer $\rightarrow$ Approved State</p>
      </div>
    </div>
  );
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
