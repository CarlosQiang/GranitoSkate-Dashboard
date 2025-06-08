import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una cantidad monetaria con la moneda especificada
 */
export function formatCurrency(amount: string | number, currencyCode = "EUR"): string {
  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    return "0,00 €"
  }

  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch (error) {
    // Fallback si la moneda no es válida
    return `${numericAmount.toFixed(2)} ${currencyCode}`
  }
}

/**
 * Formatea una fecha en formato español
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return "—"

  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  if (isNaN(date.getTime())) {
    return "Fecha inválida"
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }

  try {
    return new Intl.DateTimeFormat("es-ES", defaultOptions).format(date)
  } catch (error) {
    return date.toLocaleDateString("es-ES")
  }
}

/**
 * Formatea una fecha y hora completa
 */
export function formatDateTime(dateString: string | Date): string {
  return formatDate(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Formatea una fecha relativa (hace X días)
 */
export function formatRelativeDate(dateString: string | Date): string {
  if (!dateString) return "—"

  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Hoy"
  if (diffInDays === 1) return "Ayer"
  if (diffInDays < 7) return `Hace ${diffInDays} días`
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`

  return `Hace ${Math.floor(diffInDays / 365)} años`
}

/**
 * Trunca un texto a una longitud específica
 */
export function truncateText(text: string, maxLength = 100): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convierte un string a slug (URL-friendly)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9 -]/g, "") // Remover caracteres especiales
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Múltiples guiones a uno
    .trim()
}

/**
 * Valida si un email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(num: number | string): string {
  const number = typeof num === "string" ? Number.parseFloat(num) : num
  if (isNaN(number)) return "0"

  return new Intl.NumberFormat("es-ES").format(number)
}

/**
 * Calcula el porcentaje de cambio entre dos valores
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
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
