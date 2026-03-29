// ──────────────────────────────────────────────────────────
// Octagonl API Template – Container Apps + ACR + PostgreSQL
// ──────────────────────────────────────────────────────────
targetScope = 'resourceGroup'

@description('Short app identifier (lowercase, no spaces)')
param appName string

@description('Environment: dev | prod')
@allowed(['dev', 'prod'])
param env string

@description('Azure region for resources')
param location string = resourceGroup().location

@description('PostgreSQL administrator login name')
param pgAdminLogin string = 'pgadmin'

@description('PostgreSQL administrator password')
@secure()
param pgAdminPassword string

var prefix = '${appName}-${env}'

// ── Monitoring ─────────────────────────────────────
module monitoring './modules/monitoring.bicep' = {
  name: '${prefix}-monitoring'
  params: {
    prefix: prefix
    location: location
  }
}

// ── ACR ────────────────────────────────────────────
module acr './modules/acr.bicep' = {
  name: '${prefix}-acr'
  params: {
    prefix: prefix
    location: location
  }
}

// ── Key Vault ──────────────────────────────────────
module keyvault './modules/keyvault.bicep' = {
  name: '${prefix}-kv'
  params: {
    prefix: prefix
    location: location
  }
}

// ── PostgreSQL ─────────────────────────────────────
module postgres './modules/postgres.bicep' = {
  name: '${prefix}-pg'
  params: {
    prefix: prefix
    location: location
    adminLogin: pgAdminLogin
    adminPassword: pgAdminPassword
  }
}

// ── Container Apps ─────────────────────────────────
module containerApps './modules/container-apps.bicep' = {
  name: '${prefix}-ca'
  params: {
    prefix: prefix
    location: location
    logAnalyticsId: monitoring.outputs.workspaceId
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    keyVaultUri: keyvault.outputs.vaultUri
    acrLoginServer: acr.outputs.acrLoginServer
  }
}

// ── RBAC ───────────────────────────────────────────
module roles './modules/role-assignments.bicep' = {
  name: '${prefix}-roles'
  params: {
    keyVaultId: keyvault.outputs.vaultId
    acrId: acr.outputs.acrId
    apiPrincipalId: containerApps.outputs.apiPrincipalId
  }
}

// ── Outputs ────────────────────────────────────────
output acrLoginServer string = acr.outputs.acrLoginServer
output containerAppName string = containerApps.outputs.containerAppName
output containerAppFqdn string = containerApps.outputs.containerAppFqdn
output keyVaultUri string = keyvault.outputs.vaultUri
output postgresHost string = postgres.outputs.host
output logAnalyticsWorkspaceId string = monitoring.outputs.workspaceId
