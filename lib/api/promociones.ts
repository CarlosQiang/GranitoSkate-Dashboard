// Caché para mejorar rendimiento
import shopifyClient from "../shopify"

let promocionesCache = null
let ultimaActualizacion = null
const DURACION_CACHE = 5 * 60 * 1000 // 5 minutos

export type EstadoPromocion = "activa" | "programada" | "expirada" | "desconocido"
export type TipoPromocion = "PORCENTAJE_DESCUENTO" | "CANTIDAD_FIJA" | "COMPRA_X_LLEVA_Y" | "ENVIO_GRATIS"

export type Promocion = {
  id: string
  titulo: string
  codigo: string | null
  esAutomatica: boolean
  fechaInicio: string
  fechaFin: string | null
  estado: EstadoPromocion
  tipo: string
  valor: string
  moneda: string
  descripcion: string | null
  error?: boolean
}

/**
 * Obtiene todas las promociones de Shopify
 * @param limite Número máximo de promociones a obtener
 * @returns Lista de promociones
 */
export async function obtenerPromociones(limite = 50) {
  try {
    // Usar caché si existe y tiene menos de 5 minutos
    const ahora = new Date()
    if (promocionesCache && ultimaActualizacion && ahora.getTime() - ultimaActualizacion.getTime() < DURACION_CACHE) {
      console.log("Usando caché de promociones")
      return promocionesCache
    }

    console.log(`Obteniendo ${limite} promociones de Shopify...`)

    // Intentar usar GraphQL primero
    try {
      const query = `
        {
          priceRules(first: ${limite}) {
            edges {
              node {
                id
                title
                summary
                startsAt
                endsAt
                status
                target
                valueType
                value
                usageLimit
                discountCodes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
                }
              }
            }
          }
        }
      `

      const data = await shopifyClient.request(query)

      if (!data || !data.priceRules || !data.priceRules.edges) {
        throw new Error("Respuesta incompleta de promociones")
      }

      // Mapear las reglas de precio a nuestro formato de promociones
      const promociones = data.priceRules.edges.map((edge) => {
        const node = edge.node
        // Determinar si tiene código de descuento
        const tieneCodigoDescuento = node.discountCodes.edges.length > 0
        const codigo = tieneCodigoDescuento ? node.discountCodes.edges[0].node.code : null

        // Mapear estado
        let estado = "desconocido"
        const fechaInicio = new Date(node.startsAt)
        const fechaFin = node.endsAt ? new Date(node.endsAt) : null
        const ahora = new Date()

        if (fechaInicio > ahora) {
          estado = "programada"
        } else if (fechaFin && fechaFin < ahora) {
          estado = "expirada"
        } else {
          estado = "activa"
        }

        // Mapear tipo de valor
        let tipo = "PORCENTAJE_DESCUENTO"
        if (node.valueType === "PERCENTAGE") {
          tipo = "PORCENTAJE_DESCUENTO"
        } else if (node.valueType === "FIXED_AMOUNT") {
          tipo = "CANTIDAD_FIJA"
        } else if (node.target === "SHIPPING_LINE") {
          tipo = "ENVIO_GRATIS"
        }

        // Asegurar que el valor sea positivo
        const valorNumerico = Math.abs(Number.parseFloat(node.value || "0"))
        const valor = valorNumerico.toString()

        return {
          id: node.id.split("/").pop(),
          titulo: node.title || "Promoción",
          codigo: codigo,
          esAutomatica: !tieneCodigoDescuento,
          fechaInicio: node.startsAt,
          fechaFin: node.endsAt || null,
          estado: estado,
          tipo: tipo,
          valor: valor,
          moneda: "EUR",
          descripcion: node.summary || null,
        }
      })

      // Actualizar caché
      promocionesCache = promociones
      ultimaActualizacion = new Date()

      console.log(`Se obtuvieron ${promociones.length} promociones correctamente`)
      return promociones
    } catch (graphqlError) {
      console.error("Error con GraphQL, intentando con REST:", graphqlError)

      // Si falla GraphQL, intentar con REST
      const response = await fetch(`/api/shopify/rest/discount_codes?limit=${limite}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error al obtener promociones: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data || !data.price_rules) {
        console.error("Respuesta incompleta de promociones:", data)
        return []
      }

      // Mapear las reglas de precio a nuestro formato de promociones
      const promociones = data.price_rules.map((regla) => {
        // Determinar si tiene código de descuento
        const tieneCodigoDescuento = regla.discount_codes && regla.discount_codes.length > 0
        const codigo = tieneCodigoDescuento ? regla.discount_codes[0].code : null

        // Mapear estado
        let estado = "desconocido"
        const fechaInicio = new Date(regla.starts_at)
        const fechaFin = regla.ends_at ? new Date(regla.ends_at) : null
        const ahora = new Date()

        if (fechaInicio > ahora) {
          estado = "programada"
        } else if (fechaFin && fechaFin < ahora) {
          estado = "expirada"
        } else {
          estado = "activa"
        }

        // Mapear tipo de valor
        let tipo = "PORCENTAJE_DESCUENTO"
        if (regla.value_type === "percentage") {
          tipo = "PORCENTAJE_DESCUENTO"
        } else if (regla.value_type === "fixed_amount") {
          tipo = "CANTIDAD_FIJA"
        } else if (regla.target_type === "shipping_line") {
          tipo = "ENVIO_GRATIS"
        }

        // Asegurar que el valor sea positivo
        const valorNumerico = Math.abs(Number.parseFloat(regla.value || "0"))
        const valor = valorNumerico.toString()

        return {
          id: regla.id.toString(),
          titulo: regla.title || "Promoción",
          codigo: codigo,
          esAutomatica: !tieneCodigoDescuento,
          fechaInicio: regla.starts_at,
          fechaFin: regla.ends_at || null,
          estado: estado,
          tipo: tipo,
          valor: valor,
          moneda: "EUR",
          descripcion: regla.summary || null,
        }
      })

      // Actualizar caché
      promocionesCache = promociones
      ultimaActualizacion = new Date()

      console.log(`Se obtuvieron ${promociones.length} promociones correctamente (REST)`)
      return promociones
    }
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    return []
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción o null si no se encuentra
 */
export async function obtenerPromocionPorId(id) {
  try {
    // Intentar obtener de la caché primero
    if (promocionesCache && ultimaActualizacion) {
      const promocionCacheada = promocionesCache.find((promo) => promo.id === id)
      if (promocionCacheada) {
        console.log(`Usando promoción cacheada para ID: ${id}`)
        return promocionCacheada
      }
    }

    console.log(`Obteniendo promoción con ID: ${id}`)

    // Intentar con REST
    try {
      const response = await fetch(`/api/shopify/rest/discount_codes/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error al obtener promoción: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data || !data.price_rule) {
        return null
      }

      const regla = data.price_rule

      // Determinar si tiene código de descuento
      const tieneCodigoDescuento = regla.discount_codes && regla.discount_codes.length > 0
      const codigo = tieneCodigoDescuento ? regla.discount_codes[0].code : null

      // Mapear estado
      let estado = "desconocido"
      const fechaInicio = new Date(regla.starts_at)
      const fechaFin = regla.ends_at ? new Date(regla.ends_at) : null
      const ahora = new Date()

      if (fechaInicio > ahora) {
        estado = "programada"
      } else if (fechaFin && fechaFin < ahora) {
        estado = "expirada"
      } else {
        estado = "activa"
      }

      // Mapear tipo de valor
      let tipo = "PORCENTAJE_DESCUENTO"
      if (regla.value_type === "percentage") {
        tipo = "PORCENTAJE_DESCUENTO"
      } else if (regla.value_type === "fixed_amount") {
        tipo = "CANTIDAD_FIJA"
      } else if (regla.target_type === "shipping_line") {
        tipo = "ENVIO_GRATIS"
      }

      // Asegurar que el valor sea positivo
      const valorNumerico = Math.abs(Number.parseFloat(regla.value || "0"))
      const valor = valorNumerico.toString()

      return {
        id: regla.id.toString(),
        titulo: regla.title || "Promoción",
        codigo: codigo,
        esAutomatica: !tieneCodigoDescuento,
        fechaInicio: regla.starts_at,
        fechaFin: regla.ends_at || null,
        estado: estado,
        tipo: tipo,
        valor: valor,
        moneda: "EUR",
        descripcion: regla.summary || null,
      }
    } catch (restError) {
      console.error(`Error al obtener promoción ${id} con REST:`, restError)
      throw restError
    }
  } catch (error) {
    console.error(`Error al obtener promoción ${id}:`, error)
    return {
      id: id,
      titulo: "Error al cargar promoción",
      codigo: null,
      esAutomatica: true,
      fechaInicio: new Date().toISOString(),
      fechaFin: null,
      estado: "desconocido",
      tipo: "PORCENTAJE_DESCUENTO",
      valor: "10",
      moneda: "EUR",
      descripcion: `Error: ${error.message}`,
      error: true,
    }
  }
}

/**
 * Crea una nueva promoción
 * @param datosPromocion Datos de la promoción a crear
 * @returns La promoción creada
 */
export async function crearPromocion(datosPromocion) {
  try {
    // Validar que el valor sea un número positivo
    const valor = Number.parseFloat(datosPromocion.valor || "0")
    if (isNaN(valor) || valor <= 0) {
      throw new Error("El valor de la promoción debe ser un número mayor que cero")
    }

    // Mapear tipo de valor para la API
    let tipoValor = "percentage"
    if (datosPromocion.tipo === "PORCENTAJE_DESCUENTO") {
      tipoValor = "percentage"
    } else if (datosPromocion.tipo === "CANTIDAD_FIJA") {
      tipoValor = "fixed_amount"
    }

    // Crear una promoción usando la API REST
    const respuesta = await fetch(`/api/shopify/rest/discount_codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        discount_code: {
          code: datosPromocion.codigo || `PROMO${Math.floor(Math.random() * 10000)}`,
          value_type: tipoValor,
          value: `-${valor}`, // Valor negativo para descuentos
          title: datosPromocion.titulo || "Nueva promoción",
          starts_at: datosPromocion.fechaInicio || new Date().toISOString(),
          ends_at: datosPromocion.fechaFin || null,
        },
      }),
    })

    if (!respuesta.ok) {
      const datosError = await respuesta.json()
      throw new Error(`Error al crear promoción: ${datosError.error || respuesta.statusText}`)
    }

    const datos = await respuesta.json()

    // Invalidar caché
    promocionesCache = null
    ultimaActualizacion = null

    return {
      id: datos.price_rule?.id?.toString() || datos.discount_code?.id?.toString(),
      titulo: datos.price_rule?.title || datos.discount_code?.title || datosPromocion.titulo,
      codigo: datos.discount_code?.code || datosPromocion.codigo,
    }
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw new Error(`Error al crear promoción: ${error.message}`)
  }
}

/**
 * Actualiza una promoción
 * @param id ID de la promoción
 * @param datos Datos actualizados de la promoción
 * @returns Promoción actualizada
 */
export async function actualizarPromocion(id, datos) {
  try {
    console.log(`Actualizando promoción ${id} con datos:`, datos)

    // Validar que el valor sea un número positivo si se está actualizando
    if (datos.valor) {
      const valor = Number.parseFloat(datos.valor)
      if (isNaN(valor) || valor <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }
    }

    // Preparar los datos para la actualización
    const datosPriceRule = {}

    if (datos.titulo) datosPriceRule.title = datos.titulo
    if (datos.fechaInicio) datosPriceRule.starts_at = datos.fechaInicio
    if (datos.fechaFin) datosPriceRule.ends_at = datos.fechaFin

    if (datos.valor && datos.tipo) {
      datosPriceRule.value_type = datos.tipo === "PORCENTAJE_DESCUENTO" ? "percentage" : "fixed_amount"
      datosPriceRule.value = `-${Math.abs(Number.parseFloat(datos.valor))}`
    }

    // Actualizar usando la API REST
    const respuesta = await fetch(`/api/shopify/rest/discount_codes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_rule: datosPriceRule,
        discount_code: datos.codigo ? { code: datos.codigo } : undefined,
      }),
    })

    if (!respuesta.ok) {
      const datosError = await respuesta.json()
      throw new Error(`Error al actualizar promoción: ${datosError.error || respuesta.statusText}`)
    }

    const datosRespuesta = await respuesta.json()

    // Invalidar caché
    promocionesCache = null
    ultimaActualizacion = null

    return {
      id: datosRespuesta.price_rule?.id?.toString() || id,
      titulo: datosRespuesta.price_rule?.title || datos.titulo,
      ...datos,
    }
  } catch (error) {
    console.error(`Error al actualizar promoción ${id}:`, error)
    throw new Error(`Error al actualizar promoción: ${error.message}`)
  }
}

/**
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns Estado de éxito e ID
 */
export async function eliminarPromocion(id) {
  try {
    console.log(`Eliminando promoción con ID: ${id}`)

    // Eliminar usando la API REST
    const respuesta = await fetch(`/api/shopify/rest/discount_codes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al eliminar promoción: ${respuesta.statusText}`)
    }

    // Invalidar caché
    promocionesCache = null
    ultimaActualizacion = null

    return { exito: true, id: id }
  } catch (error) {
    console.error(`Error al eliminar promoción ${id}:`, error)
    throw new Error(`Error al eliminar promoción: ${error.message}`)
  }
}

// Exportar funciones para compatibilidad con la API en inglés
export {
  obtenerPromociones as fetchPromotions,
  obtenerPromocionPorId as fetchPromotionById,
  crearPromocion as createPromotion,
  actualizarPromocion as updatePromotion,
  eliminarPromocion as deletePromotion,
  obtenerPromocionPorId as fetchPriceListById,
  crearPromocion as createPriceList,
  actualizarPromocion as updatePriceList,
  obtenerPromociones as fetchPriceLists,
  eliminarPromocion as deletePriceList,
  obtenerPromocionPorId as getPriceListById,
}
