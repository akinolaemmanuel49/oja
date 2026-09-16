# oja-backend — API Server

FastAPI backend for the Ọjà multi-tenant e-commerce platform. Hand-written SQL
(no ORM) with Postgres Row-Level Security for tenant isolation, Alembic migrations,
and HTTP-only cookie sessions.

## Stack

Python + FastAPI + PostgreSQL, with `uv` for dependency management.

## Layout

```
src/
  main.py                 # FastAPI app entry point
  core/                   # config, security, sessions, dependencies, exceptions
  database/               # engine + session setup
  analytics/              # dashboard analytics
  auth/                   # authentication (cookie sessions, sessions endpoint)
  groups/                 # user groups + group membership
  permissions/            # permission grants/revokes + assignment
  orders/                 # orders (schema/service/router)
  products/               # product + variant CRUD
  storefronts/            # storefront CRUD + public renderer service
  storefront_products/    # product placement on storefronts
  users/                  # user CRUD + pagination
  middleware/             # wildcard CORS middleware
alembic/                  # migrations (initial schema, RLS + tenant isolation, seed permissions)
scripts/                  # utility scripts
```

## Development

```bash
cd oja-backend
uv sync
uv run alembic upgrade head
uv run uvicorn src.main:app --reload
```

Or via Docker (from the repository root):

```bash
docker compose up api
```

API documentation is served at `http://localhost:8000/docs` (Swagger UI).

## Data Model

Multi-tenant with a single isolation root (`tenants`). See
[docs/DATABASE_RELATIONSHIPS.md](../docs/DATABASE_RELATIONSHIPS.md) for the full
entity-relationship map, foreign key constraints, and permission inheritance paths.