import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear fechas
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}): string {
  if (!dateString) return ""

  const date = new Date(dateString)

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return ""

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }

  return new Intl.DateTimeFormat("es-ES", defaultOptions).format(date)
}

// Función para formatear moneda
export function formatCurrency(amount: string | number, currencyCode = "EUR"): string {
  if (amount === null || amount === undefined) return ""

  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  // Verificar si el valor es un número válido
  if (isNaN(numericAmount)) return ""

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

// Función para truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + "..."
}

// Modificar la función getImageUrl para manejar correctamente valores nulos o no string
export function getImageUrl(image) {
  // Si no hay imagen o url, devolver null
  if (!image) return null

  // Si image es un objeto con propiedad url, usar esa propiedad
  if (typeof image === "object" && image.url) {
    const url = image.url
    // Si la URL ya es absoluta, devolverla tal cual
    if (typeof url === "string" && url.startsWith("http")) return url
    // Si es una URL relativa, convertirla a absoluta
    if (typeof url === "string") return `https:${url}`
  }

  // Si image es directamente una string (url)
  if (typeof image === "string") {
    // Si la URL ya es absoluta, devolverla tal cual
    if (image.startsWith("http")) return image
    // Si es una URL relativa, convertirla a absoluta
    return `https:${image}`
  }

  // Si no se puede determinar la URL, devolver null
  return null
}

// Función para generar un slug
export function generateSlug(text: string): string {
  if (!text) return ""

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Eliminar caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Eliminar guiones duplicados
}

// Función para validar email
export function isValidEmail(email: string): boolean {
  if (!email) return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Función para obtener iniciales de un nombre
export function getInitials(name: string): string {
  if (!name) return ""

  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2)
}
