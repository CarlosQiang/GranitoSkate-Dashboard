import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para obtener la URL base de la API
export function getApiUrl(path = ""): string {
  // En el cliente, usar la URL actual del navegador
  if (typeof window !== "undefined") {
    const baseUrl = window.location.origin
    return `${baseUrl}${path}`
  }

  // En el servidor, usar las variables de entorno en orden de prioridad
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"

  return `${baseUrl}${path}`
}

// Función alternativa más simple para el cliente
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}
