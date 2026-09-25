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
| 1 — Catalog Q&A assistant | Not started |
| 2 — Search / order status / place order via chat | Not started |
| 3 — Bulk import via pasted link | Not started |

## Assumptions & exclusions

- No authentication — every endpoint is open.
- No UI — REST/chat API only.
- Single store, no multi-tenancy.
- Prices are exact decimal (`numeric(10,2)`).

## External services

| Provider | Purpose | Used by |
|---|---|---|
| OpenAI| Chat assistant, structured extraction for bulk import | Task 1, 2, 3 |

## Running & testing

See [RUN.md](./RUN.md).

## Docs

See [docs/](./docs).
