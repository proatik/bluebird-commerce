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
| 2 — Search / order status / place order via chat | Not started |
| 3 — Bulk import via pasted link | Not started |

## Assumptions & exclusions

- No authentication — every endpoint is open.
- No UI — REST/chat API only.
- Single store, no multi-tenancy.
- Prices are exact decimal (`numeric(10,2)`).
- Product search matches on name only, not description.
- Assistant conversation history is in-memory only, resets on server restart.
- Assistant guardrails kept minimal for this scope — see [`docs/decisions.md`](./docs/decisions.md).

## External services

| Provider | Purpose | Used by |
|---|---|---|
| OpenAI | Chat assistant tool-calling | Task 1 |

## Running & testing

See [RUN.md](./RUN.md).

## Docs

See [docs/](./docs).
