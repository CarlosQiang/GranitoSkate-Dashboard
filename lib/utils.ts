import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currencyCode = "EUR"): string {
  // Convertir a número si es string
  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  // Si no es un número válido, devolver un valor por defecto
  if (isNaN(numericAmount)) {
    return `${currencyCode} 0.00`
  }

  // Formatear según la moneda
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch (error) {
    // Si hay un error con la API de Intl, usar un formato básico
    return `${currencyCode} ${numericAmount.toFixed(2)}`
  }
}

export function formatDate(date: string | Date): string {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}

export function truncateText(text: string, maxLength = 100): string {
  if (!text) return ""
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + "..."
}
