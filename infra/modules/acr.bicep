// ──────────────────────────────────────────
// Azure Container Registry
// ──────────────────────────────────────────

@description('Resource name prefix')
param prefix string

@description('Azure region')
param location string

@description('SKU')
@allowed(['Basic', 'Standard', 'Premium'])
param sku string = 'Basic'

var acrName = replace('acr${prefix}', '-', '')

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

output acrId string = acr.id
output acrName string = acr.name
output acrLoginServer string = acr.properties.loginServer
