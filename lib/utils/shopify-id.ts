/**
 * Extrae el ID numérico de un GID de Shopify
 * @param gid GID completo de Shopify (ej: gid://shopify/DiscountAutomaticNode/2054072041736)
 * @returns ID numérico (ej: 2054072041736)
 */
export function extractShopifyId(gid: string): string {
  if (!gid) return ""

  // Si ya es un ID numérico, devolverlo tal como está
  if (/^\d+$/.test(gid)) {
    return gid
  }

  // Extraer ID de un GID de Shopify
  const parts = gid.split("/")
  return parts[parts.length - 1] || gid
}

/**
 * Convierte un ID numérico a un GID completo de Shopify
 * @param id ID numérico
 * @param type Tipo de entidad (ej: DiscountAutomaticNode)
 * @returns GID completo
 */
export function createShopifyGid(id: string, type = "DiscountAutomaticNode"): string {
  if (id.startsWith("gid://")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}

/**
 * Verifica si un string es un GID de Shopify
 * @param id String a verificar
 * @returns true si es un GID
 */
export function isShopifyGid(id: string): boolean {
  return id.startsWith("gid://shopify/")
}
