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
  const gidPattern = /gid:\/\/shopify\/\w+\/(\d+)/
  const match = gid.match(gidPattern)
  if (match && match[1]) {
    return match[1]
  }

  // Si tiene formato de URL con dos puntos (formato incorrecto), corregirlo y extraer
  const incorrectPattern = /gid:\/shopify\/\w+\/(\d+)/
  const incorrectMatch = gid.match(incorrectPattern)
  if (incorrectMatch && incorrectMatch[1]) {
    return incorrectMatch[1]
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
 * @param id - El ID numérico o GID
 * @param type - El tipo de recurso (ej: "DiscountAutomaticNode")
 * @returns El GID completo de Shopify
 */
export function createShopifyGid(id: string, type = "DiscountAutomaticNode"): string {
  // Si ya es un GID completo y correcto, devolverlo tal cual
  if (id.startsWith("gid://shopify/")) {
    return id
  }

  // Si es un GID con formato incorrecto (dos puntos), corregirlo
  if (id.startsWith("gid:/shopify/")) {
    return id.replace("gid:/shopify/", "gid://shopify/")
  }

  // Si es un ID numérico, crear el GID completo
  if (/^\d+$/.test(id)) {
    return `gid://shopify/${type}/${id}`
  }

  // Si no se puede determinar el formato, devolver el ID original
  return id
}

/**
 * Normaliza un GID de Shopify para asegurar que tenga el formato correcto
 * @param gid - El GID que puede tener formato incorrecto
 * @returns El GID normalizado con formato correcto
 */
export function normalizeShopifyGid(gid: string): string {
  if (!gid) return ""

  // Corregir el formato incorrecto con dos puntos
  if (gid.startsWith("gid:/shopify/")) {
    return gid.replace("gid:/shopify/", "gid://shopify/")
  }

  return gid
}
