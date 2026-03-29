# Octagonl API App — Copilot Instructions

This is an Octagonl platform API service built with Express + TypeScript. Follow these conventions when generating or modifying code.

## Project Context
- This API is part of the Octagonl platform ecosystem at `octago.nl`
- Authentication: validates JWTs issued by Microsoft Entra External ID (jose + JWKS)
- Deploys to Azure Container Apps via Docker → ACR → GitHub Actions with OIDC federation
- Database: PostgreSQL via Drizzle ORM
- Platform docs are in the `docs/octagonl-docs/` git submodule

## Authentication Rules
- **Use `oid` claim, NOT `sub`** — `sub` is pairwise in Microsoft Entra (differs between app registrations). `oid` (Object ID) is stable across all Octagonl apps. Store it as `entra_oid`.
- JWT validation: use `jose` library with `createRemoteJWKSet`, always validate issuer, audience, and expiry
- JWKS caching: automatic via `jose`. Never fetch on every request.
- Auth middleware extracts `oid`, `email`, and `name` from validated tokens

## Coding Standards
- TypeScript strict mode (`"strict": true`)
- Node.js 20 LTS, npm as package manager
- ESLint flat config with zero warnings (`--max-warnings 0`)
- Use `.js` extensions in imports (ESM)
- Prefer named exports
- Use `const` by default; `let` only when necessary
- No `any` — use `unknown` and narrow with type guards
- Validate at system boundaries with Zod

## Azure & Infrastructure
- Secrets in Azure Key Vault via Managed Identity — never hardcode secrets
- OIDC federation for CI/CD — no long-lived credentials
- Container Apps use system-assigned managed identity for ACR pull + Key Vault access
- Naming: `{prefix}-octagonl-{app}-{env}-{component}`
- Bicep for IaC in `infra/` directory

## Security
- Helmet for security headers
- CORS strict per-origin allowlist
- Non-root Docker user (UID 1001)
- Never leak stack traces in error responses
- Rate limiting on public endpoints
- Request ID correlation via `X-Request-Id` header
- Structured logging with pino (never log secrets or PII)

## Database (Drizzle ORM)
- Schema in `src/db/schema.ts`
- Migrations in `migrations/` (generated with `drizzle-kit generate`)
- Run migrations: `npm run db:migrate`
- Connection via `pg.Pool` with `DATABASE_URL` env var
- Use UUIDs for primary keys (`uuid().primaryKey().defaultRandom()`)

## File Structure
- Entry point: `src/index.ts`
- Express app setup: `src/app.ts`
- Configuration: `src/config.ts` (Zod-validated env vars)
- Auth middleware: `src/middleware/auth.ts`
- Routes: `src/routes/` (Express Router per resource)
- Database: `src/db/` (schema, connection, migration)
- Services: `src/services/` (business logic)
