import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currencyCode = "EUR") {
  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    return "0,00 €"
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode,
  }).format(numericAmount)
}

export function formatDate(dateString: string) {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return dateString
  }
}

export function truncateText(text: string, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

// Función auxiliar para obtener la URL de la imagen
export function getImageUrl(product: any) {
  if (!product) return null

  // Intentar obtener la imagen de diferentes propiedades
  if (product.imagen) return product.imagen
  if (product.image) return typeof product.image === "string" ? product.image : product.image?.url || product.image?.src

  if (product.featuredImage) return product.featuredImage.url || product.featuredImage.src

  if (product.imagenes && product.imagenes.length > 0) {
    return product.imagenes[0].src || product.imagenes[0].url
  }

  if (product.images && product.images.length > 0) {
    if (Array.isArray(product.images)) {
      return typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0]?.url || product.images[0]?.src
    }
  }

  // Si hay edges en las imágenes (formato GraphQL)
  if (product.images && product.images.edges && product.images.edges.length > 0) {
    return product.images.edges[0].node.url || product.images.edges[0].node.src
  }

  return null
}

// Función para extraer el ID limpio
export function cleanId(id: string) {
  if (!id) return ""
  if (typeof id === "string" && id.includes("/")) {
    return id.split("/").pop()
  }
  return id
}
