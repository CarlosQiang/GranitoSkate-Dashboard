// Función para verificar las variables de entorno necesarias
export function checkRequiredEnvVars() {
  const requiredVars = ["NEXTAUTH_URL", "NEXTAUTH_SECRET", "SHOPIFY_ACCESS_TOKEN", "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN"]

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
  return !!process.env.VERCEL
}
