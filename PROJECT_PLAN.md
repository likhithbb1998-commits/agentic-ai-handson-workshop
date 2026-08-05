# Project Plan

## Product outcome

Create a professional live AI engineering classroom where students move through this loop:

**Theory → analogy → visual explanation → simulator → live code → execution → activity → coins → leaderboard → trainer-confirmed rewards**

## Delivery principles

1. Keep the trainer's live controls obvious and low-friction.
2. Teach one concept at a time with short copy and visible state changes.
3. Keep all writes server-side and JSON-backed.
4. Treat real-time updates as event broadcasts; treat JSON files as the durable source of truth.
5. Verify each phase before extending the next one.

## Phases — completed

| Phase | Scope | Verification gate |
| --- | --- | --- |
| 1 | ✅ Project setup, design foundation, JSON files, documentation | Lint and production build pass; landing page is responsive |
| 2 | ✅ Trainer login and protected trainer shell | Valid credentials redirect; invalid credentials stay rejected; password absent from browser bundle |
| 3 | ✅ Student login and session | Required fields and Gmail validated; USN upserts a student; session redirects |
| 4 | ✅ Typed JSON repository and safe file writes | Atomic writes; malformed input rejected; fixtures remain valid JSON |
| 5 | ✅ Trainer dashboard and live session controls | Session and selected lesson persist |
| 6 | ✅ Student dashboard and persistent leaderboard rail | Active student and current lesson render responsively |
| 7–8 | ✅ Live code teaching and line progression | Trainer step broadcasts and all viewers stay synchronized |
| 9 | ✅ Controlled Python execution service | Timeout, resource/output limits, errors, and duration verified |
| 10–11 | ✅ Theory, analogy, diagrams, workflow/state simulator | Each lesson exposes a short explanation and deterministic simulator |
| 12 | ✅ Live quizzes and speed scoring | Answer order is server-recorded; duplicate answers prevented; coins correct |
| 13 | ✅ Polls | One participation reward per student; live totals accurate |
| 14 | ✅ Coding/debug challenges | Server evaluates supported challenge rules; fastest completion recorded |
| 15–16 | ✅ Coins and leaderboard | Awards persist; ranks recompute; clients update live |
| 17 | ✅ Top-five rewards | Only trainer can mark reward as given |
| 18 | ✅ Projector mode | No private controls or student contact data appear |
| 19 | ✅ Full real-time synchronization | Socket events trigger authoritative snapshot refreshes |
| 20 | ✅ End-to-end testing, accessibility, performance, polish | Critical journeys, build, console, desktop, and mobile checks pass |

## Day 3 content sequence

1. Can One AI Do Everything?
2. What Is a Multi-Agent System?
3. Build Your First AI Agent
4. Build the Researcher
5. Build the Writer
6. Shared State
7. Build the Reviewer
8. Review and Retry Loop
9. Memory
10. LangGraph
11. Conditional Edges
12. CrewAI
13. Final Multi-Agent Pipeline

## Definition of done for every phase

- The app starts without runtime errors.
- Lint, type checking, and a production build pass.
- Any JSON mutation is verified on disk.
- Trainer, student, and projector views show the same active state where applicable.
- Desktop and mobile layouts are checked.
- Security boundaries added in the phase have tests or a repeatable manual verification.

## Out of scope

Full LMS features, complex authentication, databases, automatic course issuance, arbitrary Python execution, and enterprise administration.
