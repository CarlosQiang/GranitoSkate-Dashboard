export function cleanId(id: string | undefined): string {
  if (!id) return ""
  if (typeof id === "string" && id.includes("/")) {
    return id.split("/").pop() || ""
  }
  return id
}

export function getImageUrl(product: any): string | null {
  if (!product) return null

  if (product.imagen) return product.imagen
  if (product.image) return typeof product.image === "string" ? product.image : product.image?.url || product.image?.src

  if (product.featuredImage) return product.featuredImage.url || product.featuredImage.src

  if (product.imagenes && product.imagenes.length > 0) {
    return product.imagenes[0].src || product.imagenes[0].url
  }

  if (product.images && product.images.length > 0) {
    return typeof product.images[0] === "string" ? product.images[0] : product.images[0]?.url || product.images[0]?.src
  }

  if (product.images && product.images.edges && product.images.edges.length > 0) {
    return product.images.edges[0].node.url || product.images.edges[0].node.src
  }

  return null
}

export function formatCurrency(value: number, currency = "EUR"): string {
  try {
    const currencyCode = currency || "EUR"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currencyCode,
    }).format(value)
  } catch (error) {
    console.error("Error al formatear moneda:", error)
    return `${value.toFixed(2)} €`
  }
}

export function formatDate(date: string | Date): string {
  try {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return "Fecha inválida"
  }
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768
}

export function isTabletDevice(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

export function isDesktopDevice(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 1024
}
