// Archivo para verificar y validar variables de entorno

export function checkRequiredEnvVars() {
  const requiredVars = ["NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN", "SHOPIFY_ACCESS_TOKEN"]

  const missingVars = requiredVars.filter((varName) => {
    const value = process.env[varName]
    return !value || value.trim() === ""
  })

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`)
    console.error("Current environment:", {
      NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "defined" : "undefined",
      SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? "defined" : "undefined",
      NODE_ENV: process.env.NODE_ENV,
    })
    return false
  }

  return true
}

// Función para obtener variables de entorno con fallback
export function getEnvVar(name: string, fallback = ""): string {
  const value = process.env[name]
  if (!value) {
    console.warn(`Environment variable ${name} not found, using fallback value`)
    return fallback
  }
  return value
}
