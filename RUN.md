# Running the system

Requires Docker and Node 22+.

## Start

1. `cp .env.example .env`
2. Set `OPENAI_API_KEY` in `.env` to a real key — required to start.
3. `npm install`
4. `npm run start:clean`
   - brings up Postgres via `docker-compose`
   - waits for it to become healthy
   - runs migrations
   - seeds the fixture data
   - starts the API on `http://localhost:3000`

## Endpoints

Full request/response schemas are at `/api/docs`. Quick reference:

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/docs` | Interactive API docs |
| POST | `/api/products` | Create a product |
| GET | `/api/products` | List / search products |
| GET | `/api/products/:id` | Get a product |
| PATCH | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| POST | `/api/customers` | Create a customer |
| GET | `/api/customers` | List customers |
| GET | `/api/customers/:id` | Get a customer |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Get an order |
| POST | `/api/assistant/chat` | Chat with the shopping assistant |
| POST | `/api/products/import` | Bulk-import products from a pasted link |

## Already running

If Postgres is already up from a previous session:

1. `npm run setup`
2. `npm run start:dev`

## Tests

1. `npm run setup`
2. `npm test`
   - runs against the same Postgres instance `setup` brings up
   - the API server doesn't need to be running
