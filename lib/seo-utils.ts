/**
 * Genera metafields de SEO automáticamente a partir del título y la descripción
 * @param title Título del producto o colección
 * @param description Descripción del producto o colección
 * @returns Array de metafields para SEO
 */
export function generateSeoMetafields(title: string, description = "") {
  // Extraer palabras clave de título y descripción
  const combinedText = `${title} ${description}`.toLowerCase()

  // Eliminar palabras comunes y extraer palabras clave
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
    "a",
    "en",
    "con",
    "por",
    "para",
    "es",
    "son",
  ]

  const keywords = combinedText
    .replace(/[^\w\s]/gi, "") // Eliminar caracteres especiales
    .split(/\s+/) // Dividir por espacios
    .filter((word) => word.length > 3 && !commonWords.includes(word)) // Filtrar palabras comunes y cortas
    .slice(0, 10) // Limitar a 10 palabras clave

  // Crear metafields
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
      value: description || `Descubre ${title} en nuestra tienda online. Envío rápido y seguro.`,
      type: "multi_line_text_field",
    },
    {
      namespace: "seo",
      key: "keywords",
      value: JSON.stringify(keywords),
      type: "json",
    },
  ]
}

/**
 * Genera una descripción SEO a partir de un texto
 * @param text Texto base para generar la descripción
 * @param maxLength Longitud máxima de la descripción (por defecto 160 caracteres)
 * @returns Descripción optimizada para SEO
 */
export function generateSeoDescription(text: string, maxLength = 160): string {
  if (!text) return ""

  // Limpiar el texto de etiquetas HTML
  const cleanText = text.replace(/<[^>]*>/g, "")

  // Si el texto es más corto que la longitud máxima, devolverlo tal cual
  if (cleanText.length <= maxLength) return cleanText

  // Truncar el texto y añadir puntos suspensivos
  return cleanText.substring(0, maxLength - 3) + "..."
}

/**
 * Genera un título SEO a partir de un texto
 * @param text Texto base para generar el título
 * @param maxLength Longitud máxima del título (por defecto 60 caracteres)
 * @returns Título optimizado para SEO
 */
export function generateSeoTitle(text: string, maxLength = 60): string {
  if (!text) return ""

  // Si el texto es más corto que la longitud máxima, devolverlo tal cual
  if (text.length <= maxLength) return text

  // Truncar el texto y añadir puntos suspensivos
  return text.substring(0, maxLength - 3) + "..."
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
