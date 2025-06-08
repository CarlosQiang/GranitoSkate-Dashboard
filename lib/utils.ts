import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Obtiene la URL base de la aplicación, funcionando tanto en desarrollo como en producción
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // En el cliente, usar window.location.origin
    return window.location.origin
  }

  // En el servidor, usar las variables de entorno
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback a localhost
  return "http://localhost:3000"
}

/**
 * Construye una URL completa para una ruta de API
 */
export function getApiUrl(path: string) {
  const baseUrl = getBaseUrl()
  const apiPath = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}${apiPath}`
}
