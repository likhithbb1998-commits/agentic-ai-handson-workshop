import { ArrowRight, Bot, Braces, Network, Sparkles, Users } from "lucide-react";

const learningFlow = [
  { icon: Bot, label: "Understand the agent", detail: "Theory and real-life analogies" },
  { icon: Network, label: "See the workflow", detail: "Visual handoffs and shared state" },
  { icon: Braces, label: "Build it live", detail: "Line-by-line Python teaching" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fc]">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_72%_16%,rgba(124,58,237,0.12),transparent_30%),radial-gradient(circle_at_22%_4%,rgba(37,99,235,0.14),transparent_28%)]" />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight">LIUANTX</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Live Workshop</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur">
          <span className="size-2 rounded-full bg-emerald-500" />
          Day 3 experience
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
            <Users size={14} /> Interactive AI Engineering Classroom
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.03] tracking-[-0.045em] text-slate-950 md:text-6xl lg:text-7xl">
            Build a multi-agent system <span className="text-blue-600">from scratch.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Learn through live coding, visual workflows, practical analogies, simulators, and classroom challenges—then connect it all with LangGraph and CrewAI.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="/student/login" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
              Join as student <ArrowRight size={17} />
            </a>
            <a href="/trainer/login" className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
              Trainer portal
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-7 rounded-[2rem] bg-gradient-to-br from-blue-200/50 to-violet-200/50 blur-2xl" />
          <div className="relative rounded-[1.75rem] border border-white bg-white/90 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur">
            <div className="rounded-[1.25rem] bg-slate-950 p-6 text-white md:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-400">Live code mode</p>
                  <p className="mt-1 text-sm text-slate-400">Researcher agent · Line 3 of 4</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">LIVE</span>
              </div>
              <div className="space-y-2 font-mono text-sm md:text-base">
                <p className="text-slate-400"><span className="mr-4 text-slate-600">1</span>def researcher(topic):</p>
                <p className="text-slate-400"><span className="mr-4 text-slate-600">2</span>&nbsp;&nbsp;prompt = f&quot;Research {'{topic}'}&quot;</p>
                <p className="-mx-3 rounded-lg border-l-2 border-blue-400 bg-blue-400/10 px-3 py-2 text-blue-100"><span className="mr-4 text-blue-400">3</span>&nbsp;&nbsp;response = ask_ai(prompt)</p>
                <p className="select-none blur-[4px]"><span className="mr-4 text-slate-600">4</span>&nbsp;&nbsp;return response</p>
              </div>
              <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-300">What this does</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Sends the written assignment to the AI—like a research employee starting the task.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <p className="mb-7 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">The learning loop</p>
          <div className="grid gap-4 md:grid-cols-3">
            {learningFlow.map(({ icon: Icon, label, detail }, index) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-8 flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={21} /></span>
                  <span className="text-sm font-black text-slate-300">0{index + 1}</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">{label}</h2>
                <p className="mt-1 text-sm text-slate-500">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
