# Architecture

One Nest.js API on Express, one Postgres database, one deployable — no monorepo, no separate services.

## Layout

```
bluebird-commerce/
├── src/
│   ├── modules/
│   │   ├── config/
│   │   ├── database/
│   │   ├── products/
│   │   ├── customers/
│   │   └── orders/
│   ├── health/
│   ├── openapi/
│   ├── validation/
│   └── common/
├── tests/
├── scripts/
├── fixtures/
├── drizzle/
├── docs/
└── transcripts/
```

## Modules

- `products`
- `customers`
- `orders`
- `health`
