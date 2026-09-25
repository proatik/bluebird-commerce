# BluBird Interactive — Assessment Submission

Minimal e-commerce backend, built across 4 sequential tasks.

## Structure

| Path | What it is |
|---|---|
| [`src/`](./src) | Nest.js API — modules, health, openapi, validation, common |
| [`tests/`](./tests) | Vitest test suites |
| [`fixtures/`](./fixtures) | Seed data |
| [`drizzle/`](./drizzle) | SQL migrations |
| [`scripts/`](./scripts) | Setup/seed scripts |
| [`docs/`](./docs) | Architecture, schema, decisions |

## Stack

Nest.js · PostgreSQL · Drizzle ORM · Zod · Vitest · npm

## Task status

| Task | Status |
|---|---|
| 0 — Foundation (products, customers, orders) | Done |
| 1 — Catalog Q&A assistant | Done |
| 2 — Search / order status / place order via chat | Done |
| 3 — Bulk import via pasted link | Done |

## Assumptions & exclusions

- No authentication — every endpoint is open.
- No UI — REST/chat API only.
- Single store, no multi-tenancy.
- Prices are exact decimal (`numeric(10,2)`).
- Product search matches on name only, not description.
- Assistant conversation history is in-memory only, resets on server restart.
- `customerId` is a required chat field, never a model-suppliable tool argument — see [`docs/decisions.md`](./docs/decisions.md).
- Assistant guardrails kept minimal for this scope — see [`docs/decisions.md`](./docs/decisions.md).
- Bulk import's URL-fetch guard blocks `localhost`/private-IP literals only, not DNS-rebinding or redirect targets — see [`docs/decisions.md`](./docs/decisions.md).

## Time spent

Self-timed. The figures below are wall-clock between this session's own timestamps (start time + each task's commit time) — not adjusted for breaks, so they're an upper bound on active time, not a verified one. At least one real break happened between Task 0 and Tasks 1/2 that isn't subtracted out below.

| Task | Wall-clock |
|---|---|
| 0 — Foundation | ~5h 15m |
| 1 + 2 — Assistant (built together, split into separate commits afterward) | ~1h 55m |
| 3 — Bulk import | ~1h 5m |

## External services

| Provider | Purpose | Used by |
|---|---|---|
| OpenAI | Chat assistant tool-calling, bulk-import extraction | Task 1, 2, 3 |

## Running & testing

See [RUN.md](./RUN.md).

## Docs

See [docs/](./docs).
