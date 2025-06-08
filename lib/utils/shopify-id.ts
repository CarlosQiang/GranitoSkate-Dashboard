/**
 * Extrae el ID numérico de un GID de Shopify
 * @param gid - El GID completo de Shopify (ej: "gid://shopify/DiscountAutomaticNode/2054072041736")
 * @returns El ID numérico como string (ej: "2054072041736")
 */
export function extractShopifyId(gid: string): string {
  if (!gid) return ""

  // Si ya es un ID numérico, devolverlo tal como está
  if (/^\d+$/.test(gid)) {
    return gid
  }

  // Si es un GID de Shopify, extraer el ID numérico
  if (gid.startsWith("gid://shopify/")) {
    const parts = gid.split("/")
    return parts[parts.length - 1] || ""
  }

  // Si tiene formato de URL, extraer el último segmento
  if (gid.includes("/")) {
    const parts = gid.split("/")
    const lastPart = parts[parts.length - 1]
    if (/^\d+$/.test(lastPart)) {
      return lastPart
    }
  }

  return gid
}

/**
 * Convierte un ID numérico a un GID de Shopify
 * @param id - El ID numérico
 * @param type - El tipo de recurso (ej: "DiscountAutomaticNode")
 * @returns El GID completo de Shopify
 */
export function createShopifyGid(id: string, type = "DiscountAutomaticNode"): string {
  if (id.startsWith("gid://shopify/")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}
