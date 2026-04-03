// ──────────────────────────────────────────────────────────
// Octagonl API Template – Container Apps + ACR + PostgreSQL
// Uses shared infrastructure modules from octagonl-shared
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
param administratorLogin string = 'pgadmin'

@description('PostgreSQL administrator password')
@secure()
param administratorLoginPassword string

var baseName = '${appName}-${env}'
var tags = {
  app: appName
  environment: env
  managedBy: 'bicep'
}

// ── Monitoring ─────────────────────────────────────
module monitoring '../shared/infra/modules/monitoring.bicep' = {
  name: '${baseName}-monitoring'
  params: {
    baseName: baseName
    location: location
    tags: tags
  }
}

// ── ACR ────────────────────────────────────────────
module acr '../shared/infra/modules/acr.bicep' = {
  name: '${baseName}-acr'
  params: {
    baseName: baseName
    location: location
    tags: tags
  }
}

// ── Key Vault ──────────────────────────────────────
module keyvault '../shared/infra/modules/keyvault.bicep' = {
  name: '${baseName}-kv'
  params: {
    baseName: baseName
    location: location
    tags: tags
  }
}

// ── PostgreSQL ─────────────────────────────────────
module postgres '../shared/infra/modules/postgres.bicep' = {
  name: '${baseName}-pg'
  params: {
    baseName: baseName
    location: location
    tags: tags
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    databaseName: '${appName}_db'
  }
}

// ── Container Apps ─────────────────────────────────
module containerApps '../shared/infra/modules/container-apps.bicep' = {
  name: '${baseName}-ca'
  params: {
    baseName: baseName
    location: location
    tags: tags
    logAnalyticsId: monitoring.outputs.logAnalyticsId
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    keyVaultUri: keyvault.outputs.keyVaultUri
    acrLoginServer: acr.outputs.acrLoginServer
  }
}

// ── RBAC ───────────────────────────────────────────
module roles '../shared/infra/modules/role-assignments.bicep' = {
  name: '${baseName}-roles'
  params: {
    keyVaultId: keyvault.outputs.keyVaultId
    acrId: acr.outputs.acrId
    apiPrincipalId: containerApps.outputs.apiPrincipalId
  }
}

// ── Outputs ────────────────────────────────────────
output acrLoginServer string = acr.outputs.acrLoginServer
output containerAppName string = containerApps.outputs.apiAppName
output containerAppFqdn string = containerApps.outputs.apiAppFqdn
output keyVaultUri string = keyvault.outputs.keyVaultUri
output postgresHost string = postgres.outputs.postgresFqdn
output logAnalyticsWorkspaceId string = monitoring.outputs.logAnalyticsId
