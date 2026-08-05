# LiuantX Interactive AI Agent Workshop

A lightweight live-classroom application for **Day 3 — Multi-Agent Orchestration From Scratch, Then LangGraph & CrewAI**.

The product is intentionally focused: trainer-led teaching, line-by-line Python, visual agent workflows, short activities, participation rewards, and a live classroom leaderboard. It is not an LMS.

## Completed workshop system

- Trainer and passwordless student sessions with HTTP-only signed cookies
- Trainer control room, live teaching console, student management, content browser, rewards
- Student mission, theory, code, simulator, quizzes, polls, challenges, ranks
- Large-format projector mode
- 13 complete Day 3 lessons, 20 explained code steps, quizzes, polls, and challenges
- Socket.IO classroom synchronization with snapshot recovery
- Atomic, server-only JSON persistence and live coin rankings
- Speed-based quiz/challenge rewards and trainer-confirmed top-five rewards
- Constrained Python runner with timeout, output cap, resource limits, and blocked imports/files/network
- Responsive professional UI with desktop leaderboard rail and mobile navigation

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful routes:

- `/trainer/login` — trainer sign-in
- `/student/login` — student join form
- `/projector` — classroom display

For deployment outside a private workshop machine, copy `.env.example` to `.env.local`, set a strong `SESSION_SECRET`, and replace the trainer password.

For trainer-only model connectivity, set `OPENROUTER_API_KEY` in `.env.local`. The key stays on the server and is never included in student or projector data. `OPENROUTER_MODEL` can select another OpenRouter model slug.

## Quality checks

```bash
npm run lint
npm run build
```

## Data policy

All application data lives under `data/`. Browsers never write these files directly; validated server-only repositories and route handlers perform every read and mutation.

## Security policy

- Trainer credentials stay in server-only environment configuration.
- Students never control coin or reward mutations.
- User input is validated and normalized at the server boundary.
- Python is executed by an isolated, constrained runner—not inside the Next.js process.

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for completed phases and [ARCHITECTURE.md](./ARCHITECTURE.md) for system boundaries.
