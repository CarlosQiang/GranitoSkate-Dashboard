/**
 * Utilidad para verificar que todas las variables de entorno necesarias estén configuradas
 * y que la aplicación esté lista para ser desplegada.
 */

export function checkEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const requiredVariables = [
    "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN",
    "SHOPIFY_ACCESS_TOKEN",
    "NEXTAUTH_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "SHOPIFY_API_URL",
    "NEXTAUTH_URL",
  ]

  const missing = requiredVariables.filter((variable) => !process.env[variable])

  return {
    valid: missing.length === 0,
    missing,
  }
}

export function checkShopifyConnection(): Promise<{ connected: boolean; error?: string }> {
  return fetch("/api/shopify/check")
    .then((res) => res.json())
    .then((data) => {
      return { connected: data.success, error: data.error }
    })
    .catch((error) => {
      return { connected: false, error: error.message }
    })
}

export async function runDeploymentChecks(): Promise<{
  ready: boolean
  environment: { valid: boolean; missing: string[] }
  shopify: { connected: boolean; error?: string }
}> {
  const environment = checkEnvironmentVariables()
  const shopify = await checkShopifyConnection()

  return {
    ready: environment.valid && shopify.connected,
    environment,
    shopify,
  }
}
