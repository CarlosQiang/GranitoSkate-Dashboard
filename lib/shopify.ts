// Archivo simplificado para evitar dependencias de graphql-request
export async function checkShopifyConnection() {
  return { connected: true, shopName: "Demo Shop" }
}

export async function fetchShopifyData() {
  return { data: {} }
}
