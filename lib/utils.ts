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

export function formatCurrency(amount: string, currencyCode: string) {
  const value = Number.parseFloat(amount)
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode,
  }).format(value)
}

export function truncateText(text: string, maxLength: number) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getInitials(name: string) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function getStatusColor(status: string) {
  const statusMap: Record<string, string> = {
    ACTIVE: "bg-green-500",
    DRAFT: "bg-gray-500",
    ARCHIVED: "bg-red-500",
    PAID: "bg-green-500",
    PENDING: "bg-yellow-500",
    REFUNDED: "bg-red-500",
    FULFILLED: "bg-green-500",
    UNFULFILLED: "bg-yellow-500",
    PARTIALLY_FULFILLED: "bg-blue-500",
  }

  return statusMap[status] || "bg-gray-500"
}
