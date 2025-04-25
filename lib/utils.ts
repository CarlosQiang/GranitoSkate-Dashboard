import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatCurrency(amount: string, currency = "EUR") {
  const value = Number.parseFloat(amount)
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(value)
}

export function truncate(str: string, length: number) {
  if (!str) return ""
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

export function generateMetaDescription(text: string, maxLength = 160) {
  if (!text) return ""

  // Eliminar etiquetas HTML
  const plainText = text.replace(/<[^>]*>/g, "")

  // Truncar a la longitud máxima
  return truncate(plainText, maxLength)
}
