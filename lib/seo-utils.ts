/**
 * Utilidades para generar automáticamente metadatos SEO
 * Optimizado para tiendas de skate
 */

/**
 * Genera un título SEO a partir del título del producto o colección
 * @param title Título original
 * @param brandName Nombre de la marca (opcional)
 */
export function generateSeoTitle(title: string, brandName = "GranitoSkate"): string {
  if (!title) return brandName

  // Si el título ya incluye el nombre de la marca, no lo duplicamos
  if (title.toLowerCase().includes(brandName.toLowerCase())) {
    return title.length > 60 ? title.substring(0, 57) + "..." : title
  }

  // Añadir palabras clave relevantes para skate si no están ya incluidas
  let enhancedTitle = title
  const skateKeywords = ["skate", "skateboard", "tabla", "patineta"]
  const hasSkateKeyword = skateKeywords.some((keyword) => title.toLowerCase().includes(keyword))

  if (!hasSkateKeyword && title.length < 40) {
    // Solo añadir keyword si hay espacio
    if (title.toLowerCase().includes("ruedas")) {
      enhancedTitle += " para Skateboard"
    } else if (title.toLowerCase().includes("truck")) {
      enhancedTitle += " para Skate"
    } else if (title.toLowerCase().includes("rodamiento")) {
      enhancedTitle += " Skate"
    } else if (title.toLowerCase().includes("completa")) {
      enhancedTitle += " de Skateboard"
    }
  }

  // Combinar título con nombre de marca
  const seoTitle = `${enhancedTitle} | ${brandName}`

  // Limitar a 60 caracteres (recomendado para SEO)
  return seoTitle.length > 60 ? seoTitle.substring(0, 57) + "..." : seoTitle
}

/**
 * Genera una descripción SEO a partir de la descripción del producto o colección
 * @param description Descripción original
 * @param title Título del producto o colección
 */
export function generateSeoDescription(description: string, title: string): string {
  // Si no hay descripción, crear una genérica basada en el título
  if (!description || description.trim() === "") {
    // Detectar tipo de producto para personalizar la descripción
    if (title.toLowerCase().includes("tabla") || title.toLowerCase().includes("deck")) {
      return `Descubre la ${title} en GranitoSkate. Tabla de alta calidad con el mejor pop y durabilidad. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    } else if (title.toLowerCase().includes("rueda")) {
      return `Descubre las ${title} en GranitoSkate. Ruedas de alta calidad con el mejor agarre y durabilidad. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    } else if (title.toLowerCase().includes("truck")) {
      return `Descubre los ${title} en GranitoSkate. Trucks de alta calidad con la mejor estabilidad y resistencia. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    } else if (title.toLowerCase().includes("rodamiento")) {
      return `Descubre los ${title} en GranitoSkate. Rodamientos de alta calidad para mayor velocidad y suavidad. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    } else if (title.toLowerCase().includes("completa")) {
      return `Descubre la ${title} en GranitoSkate. Skateboard completo de alta calidad, listo para usar. Ideal para principiantes y skaters experimentados. Envío rápido y seguro.`
    } else if (title.toLowerCase().includes("colección") || title.toLowerCase().includes("coleccion")) {
      return `Explora nuestra ${title} en GranitoSkate. Productos seleccionados de la mejor calidad para skaters exigentes. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    } else {
      return `Descubre ${title} en GranitoSkate. Calidad premium para skaters exigentes. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    }
  }

  // Eliminar etiquetas HTML si las hay
  const plainText = description.replace(/<[^>]*>/g, "")

  // Limitar a 160 caracteres (recomendado para SEO)
  return plainText.length > 160 ? plainText.substring(0, 157) + "..." : plainText
}

/**
 * Genera un slug SEO-friendly a partir de un título
 * @param title Título original
 * @returns Slug SEO-friendly
 */
export function generateSeoHandle(title: string): string {
  if (!title) return ""

  return title
    .toString()
    .toLowerCase()
    .normalize("NFD") // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/[^\w-]+/g, "") // Eliminar caracteres no alfanuméricos
    .replace(/--+/g, "-") // Reemplazar múltiples guiones con uno solo
    .replace(/^-+/, "") // Eliminar guiones al inicio
    .replace(/-+$/, "") // Eliminar guiones al final
}

// Actualizar la función generateSeoMetafields para usar el nuevo sistema de metafields
export function generateSeoMetafields(title: string, description: string) {
  return [
    {
      namespace: "seo",
      key: "title",
      value: title,
      type: "single_line_text_field",
    },
    {
      namespace: "seo",
      key: "description",
      value: description,
      type: "multi_line_text_field",
    },
    {
      namespace: "seo",
      key: "settings",
      value: JSON.stringify({
        title,
        description,
        keywords: extractKeywords(title, description),
      }),
      type: "json",
    },
  ]
}

// Mejorar la función extractKeywords para obtener palabras clave más relevantes

// Reemplazar la función extractKeywords con esta versión mejorada
function extractKeywords(title: string, description: string): string[] {
  // Combinar título y descripción
  const text = `${title} ${description}`.toLowerCase()

  // Lista ampliada de palabras comunes en español
  const commonWords = [
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "unos",
    "unas",
    "y",
    "o",
    "de",
    "del",
    "al",
    "a",
    "para",
    "por",
    "con",
    "en",
    "que",
    "se",
    "su",
    "sus",
    "mi",
    "mis",
    "tu",
    "tus",
    "este",
    "esta",
    "estos",
    "estas",
    "ese",
    "esa",
    "esos",
    "esas",
    "aquel",
    "aquella",
    "aquellos",
    "aquellas",
    "como",
    "cuando",
    "donde",
    "quien",
    "quienes",
    "cuyo",
    "cuya",
    "cuyos",
    "cuyas",
    "pero",
    "sino",
    "aunque",
    "si",
    "no",
    "ni",
    "que",
    "cual",
    "cuales",
    "cuanto",
    "cuanta",
    "cuantos",
    "cuantas",
    "mas",
    "menos",
    "tanto",
    "tanta",
    "tantos",
    "tantas",
    "tal",
    "tales",
  ]

  // Palabras clave específicas del sector skate que queremos priorizar
  const skateKeywords = [
    "skate",
    "skateboard",
    "tabla",
    "deck",
    "ruedas",
    "trucks",
    "rodamientos",
    "bearings",
    "grip",
    "griptape",
    "completo",
    "complete",
    "street",
    "park",
    "vert",
    "bowl",
    "ramp",
    "halfpipe",
    "longboard",
    "cruiser",
    "old school",
    "freestyle",
    "downhill",
    "slide",
  ]

  // Eliminar caracteres especiales y dividir en palabras
  const words = text
    .replace(/[^\w\sáéíóúüñ]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.includes(word))

  // Contar frecuencia de palabras
  const wordCount: Record<string, number> = {}
  words.forEach((word) => {
    // Dar más peso a las palabras que aparecen en el título
    const titleWeight = title.toLowerCase().includes(word) ? 2 : 1
    // Dar más peso a palabras clave del sector skate
    const skateWeight = skateKeywords.includes(word) ? 3 : 1
    wordCount[word] = (wordCount[word] || 0) + 1 * titleWeight * skateWeight
  })

  // Ordenar por frecuencia y tomar las 5 más comunes
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

/**
 * Genera una URL canónica a partir de un handle
 * @param handle Handle del producto o colección
 * @param type Tipo de recurso ('product' o 'collection')
 * @returns URL canónica
 */
export function generateCanonicalUrl(handle: string, type: "product" | "collection"): string {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""
  return `https://${shopDomain}/${type}s/${handle}`
}

/**
 * Genera metadatos estructurados para un producto
 * @param product Datos del producto
 * @returns JSON-LD para el producto
 */
export function generateProductStructuredData(product: any): string {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    description: product.description || "",
    image: product.featuredImage?.url || "",
    sku: product.variants?.[0]?.sku || "",
    brand: {
      "@type": "Brand",
      name: product.vendor || "",
    },
    offers: {
      "@type": "Offer",
      url: generateCanonicalUrl(product.handle, "product"),
      priceCurrency: product.variants?.[0]?.price?.currencyCode || "EUR",
      price: product.variants?.[0]?.price?.amount || "0.00",
      availability: product.totalInventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  }

  return JSON.stringify(structuredData)
}

/**
 * Genera metadatos estructurados para una colección
 * @param collection Datos de la colección
 * @returns JSON-LD para la colección
 */
export function generateCollectionStructuredData(collection: any): string {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description || "",
    image: collection.image?.url || "",
    url: generateCanonicalUrl(collection.handle, "collection"),
    numberOfItems: collection.productsCount || 0,
  }

  return JSON.stringify(structuredData)
}
