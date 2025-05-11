// Este archivo solo debe importarse desde el servidor (API routes, Server Components, etc.)

// Función para verificar las variables de entorno de Shopify
export const checkShopifyEnvVars = () => {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

  if (!shopDomain || !accessToken) {
    console.error("Shopify environment variables not defined", {
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: shopDomain ? "defined" : "undefined",
      SHOPIFY_ACCESS_TOKEN: accessToken ? "defined" : "undefined",
    })
    return false
  }
  return true
}

// Función para obtener las credenciales de Shopify
export const getShopifyCredentials = () => {
  return {
    shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "",
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "",
  }
}
