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
 * Genera metafields para SEO basados en título y descripción
 */
export function generateSeoMetafields(title: string, description: string) {
  const seoTitle = generateSeoTitle(title)
  const seoDescription = generateSeoDescription(description, title)

  return [
    {
      namespace: "seo",
      key: "title",
      value: seoTitle,
      type: "single_line_text_field",
    },
    {
      namespace: "seo",
      key: "description",
      value: seoDescription,
      type: "multi_line_text_field",
    },
  ]
}

/**
 * Genera un slug SEO-friendly a partir de un título
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
