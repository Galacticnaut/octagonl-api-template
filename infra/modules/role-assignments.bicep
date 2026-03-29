// ──────────────────────────────────────────
// RBAC – Key Vault + ACR role assignments
// ──────────────────────────────────────────

@description('Key Vault resource ID')
param keyVaultId string

@description('ACR resource ID')
param acrId string

@description('Container App managed identity principal ID')
param apiPrincipalId string

// Built-in role definition IDs
var keyVaultSecretsUserRole = '4633458b-17de-408a-b874-0445c86b69e6'
var acrPullRole = '7f951dda-4ed3-4680-a7ca-43fe172d538d'

// ── Key Vault ──────────────────────────────
resource keyVaultResource 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: last(split(keyVaultId, '/'))
}

resource apiKvRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVaultId, apiPrincipalId, keyVaultSecretsUserRole)
  scope: keyVaultResource
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRole)
    principalId: apiPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// ── ACR ────────────────────────────────────
resource acrResource 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: last(split(acrId, '/'))
}

resource apiAcrRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acrId, apiPrincipalId, acrPullRole)
  scope: acrResource
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRole)
    principalId: apiPrincipalId
    principalType: 'ServicePrincipal'
  }
}
