import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatCurrency(amount: string | number, currencyCode = "EUR"): string {
  if (amount === null || amount === undefined) return ""

  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  // Verificar si el monto es un número válido
  if (isNaN(numericAmount)) return ""

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text

  return text.slice(0, maxLength) + "..."
}

export function slugify(text: string): string {
  if (!text) return ""

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Eliminar caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Eliminar guiones duplicados
    .trim() // Eliminar espacios al inicio y final
}

export function generateSlug(text: string): string {
  if (!text) return ""

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Eliminar caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Eliminar guiones duplicados
    .trim() // Eliminar espacios al inicio y final
}

export function getImageUrl(src: string | null | undefined, fallback = "/placeholder.svg"): string {
  if (!src) return fallback

  // Si ya es una URL completa, devolverla
  if (src.startsWith("http")) return src

  // Si es una ruta relativa, asegurarse de que comience con /
  return src.startsWith("/") ? src : `/${src}`
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Regex básico para validar números de teléfono internacionales
  const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/
  return phoneRegex.test(phone)
}

export function getInitials(name: string): string {
  if (!name) return ""

  const parts = name.split(" ")
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  if (!originalPrice || !discountedPrice || originalPrice <= 0) return 0

  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
  return Math.round(discount)
}

export function formatShopifyId(id: string, type: string): string {
  if (id.includes("gid://shopify/")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}
