import type { Promocion } from "@/types/promociones"

/**
 * API de promociones
 *
 * Este módulo contiene todas las funciones para interactuar con la API de Shopify
 * relacionadas con las promociones y descuentos.
 *
 * @author Juan Pérez
 * @version 1.3.1
 * @lastModified 2023-05-15
 */

// Caché de promociones para optimizar rendimiento
let cacheProm: Promocion[] | null = null
let ultimaActualizacion = 0
const TIEMPO_CACHE = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene todas las listas de precios (promociones) de Shopify
 *
 * @returns {Promise<Promocion[]>} Lista de promociones
 */
export async function obtenerListasPrecios(): Promise<Promocion[]> {
  try {
    // Usar caché si está disponible y es reciente
    const ahora = Date.now()
    if (cacheProm && ahora - ultimaActualizacion < TIEMPO_CACHE) {
      console.log("Usando caché de promociones")
      return cacheProm
    }

    // Si no hay caché o está obsoleta, hacer petición a la API
    const respuesta = await fetch(`${process.env.SHOPIFY_API_URL}/price-rules`, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al obtener listas de precios: ${respuesta.statusText}`)
    }

    const datos = await respuesta.json()

    // Transformar datos y actualizar caché
    const promociones = datos.price_rules.map(transformarPromocion)
    cacheProm = promociones
    ultimaActualizacion = ahora

    return promociones
  } catch (error) {
    console.error("Error al obtener listas de precios:", error)
    // En caso de error, devolver caché si existe o array vacío
    return cacheProm || []
  }
}

/**
 * Obtiene una lista de precios específica por su ID
 *
 * @param {string} id - ID de la lista de precios
 * @returns {Promise<Promocion | null>} Promoción encontrada o null
 */
export async function obtenerListaPrecio(id: string): Promise<Promocion | null> {
  try {
    // Intentar obtener de la caché primero
    if (cacheProm) {
      const promocionCached = cacheProm.find((p) => p.id === id)
      if (promocionCached) {
        return promocionCached
      }
    }

    const respuesta = await fetch(`${process.env.SHOPIFY_API_URL}/price-rules/${id}`, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al obtener lista de precios: ${respuesta.statusText}`)
    }

    const datos = await respuesta.json()
    return transformarPromocion(datos.price_rule)
  } catch (error) {
    console.error(`Error al obtener lista de precios ${id}:`, error)
    return null
  }
}

/**
 * Crea una nueva promoción en Shopify
 *
 * @param {Partial<Promocion>} promocion - Datos de la promoción a crear
 * @returns {Promise<Promocion>} Promoción creada
 */
export async function crearPromocion(promocion: Partial<Promocion>): Promise<Promocion> {
  try {
    // Transformar datos al formato que espera Shopify
    const datosShopify = transformarPromocionParaShopify(promocion)

    // Hacer petición a la API
    const respuesta = await fetch(`${process.env.SHOPIFY_API_URL}/price-rules`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ price_rule: datosShopify }),
    })

    if (!respuesta.ok) {
      const error = await respuesta.json()
      throw new Error(`Error al crear promoción: ${JSON.stringify(error)}`)
    }

    const datos = await respuesta.json()

    // Invalidar caché al crear una nueva promoción
    cacheProm = null

    return transformarPromocion(datos.price_rule)
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw error
  }
}

/**
 * Elimina una lista de precios de Shopify
 *
 * @param {string} id - ID de la lista de precios a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export async function eliminarListaPrecio(id: string): Promise<boolean> {
  try {
    const respuesta = await fetch(`${process.env.SHOPIFY_API_URL}/price-rules/${id}`, {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al eliminar lista de precios: ${respuesta.statusText}`)
    }

    // Invalidar caché al eliminar una promoción
    cacheProm = null

    return true
  } catch (error) {
    console.error(`Error al eliminar lista de precios ${id}:`, error)
    throw error
  }
}

/**
 * Crea una actividad de marketing relacionada con una promoción
 * NOTA: Esta función es un placeholder para futuras implementaciones
 *
 * @param {any} datos - Datos de la actividad de marketing
 * @returns {Promise<any>} Actividad de marketing creada
 */
export async function crearActividadMarketing(datos: any): Promise<any> {
  // TODO: Implementar integración con sistema de marketing
  console.log("Creando actividad de marketing:", datos)
  return {
    id: "marketing_" + Date.now(),
    ...datos,
    createdAt: new Date().toISOString(),
  }
}

// Funciones auxiliares para transformar datos

/**
 * Transforma los datos de una promoción de Shopify al formato interno
 */
function transformarPromocion(datoShopify: any): Promocion {
  // FIXME: Mejorar tipado de datoShopify
  return {
    id: datoShopify.id,
    titulo: datoShopify.title,
    tipo: mapearTipoPromocion(datoShopify.value_type),
    valor: Number.parseFloat(datoShopify.value),
    activa: datoShopify.status === "active",
    fechaInicio: datoShopify.starts_at,
    fechaFin: datoShopify.ends_at || undefined,
    condiciones: extraerCondiciones(datoShopify),
    contadorUsos: datoShopify.usage_count || 0,
    fechaCreacion: datoShopify.created_at,
    fechaActualizacion: datoShopify.updated_at,
    objetivo: mapearObjetivoPromocion(datoShopify.target_type, datoShopify.target_selection),
    codigo: datoShopify.code,
  }
}

/**
 * Transforma los datos de una promoción interna al formato de Shopify
 */
function transformarPromocionParaShopify(promocion: Partial<Promocion>): any {
  // Datos básicos
  const datosShopify: any = {
    title: promocion.titulo,
    target_type: mapearObjetivoPromocionInverso(promocion.objetivo),
    target_selection: promocion.objetivo === "CARRITO" ? "all" : "entitled",
    allocation_method: "across",
    value_type: mapearTipoPromocionInverso(promocion.tipo),
    value: promocion.valor?.toString(),
    customer_selection: "all",
    starts_at: promocion.fechaInicio,
    ends_at: promocion.fechaFin,
  }

  // Añadir código promocional si existe
  if (promocion.codigo) {
    datosShopify.code = promocion.codigo
  }

  // Añadir condiciones específicas según el tipo de promoción
  if (promocion.condiciones && promocion.condiciones.length > 0) {
    promocion.condiciones.forEach((condicion) => {
      if (condicion.tipo === "CANTIDAD_MINIMA") {
        datosShopify.prerequisite_subtotal_range = {
          greater_than_or_equal_to: condicion.valor.toString(),
        }
      }
      // TODO: Implementar más tipos de condiciones
    })
  }

  return datosShopify
}

/**
 * Mapea el tipo de promoción de Shopify al formato interno
 */
function mapearTipoPromocion(tipoShopify: string): any {
  const mapeo: Record<string, string> = {
    percentage: "PORCENTAJE_DESCUENTO",
    fixed_amount: "CANTIDAD_FIJA",
    buy_x_get_y: "COMPRA_X_LLEVA_Y",
    shipping: "ENVIO_GRATIS",
  }

  return mapeo[tipoShopify] || "PORCENTAJE_DESCUENTO"
}

/**
 * Mapea el tipo de promoción interno al formato de Shopify
 */
function mapearTipoPromocionInverso(tipo?: any): string {
  const mapeo: Record<string, string> = {
    PORCENTAJE_DESCUENTO: "percentage",
    CANTIDAD_FIJA: "fixed_amount",
    COMPRA_X_LLEVA_Y: "buy_x_get_y",
    ENVIO_GRATIS: "shipping",
  }

  return mapeo[tipo || ""] || "percentage"
}

/**
 * Mapea el objetivo de promoción de Shopify al formato interno
 */
function mapearObjetivoPromocion(tipoObjetivo: string, seleccionObjetivo: string): any {
  // Lógica para determinar el objetivo basado en los datos de Shopify
  if (tipoObjetivo === "line_item") {
    if (seleccionObjetivo === "all") {
      return "CARRITO"
    } else {
      // Aquí necesitaríamos más información para determinar si es PRODUCTO o COLECCION
      // Por defecto asumimos PRODUCTO
      return "PRODUCTO"
    }
  } else if (tipoObjetivo === "shipping_line") {
    return "ENVIO_GRATIS"
  }
  return "CARRITO"
}

/**
 * Mapea el objetivo de promoción interno al formato de Shopify
 */
function mapearObjetivoPromocionInverso(objetivo?: any): string {
  if (objetivo === "ENVIO_GRATIS") {
    return "shipping_line"
  }
  return "line_item" // Por defecto para CARRITO, PRODUCTO y COLECCION
}

/**
 * Extrae las condiciones de una promoción de Shopify
 */
function extraerCondiciones(datoShopify: any): any[] {
  const condiciones = []

  // Extraer condición de compra mínima
  if (datoShopify.prerequisite_subtotal_range && datoShopify.prerequisite_subtotal_range.greater_than_or_equal_to) {
    condiciones.push({
      tipo: "CANTIDAD_MINIMA",
      valor: Number.parseFloat(datoShopify.prerequisite_subtotal_range.greater_than_or_equal_to),
    })
  }

  // TODO: Extraer más tipos de condiciones cuando se implementen

  return condiciones
}
