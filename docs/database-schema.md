# Database Schema

Postgres, via Drizzle ORM. Schema source: [`src/modules/database/schemas/`](../src/modules/database/schemas).

## Tables

```
products
  id            text (uuid)    pk
  name          text
  description   text           default ''
  category      varchar(100)   default 'general'
  price         numeric(10,2)  exact decimal, e.g. 24.99
  currency      varchar(3)     default 'USD'
  sku           varchar(64)    unique
  stock         integer        default 0
  image_url     text           nullable
  created_at    timestamptz
  updated_at    timestamptz
```

```
customers
  id            text (uuid)    pk
  name          text
  email         text           unique
  created_at    timestamptz
```

```
orders
  id            text (uuid)    pk
  customer_id   text           fk -> customers.id
  status        text           always 'pending' today, no enum constraint yet
  total         numeric(10,2)  sum of its order_items, default 0
  created_at    timestamptz
```

```
order_items
  id            text (uuid)    pk
  order_id      text           fk -> orders.id
  product_id    text           fk -> products.id
  quantity      integer
  unit_price    numeric(10,2)  price snapshot at order time
```

## Relationships

```
customers
  └──1:N──▶ orders
              └──1:N──▶ order_items
                          └──N:1──▶ products
```

- An order belongs to exactly one customer.
- An order has one or more order_items; each order_item references exactly one product.
- `order_items.unit_price` is a snapshot, not a live join to `products.price` — order history stays accurate if a product's price changes later.
