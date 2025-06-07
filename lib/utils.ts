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

/**
 * Formatea una fecha en formato legible
 */
export function formatDate(date: string | Date): string {
  if (!date) return "No disponible"

  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return "Fecha inválida"

  return dateObj.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Formatea una cantidad monetaria con su código de moneda
 */
export function formatCurrency(amount: string | number, currencyCode = "EUR"): string {
  if (!amount && amount !== 0) return "€0,00"

  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (isNaN(numericAmount)) return "€0,00"

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

/**
 * Formatea un número como porcentaje
 */
export function formatPercentage(value: number): string {
  if (!value && value !== 0) return "0%"

  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

/**
 * Trunca un texto a una longitud específica
 */
export function truncateText(text: string, maxLength = 100): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convierte un slug en texto legible
 */
export function slugToText(slug: string): string {
  if (!slug) return ""
  return slug
    .split("-")
    .map((word) => capitalize(word))
    .join(" ")
}

/**
 * Genera un color aleatorio en formato hexadecimal
 */
export function generateRandomColor(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  )
}

/**
 * Valida si una cadena es un email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Formatea un número de teléfono
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""

  // Eliminar todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, "")

  // Formatear según la longitud
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")
  } else if (cleaned.length === 11 && cleaned.startsWith("34")) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, "+$1 $2 $3 $4")
  }

  return phone
}

/**
 * Calcula el tiempo transcurrido desde una fecha
 */
export function timeAgo(date: string | Date): string {
  if (!date) return "Nunca"

  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return "Hace un momento"
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  if (diffInSeconds < 31536000) return `Hace ${Math.floor(diffInSeconds / 2592000)} meses`

  return `Hace ${Math.floor(diffInSeconds / 31536000)} años`
}
