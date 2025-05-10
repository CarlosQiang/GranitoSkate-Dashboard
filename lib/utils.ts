import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Añadir funciones faltantes
export function formatDate(date: Date | string): string {
  if (!date) return "N/A"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatCurrency(amount: number | string, currency = "EUR"): string {
  if (!amount) return "0,00 €"
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(numAmount)
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function generateSlug(text: string): string {
  if (!text) return ""
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function getInitials(name: string): string {
  if (!name) return ""
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
