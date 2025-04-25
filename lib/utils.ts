import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Función para combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear fechas
export function formatDate(date: string | Date) {
  if (!date) return "N/A"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "dd/MM/yyyy HH:mm", { locale: es })
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return "Fecha inválida"
  }
}

// Función para formatear fechas relativas
export function formatRelativeDate(date: string | Date) {
  if (!date) return "N/A"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
  } catch (error) {
    console.error("Error al formatear fecha relativa:", error)
    return "Fecha inválida"
  }
}

// Función para formatear moneda
export function formatCurrency(amount: string | number, currencyCode = "USD") {
  if (amount === undefined || amount === null) return "N/A"

  try {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currencyCode,
    }).format(numAmount)
  } catch (error) {
    console.error("Error al formatear moneda:", error)
    return "Valor inválido"
  }
}

// Función para truncar texto
export function truncateText(text: string, maxLength = 50) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

// Función para generar un slug
export function generateSlug(text: string) {
  if (!text) return ""
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}
