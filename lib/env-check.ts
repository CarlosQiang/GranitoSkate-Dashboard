// Función para verificar las variables de entorno necesarias
export function checkRequiredEnvVars() {
  const requiredVars = ["NEXTAUTH_SECRET", "SHOPIFY_ACCESS_TOKEN", "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN"]

  // En desarrollo necesitamos NEXTAUTH_URL, en producción Vercel lo configura automáticamente
  if (process.env.NODE_ENV !== "production") {
    requiredVars.push("NEXTAUTH_URL")
  }

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`)
    return {
      success: false,
      missingVars,
    }
  }

  return {
    success: true,
    missingVars: [],
  }
}

// Función para obtener el valor de una variable de entorno con un valor por defecto
export function getEnvVar(name: string, defaultValue = ""): string {
  const value = process.env[name]
  if (!value) {
    console.warn(`Environment variable ${name} not found, using default value`)
    return defaultValue
  }
  return value
}

// Función para verificar si estamos en producción
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

// Función para verificar si estamos en desarrollo
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

// Función para verificar si estamos en Vercel
export function isVercel(): boolean {
  return !!process.env.VERCEL || !!process.env.NEXT_PUBLIC_VERCEL_ENV
}

// Función para obtener la URL base de la aplicación
export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  // En Vercel, usamos la URL generada automáticamente
  if (isVercel()) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback para desarrollo local
  return "http://localhost:3000"
}
