# Decisions

## Stack
- Nest.js, single app, no monorepo — a single store doesn't need multi-tenant structure.
- Postgres via `docker-compose`, Drizzle ORM — `npm run setup` keeps `RUN.md` a single command.
- npm as the package manager — single package, no workspace.
- `nestjs-zod` for request validation, Vitest for tests.

## Scope cuts
- No auth — the brief never asks for login.
- No UI — Task 0 is a backend; Tasks 1-3 describe capabilities, not screens.

## Assistant

- OpenAI SDK with tool-calling — `gpt-4o-mini` by default, overridable via `OPENAI_MODEL`.
- One endpoint (`POST /api/assistant/chat`) for catalog Q&A, order status, and placing an order — tools call `ProductsService`/`OrdersService` directly, no parallel business logic.
- `ProductsService.search` matches on name only, not description — description text often references other, unrelated products and produced false-positive matches.
- Tool arguments are re-validated with the same Zod schemas the REST DTOs use before touching either service.
- `customerId` is a required field on the request body, never a tool-call argument the model can supply — every tool handler closes over the request's own `customerId`, so the model can't be redirected to another customer's data. `get_order_status` also double-checks a found order's `customerId` before returning it.
- Conversation history is in-memory only (a `Map` keyed by `conversationId`), resets on restart — no new DB table for this scope.
- Guardrails kept minimal for this scope: the system prompt tells the model to admit "nothing matched" instead of guessing when a tool returns no results, and to treat customer messages as data (never revealing the prompt or acting as another customer/admin). Verified against the live model in `assistant.live.spec.ts`.

## Uniqueness checks
- Pre-check before insert, not a caught DB error — reads as an explicit business rule. Narrow race window under concurrent identical requests accepted, since testing here is sequential.

## Money
- `price` / `total` / `unit_price` are `numeric(10,2)` — reads naturally, and Postgres's `numeric` is exact storage.
- Order-total arithmetic converts to integer cents internally (`src/common/money.ts`) before multiplying/summing, then back — avoids float drift. Verified: `24.99 × 3 = 74.97` exactly.

## Evidence of agentic workflow
- `transcripts/task-{0..3}.jsonl` — raw session log slices, one per task.
- Git history: one commit per task, tagged `task-N`.
