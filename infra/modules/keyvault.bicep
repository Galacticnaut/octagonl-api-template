// ──────────────────────────────────────────
// Azure Key Vault
// ──────────────────────────────────────────

@description('Resource name prefix')
param prefix string

@description('Azure region')
param location string

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kv-${prefix}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 30
  }
}

output vaultId string = keyVault.id
output vaultUri string = keyVault.properties.vaultUri
output vaultName string = keyVault.name
