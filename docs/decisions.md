# Decisions

## Stack
- Nest.js, single app, no monorepo — a single store doesn't need multi-tenant structure.
- Postgres via `docker-compose`, Drizzle ORM — `npm run setup` keeps `RUN.md` a single command.
- npm as the package manager — single package, no workspace.
- `nestjs-zod` for request validation, Vitest for tests.

## Scope cuts
- No auth — the brief never asks for login.
- No UI — Task 0 is a backend; Tasks 1-3 describe capabilities, not screens.

## Uniqueness checks
- Pre-check before insert, not a caught DB error — reads as an explicit business rule. Narrow race window under concurrent identical requests accepted, since testing here is sequential.

## Money
- `price` / `total` / `unit_price` are `numeric(10,2)` — reads naturally, and Postgres's `numeric` is exact storage.
- Order-total arithmetic converts to integer cents internally (`src/common/money.ts`) before multiplying/summing, then back — avoids float drift. Verified: `24.99 × 3 = 74.97` exactly.

## Evidence of agentic workflow
- `transcripts/task-{0..3}.jsonl` — raw session log slices, one per task.
- Git history: one commit per task, tagged `task-N`.
