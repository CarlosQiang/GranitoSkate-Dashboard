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
  const skateKeywords = ["skate", "skateboard", "tabla", "patineta", "longboard", "cruiser"]
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
    } else if (title.toLowerCase().includes("zapatilla") || title.toLowerCase().includes("zapato")) {
      enhancedTitle += " de Skate"
    } else if (
      title.toLowerCase().includes("camiseta") ||
      title.toLowerCase().includes("sudadera") ||
      title.toLowerCase().includes("gorra")
    ) {
      enhancedTitle += " Skate"
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
    } else if (title.toLowerCase().includes("zapatilla") || title.toLowerCase().includes("zapato")) {
      return `Descubre las ${title} en GranitoSkate. Zapatillas diseñadas específicamente para skate con gran durabilidad y agarre. Envío rápido y seguro.`
    } else if (
      title.toLowerCase().includes("camiseta") ||
      title.toLowerCase().includes("sudadera") ||
      title.toLowerCase().includes("gorra")
    ) {
      return `Descubre ${title} en GranitoSkate. Ropa de skate con estilo urbano y la mejor calidad. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    } else if (title.toLowerCase().includes("colección") || title.toLowerCase().includes("coleccion")) {
      return `Explora nuestra ${title} en GranitoSkate. Productos seleccionados de la mejor calidad para skaters exigentes. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    } else {
      return `Descubre ${title} en GranitoSkate. Calidad premium para skaters exigentes. Envío rápido y seguro. ¡Compra ahora en nuestra tienda online!`
    }
  }

  // Eliminar etiquetas HTML si las hay
  const plainText = description.replace(/<[^>]*>/g, "")

  // Mejorar la descripción si es muy corta
  if (plainText.length < 50) {
    return `${plainText} Descubre este producto de skate en GranitoSkate. Calidad premium y envío rápido garantizado.`
  }

  // Limitar a 160 caracteres (recomendado para SEO)
  return plainText.length > 160 ? plainText.substring(0, 157) + "..." : plainText
}

/**
 * Genera un slug SEO-friendly a partir de un título
 * @param title Título original
 * @returns Slug SEO-friendly
 */
export function generateSeoHandle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD") // Normalizar caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^\w\s-]/g, "") // Eliminar caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/--+/g, "-") // Reemplazar múltiples guiones con uno solo
    .trim() // Eliminar espacios al inicio y final
}

/**
 * Genera metafields para SEO a partir de título y descripción
 * @param title Título del producto o colección
 * @param description Descripción del producto o colección
 * @param image URL de la imagen (opcional)
 */
export function generateSeoMetafields(title: string, description: string, image?: string) {
  const seoTitle = generateSeoTitle(title)
  const seoDescription = generateSeoDescription(description, title)
  const keywords = extractKeywords(title, description)

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
    {
      namespace: "seo",
      key: "keywords",
      value: JSON.stringify(keywords),
      type: "json",
    },
    {
      namespace: "og",
      key: "title",
      value: seoTitle,
      type: "single_line_text_field",
    },
    {
      namespace: "og",
      key: "description",
      value: seoDescription,
      type: "multi_line_text_field",
    },
    ...(image
      ? [
          {
            namespace: "og",
            key: "image",
            value: image,
            type: "single_line_text_field",
          },
        ]
      : []),
  ]
}

/**
 * Extrae palabras clave relevantes de un título y descripción
 * @param title Título del producto o colección
 * @param description Descripción del producto o colección
 * @returns Array de palabras clave
 */
export function extractKeywords(title: string, description: string): string[] {
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
    "muy",
    "mucho",
    "mucha",
    "muchos",
    "muchas",
    "poco",
    "poca",
    "pocos",
    "pocas",
    "bastante",
    "demasiado",
    "demasiada",
    "demasiados",
    "demasiadas",
    "todo",
    "toda",
    "todos",
    "todas",
    "alguno",
    "alguna",
    "algunos",
    "algunas",
    "ninguno",
    "ninguna",
    "ningunos",
    "ningunas",
    "otro",
    "otra",
    "otros",
    "otras",
    "mismo",
    "misma",
    "mismos",
    "mismas",
    "tan",
    "tanto",
    "tanta",
    "tantos",
    "tantas",
    "alguien",
    "nadie",
    "algo",
    "nada",
    "cada",
    "cualquier",
    "quienquiera",
    "cualesquiera",
    "demás",
    "varios",
    "varias",
    "cierto",
    "cierta",
    "ciertos",
    "ciertas",
    "más",
    "menos",
    "mejor",
    "peor",
    "mayor",
    "menor",
    "superior",
    "inferior",
    "máximo",
    "máxima",
    "mínimo",
    "mínima",
    "óptimo",
    "óptima",
    "pésimo",
    "pésima",
    "último",
    "última",
    "primero",
    "primera",
    "segundo",
    "segunda",
    "tercero",
    "tercera",
    "cuarto",
    "cuarta",
    "quinto",
    "quinta",
    "sexto",
    "sexta",
    "séptimo",
    "séptima",
    "octavo",
    "octava",
    "noveno",
    "novena",
    "décimo",
    "décima",
    "vigésimo",
    "vigésima",
    "trigésimo",
    "trigésima",
    "cuadragésimo",
    "cuadragésima",
    "quincuagésimo",
    "quincuagésima",
    "sexagésimo",
    "sexagésima",
    "septuagésimo",
    "septuagésima",
    "octogésimo",
    "octogésima",
    "nonagésimo",
    "nonagésima",
    "centésimo",
    "centésima",
    "milésimo",
    "milésima",
    "millonésimo",
    "millonésima",
    "billonésimo",
    "billonésima",
    "trillonésimo",
    "trillonésima",
    "cuatrillonésimo",
    "cuatrillonésima",
    "quintillonésimo",
    "quintillonésima",
    "sextillonésimo",
    "sextillonésima",
    "septillonésimo",
    "septillonésima",
    "octillonésimo",
    "octillonésima",
    "nonillonésimo",
    "nonillonésima",
    "decillonésimo",
    "decillonésima",
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
    "flip",
    "kickflip",
    "heelflip",
    "ollie",
    "nollie",
    "grind",
    "slide",
    "manual",
    "nose",
    "tail",
    "concave",
    "shape",
    "wheels",
    "urethane",
    "durometer",
    "abec",
    "hardware",
    "risers",
    "pivot",
    "bushings",
    "kingpin",
    "axle",
    "hanger",
    "baseplate",
    "spacer",
    "speed rings",
    "washers",
    "bolts",
    "nuts",
    "tool",
    "skate tool",
    "wax",
    "skate wax",
    "shoes",
    "zapatillas",
    "camiseta",
    "t-shirt",
    "hoodie",
    "sudadera",
    "gorra",
    "cap",
    "beanie",
    "backpack",
    "mochila",
    "calcetines",
    "socks",
    "pantalones",
    "pants",
    "jeans",
    "shorts",
    "vans",
    "dc",
    "element",
    "santa cruz",
    "powell peralta",
    "bones",
    "independent",
    "thunder",
    "venture",
    "tensor",
    "spitfire",
    "ricta",
    "oj",
    "girl",
    "chocolate",
    "baker",
    "flip",
    "zero",
    "toy machine",
    "alien workshop",
    "blind",
    "enjoi",
    "almost",
    "globe",
    "etnies",
    "emerica",
    "és",
    "fallen",
    "lakai",
    "dvs",
    "dc shoes",
    "adio",
    "circa",
    "osiris",
    "supra",
    "nike sb",
    "adidas skateboarding",
    "converse cons",
    "new balance numeric",
    "huf",
    "thrasher",
    "supreme",
    "palace",
    "diamond supply co",
    "primitive",
    "dgk",
    "grizzly",
    "shake junt",
    "mob",
    "jessup",
    "black magic",
    "bones swiss",
    "bones reds",
    "bronson",
    "andale",
    "mini logo",
    "destructo",
    "royal",
    "ace",
    "krux",
    "orion",
    "theeve",
    "silver",
    "phantom",
    "fury",
    "pig",
    "bones wheels",
    "mini logo wheels",
    "oj wheels",
    "ricta wheels",
    "spitfire wheels",
    "powell peralta wheels",
    "santa cruz wheels",
    "slime balls",
    "speedlab",
    "flip wheels",
    "element wheels",
    "girl wheels",
    "chocolate wheels",
    "blind wheels",
    "enjoi wheels",
    "almost wheels",
    "zero wheels",
    "toy machine wheels",
    "alien workshop wheels",
    "darkstar wheels",
    "dgk wheels",
    "primitive wheels",
    "baker wheels",
    "shake junt wheels",
    "bones bearings",
    "bronson bearings",
    "andale bearings",
    "mini logo bearings",
    "independent bearings",
    "spitfire bearings",
    "powell peralta bearings",
    "santa cruz bearings",
    "flip bearings",
    "element bearings",
    "girl bearings",
    "chocolate bearings",
    "blind bearings",
    "enjoi bearings",
    "almost bearings",
    "zero bearings",
    "toy machine bearings",
    "alien workshop bearings",
    "darkstar bearings",
    "dgk bearings",
    "primitive bearings",
    "baker bearings",
    "shake junt bearings",
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

  // Ordenar por frecuencia y tomar las 8 más comunes
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word)
}
