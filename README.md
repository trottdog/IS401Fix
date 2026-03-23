# BYUconnect

BYUconnect is configured as a monolithic web app for AWS Elastic Beanstalk.

- Frontend: existing React UI preserved through Expo Router + React Native Web
- Backend: Express 5 on Node.js
- Database: PostgreSQL via Knex
- Sessions: persisted in PostgreSQL

There is no Expo Go runtime in the local or deployed monolith flow. Express serves the exported web frontend and the backend from the same process.

## Tech Stack

- Frontend: React 19, Expo Router, React Native Web, TypeScript
- Backend: Express 5, TypeScript
- Data: PostgreSQL, Knex
- Validation: Zod, drizzle-zod

## Project Structure

```text
app/                    Existing UI routes and screens
components/             Shared UI components
lib/                    Frontend utilities, API client, seed data
server/
  index.ts              Express entry point
  routes.ts             Application routes
  storage.ts            Storage abstraction
  db.ts                 Knex/Postgres schema init, seed, and sessions
shared/                 Shared validation and schema types
scripts/                Build and deployment helpers
```

## Prerequisites

- Node.js 20.x
- npm
- PostgreSQL locally for development, then Amazon RDS PostgreSQL in AWS

## Installation

```bash
npm install
cp .env.example .env
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Preferred full Postgres connection string |
| `PGHOST` | Postgres host if not using `DATABASE_URL` |
| `PGPORT` | Postgres port. Default: `5432` |
| `PGDATABASE` | Postgres database name. Default: `byuconnect` |
| `PGUSER` | Postgres user. Default: `postgres` |
| `PGPASSWORD` | Postgres password. Default: `postgres` |
| `PGSSLMODE` | Set to `require` when RDS SSL is required |
| `DATABASE_SSL` | Optional SSL toggle: `true` / `false` |
| `SESSION_SECRET` | Session signing secret. Required outside local dev |
| `HOST` | Express bind host. Default: `127.0.0.1` in development, `0.0.0.0` in production |
| `PORT` | Express port. Default: `5000` |
| `NODE_ENV` | `development` or `production` |
| `TRUST_PROXY` | Optional Express trust proxy override |
| `CORS_ORIGIN` | Optional extra browser origin when not same-origin |

## Local Development

1. Make sure your local PostgreSQL database is already running and already has the required schema.
2. Start the monolith:

```bash
npm run dev
```

3. Open `http://127.0.0.1:5000`.

`knexfile.cjs` reads the same env settings as the app, so `knex` commands use local Postgres in development and RDS-style env vars in deployment.

## Production Build

```bash
npm run build
```

This creates:

- `static-build/` for the web frontend
- `server_dist/` for the bundled Express server

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Build the frontend and start the monolith locally |
| `npm run server:dev` | Alias for `npm run dev` |
| `npm run web:dev` | Alias for `npm run dev` |
| `npm run web:build` | Export the web frontend into `static-build/` |
| `npm run server:build` | Bundle the Express server into `server_dist/` |
| `npm run build` | Build both frontend and backend |
| `npm run server:prod` | Start the bundled production server |
| `npm run db:migrate` | Run Knex migrations with the current environment |
| `npm run db:rollback` | Roll back the latest Knex migration |
| `npm run db:status` | Show Knex migration status |
| `npm run lint` | Run Expo lint |

## AWS Deployment

See [docs/aws-elastic-beanstalk.md](docs/aws-elastic-beanstalk.md) for the Elastic Beanstalk + RDS deployment flow.
