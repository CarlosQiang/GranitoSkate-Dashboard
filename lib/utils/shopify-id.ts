/**
 * Convierte un GID de Shopify a un ID limpio para URLs
 * @param gid GID de Shopify (ej: gid://shopify/DiscountAutomaticNode/2054072041736)
 * @returns ID limpio (ej: 2054072041736)
 */
export function extractShopifyId(gid: string): string {
  if (!gid) return ""

  // Si ya es un ID numérico, devolverlo tal como está
  if (/^\d+$/.test(gid)) {
    return gid
  }

  // Extraer el ID numérico del GID
  const match = gid.match(/\/(\d+)$/)
  return match ? match[1] : gid.replace(/[^a-zA-Z0-9]/g, "")
}

/**
 * Convierte un ID limpio de vuelta a GID de Shopify
 * @param id ID limpio
 * @param type Tipo de recurso (DiscountAutomaticNode, DiscountCodeNode, etc.)
 * @returns GID de Shopify
 */
export function createShopifyGid(id: string, type = "DiscountAutomaticNode"): string {
  if (id.startsWith("gid://")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}

/**
 * Determina el tipo de descuento basado en el GID
 * @param gid GID de Shopify
 * @returns Tipo de descuento
 */
export function getDiscountType(gid: string): string {
  if (gid.includes("DiscountAutomaticNode")) {
    return "DiscountAutomaticNode"
  }
  if (gid.includes("DiscountCodeNode")) {
    return "DiscountCodeNode"
  }
  return "DiscountAutomaticNode"
}
