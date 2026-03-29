# Setup Guide

Step-by-step instructions to configure this template for your Octagonl API service.

## 1. Create the GitHub repository

```bash
gh repo create my-org/my-api \
  --template Galacticnaut/octagonl-api-template \
  --private --clone
cd my-api
git submodule update --init
```

## 2. Register the API in Microsoft Entra External ID

1. Go to **Azure Portal → Microsoft Entra External ID → App registrations**
2. Click **New registration**
   - Name: `my-api-dev`
   - Supported account types: **Accounts in this organizational directory only**
3. Under **Expose an API**:
   - Set Application ID URI: `api://<your-client-id>`
   - Add a scope: `access` (admin consent)
4. Copy the **Application ID URI** → this is your `OIDC_AUDIENCE`

## 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=8080
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapi
OIDC_ISSUER=https://login.octago.nl/<tenant-id>/v2.0
OIDC_AUDIENCE=api://<your-client-id>
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=debug
```

## 4. Set up PostgreSQL locally

```bash
# Using Docker
docker run -d --name myapi-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=myapi \
  -p 5432:5432 \
  postgres:16-alpine

# Run migrations
npm run db:migrate
```

## 5. Set up OIDC federation for GitHub Actions

Create a federated credential so GitHub Actions can deploy without secrets:

```bash
az ad app federated-credential create \
  --id <service-principal-object-id> \
  --parameters '{
    "name": "my-api-github",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:my-org/my-api:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

## 6. Configure GitHub secrets

```bash
gh secret set AZURE_CLIENT_ID --body "<client-id>"
gh secret set AZURE_TENANT_ID --body "<tenant-id>"
gh secret set AZURE_SUBSCRIPTION_ID --body "<subscription-id>"
gh secret set ACR_LOGIN_SERVER --body "<acr-name>.azurecr.io"
```

## 7. Deploy infrastructure

```bash
# Create resource group
az group create -n rg-octagonl-myapi-dev -l westeurope

# Deploy Bicep
az deployment group create \
  -g rg-octagonl-myapi-dev \
  -f infra/main.bicep \
  -p appName=myapi env=dev pgAdminPassword='<secure-password>'
```

## 8. Update your schema

1. Edit `src/db/schema.ts` with your tables
2. Generate migrations: `npm run db:generate`
3. Run migrations: `npm run db:migrate`
4. Add routes in `src/routes/`
5. Register routes in `src/app.ts`

## 9. Deploy

Push to `main` and the CI/CD pipeline will build the Docker image, push to ACR, and update the Container App.

```bash
git add -A && git commit -m "Initial API setup" && git push
```

## 10. Verify

```bash
# Health check
curl https://<container-app-fqdn>/healthz

# Authenticated request (get a token first)
curl -H "Authorization: Bearer <token>" https://<container-app-fqdn>/v1/example
```
