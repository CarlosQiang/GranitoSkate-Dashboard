export function checkShopifyEnvVars() {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

  const missingVars = []
  if (!shopDomain) missingVars.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN")
  if (!accessToken) missingVars.push("SHOPIFY_ACCESS_TOKEN")

  return {
    isValid: missingVars.length === 0,
    missingVars,
    shopDomain,
    accessToken,
  }
}
