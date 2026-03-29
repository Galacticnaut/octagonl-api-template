# Octagonl API Template

An Express + TypeScript API template pre-configured with:

- **JWT validation** against Microsoft Entra External ID (jose + JWKS)
- **PostgreSQL** via Drizzle ORM with migrations
- **Docker** → ACR → Azure Container Apps deployment
- **GitHub Actions** CI/CD with OIDC federation (no long-lived secrets)
- **Copilot instructions** for Octagonl coding standards, auth patterns, and security rules

## Quick start

```bash
# 1. Use this template on GitHub
gh repo create my-org/my-api --template Galacticnaut/octagonl-api-template --private --clone
cd my-api

# 2. Install dependencies
npm install

# 3. Copy env file and fill in values
cp .env.example .env

# 4. Start dev server (with hot reload)
npm run dev
```

## Project structure

```
src/
  index.ts                 # Server entry point
  app.ts                   # Express app setup (middleware, routes, error handling)
  config.ts                # Zod-validated environment configuration
  middleware/
    auth.ts                # JWT validation (jose, JWKS, oid claim)
    request-logger.ts      # Structured logging (pino-http, request ID correlation)
  routes/
    health.ts              # GET /healthz (unauthenticated)
    example.ts             # GET /v1/example (authenticated — replace with your routes)
  db/
    index.ts               # Database connection (Drizzle + pg.Pool)
    schema.ts              # Drizzle ORM schema (replace with your tables)
    migrate.ts             # Migration runner
  services/
    logger.ts              # Pino logger instance
migrations/                # Drizzle-kit generated SQL migrations
infra/
  main.bicep               # Azure deployment orchestrator
  modules/
    acr.bicep              # Azure Container Registry
    container-apps.bicep   # Container Apps Environment + App
    keyvault.bicep         # Azure Key Vault
    monitoring.bicep       # Log Analytics + App Insights
    postgres.bicep         # PostgreSQL Flexible Server
    role-assignments.bicep # RBAC for Managed Identity → KV + ACR
```

## Authentication

This template validates JWTs issued by Microsoft Entra External ID using the `jose` library.

Key rules:
- Use the `oid` claim (not `sub`) as the stable user identity
- JWKS is fetched from the OIDC discovery endpoint and cached automatically
- Issuer, audience, and expiry are always validated
- Auth middleware exposes `req.user.oid`, `req.user.email`, `req.user.name`

See [SETUP.md](SETUP.md) for app registration instructions.

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 8080) |
| `NODE_ENV` | `development` / `production` / `test` |
| `DATABASE_URL` | PostgreSQL connection string |
| `OIDC_ISSUER` | Entra External ID issuer URL |
| `OIDC_AUDIENCE` | Expected JWT audience |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `AZURE_KEYVAULT_URL` | Key Vault URI (optional, for Azure secrets) |
| `LOG_LEVEL` | Pino log level (default: `info`) |

## Database

Uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

```bash
# Edit schema in src/db/schema.ts, then:
npm run db:generate    # Generate migration files
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio
```

## Deployment

Deployments use GitHub Actions with OIDC federation to Azure (no long-lived secrets).

### Pipeline: Docker → ACR → Container Apps

1. Build Docker image
2. Push to Azure Container Registry
3. Update Container App with new image

### Required GitHub secrets

| Secret | Description |
|---|---|
| `AZURE_CLIENT_ID` | Service principal client ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `ACR_LOGIN_SERVER` | ACR login server (e.g. `myacr.azurecr.io`) |

### Manual infra deployment

```bash
az deployment group create \
  -g rg-octagonl-myapi-dev \
  -f infra/main.bicep \
  -p appName=myapi env=dev pgAdminPassword='<secure-password>'
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm test` | Run tests (vitest) |
| `npm run typecheck` | Type-check without emit |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |

## License

Proprietary – Octagonl B.V.
