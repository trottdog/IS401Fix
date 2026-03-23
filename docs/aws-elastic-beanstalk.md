# AWS Elastic Beanstalk Deployment Guide

This project deploys to AWS as a monolithic React + Express + PostgreSQL app.

- Elastic Beanstalk runs the Node.js app
- The app serves the exported web frontend from `static-build/`
- PostgreSQL lives in Amazon RDS
- Sessions are stored in PostgreSQL

There is no Expo Go deployment path in production.

## Recommended Architecture

- One Elastic Beanstalk Node.js 20 environment
- One Amazon RDS PostgreSQL database
- One Application Load Balancer with HTTPS

## Environment Variables

Set these in the Elastic Beanstalk environment configuration:

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | Set to `production` |
| `SESSION_SECRET` | Yes | Long random secret |
| `DATABASE_URL` | Preferred | Full RDS Postgres connection string |
| `PGHOST` / `PGPORT` / `PGDATABASE` / `PGUSER` / `PGPASSWORD` | Alternative | Use if not using `DATABASE_URL` |
| `PGSSLMODE` | Recommended | Set to `require` if your RDS setup expects SSL |
| `DATABASE_SSL` | Optional | Alternative SSL toggle |
| `PORT` | No | Beanstalk usually sets this automatically |
| `HOST` | No | Leave unset unless needed |
| `TRUST_PROXY` | No | Leave unset unless you need to override it |

## Runtime Files

### Procfile

```text
web: npm run server:prod
```

### Build Hook

The repository includes `.platform/hooks/prebuild/01_build_app.sh`:

```bash
#!/bin/bash
set -euo pipefail

npm run build
```

### EB Ignore

The repository includes `.ebignore` so local artifacts stay out of the upload bundle.

## Deployment Flow

For each deploy, Elastic Beanstalk should:

1. Install dependencies with `npm install`
2. Run `.platform/hooks/prebuild/01_build_app.sh`
3. Start the app with the `Procfile` command
4. Serve the frontend and server routes from the same Node process

## Database Initialization

On first startup, the app will:

1. Connect to PostgreSQL
2. Create required tables if they do not exist
3. Create the `sessions` table
4. Seed the initial BYUconnect data if the database is empty

## Create the Environment

1. Create a Node.js 20 Elastic Beanstalk environment.
2. Provision an Amazon RDS PostgreSQL instance.
3. Ensure the Beanstalk security group can reach RDS on port `5432`.
4. Set the environment variables listed above.
5. Deploy the repository as the application source bundle.

## Health Checks

After deployment, verify:

1. `/` loads the web app
2. `/api/buildings` returns data
3. Login and registration work
4. Sessions persist after an app restart

## Troubleshooting

### 502 Bad Gateway

Check Beanstalk logs and confirm:

- `npm run build` completed successfully
- `npm run server:prod` started on the provided `PORT`
- The app can connect to Postgres

### Database Connection Failures

Verify:

- RDS security groups allow inbound traffic from Beanstalk
- `DATABASE_URL` or the `PG*` variables are correct
- SSL settings match your RDS configuration

### Sessions Do Not Persist

Verify:

- The app is pointing at the correct Postgres database
- The `sessions` table exists
- The database user has read/write access

### Deployment Timeout

This repository includes `.ebextensions/01-deployment-timeouts.config` with a longer timeout for instance-side builds. If the environment still times out, update the timeout directly in Elastic Beanstalk as well.
