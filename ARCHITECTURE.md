# Architecture

## System overview

```text
Trainer browser ─┐
Student browsers ├─ HTTPS / real-time channel ─ Next.js application ─ JSON repositories ─ data/*.json
Projector screen ┘                                  │
                                                   └─ constrained execution request ─ Python runner
```

## Application layers

### Presentation

Next.js App Router pages provide three purpose-built surfaces:

- **Trainer:** authenticated controls, content selection, participation, awards.
- **Student:** read-only live lesson state plus allowed responses and challenge code.
- **Projector:** large-format public classroom state with no private controls.

Shared components will cover lesson headers, code progression, theory cards, activity panels, agent diagrams, timers, coin notices, and leaderboards.

### Server boundary

Route handlers and Server Actions will:

- authenticate trainer/student sessions;
- validate and normalize input;
- authorize activity and coin mutations;
- coordinate file-backed transactions;
- publish real-time events;
- call the isolated Python runner.

No writable JSON path or trainer secret is sent to the browser.

### Persistence

`data/*.json` is the durable store. A typed repository layer will serialize writes, write to a temporary sibling file, then atomically replace the target. This avoids partially written JSON when multiple answers arrive close together.

Planned files:

- `students.json`: identity, progress, aggregate coin balance, reward state
- `lessons.json`: Day 3 lesson content and ordering
- `codeSteps.json`: revealable code lines, explanations, analogies, concepts
- `quizzes.json`, `polls.json`, `challenges.json`: activity definitions
- `sessions.json`: active classroom state and activity state
- `leaderboard.json`: derived rank snapshot for fast display
- `rewards.json`: configurable top-five reward labels and trainer confirmations

### Real-time synchronization

Socket.IO is the implemented transport for local classroom broadcasts. The custom `server.mjs` hosts Next.js and the socket server in one process. The server persists authoritative state before emitting an event. Reconnecting clients request a fresh snapshot rather than depending on missed events; a low-frequency polling fallback handles restricted networks.

Main event families are lesson/code changes, execution results, quiz/poll/challenge lifecycle, coin awards, leaderboard updates, and reward confirmation.

### Python execution

The Next.js process does not evaluate submitted Python. It launches the dedicated `runner/execute.py` boundary in isolated Python mode with:

- a restricted built-in allowlist and server-side forbidden-token validation;
- isolated interpreter mode with no inherited application secrets;
- wall-clock timeout and memory/process limits;
- capped stdout/stderr;
- no inherited secrets and no network access;
- structured output containing stdout, stderr, status, and duration.

This runner is suitable for the local teaching examples and short student exercises in this project. It is not a general-purpose public code-execution service; an internet-facing deployment should move execution into disposable OS containers or microVMs.

## Security model

- Trainer authentication uses a server-only secret and an HTTP-only session cookie.
- Student identity is keyed by normalized USN and tied to an HTTP-only session.
- Every mutation checks the session role at the server.
- Coin changes go through a server-side award ledger/idempotency key to prevent repeats.
- Email, USN, names, answers, code, numeric awards, and content IDs are schema-validated.
- Projector payloads are explicitly shaped to include public fields only.

## Operating assumptions

The first deployment targets one workshop host and a trusted classroom network. JSON plus a single authoritative server is appropriate for that scope. Multi-host deployment would require a shared transactional store and a distributed event channel, which is intentionally outside this build.
