import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear fechas
export function formatDate(dateString: string | Date | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!dateString) return "-"

  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return "-"

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }

  return new Intl.DateTimeFormat("es-ES", defaultOptions).format(date)
}

// Función para formatear moneda
export function formatCurrency(amount: string | number | undefined, currency = "EUR"): string {
  if (amount === undefined || amount === null) return "-"

  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  // Verificar si el número es válido
  if (isNaN(numAmount)) return "-"

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(numAmount)
}

// Función para truncar texto
export function truncateText(text: string, maxLength = 50): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Función para generar un slug
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
}

// Función para generar un ID único
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
