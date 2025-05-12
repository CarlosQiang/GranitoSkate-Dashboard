// Caché para mejorar rendimiento
let promocionesCache = null
let ultimaActualizacion = null
const DURACION_CACHE = 5 * 60 * 1000 // 5 minutos

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

    // Usar la API REST en lugar de GraphQL
    const respuesta = await fetch(`/api/shopify/rest/discount_codes?limit=${limite}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al obtener promociones: ${respuesta.status} ${respuesta.statusText}`)
    }

    const datos = await respuesta.json()

    if (!datos || !datos.price_rules) {
      console.error("Respuesta incompleta de promociones:", datos)
      return []
    }

    // Mapear las reglas de precio a nuestro formato de promociones
    const promociones = datos.price_rules.map((regla) => {
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
        esAutomatico: !tieneCodigoDescuento,
        fechaInicio: regla.starts_at,
        fechaFin: regla.ends_at || null,
        estado: estado,
        tipo: tipo,
        valor: valor,
        moneda: "EUR",
        resumen: regla.summary || null,
      }
    })

    // Actualizar caché
    promocionesCache = promociones
    ultimaActualizacion = new Date()

    console.log(`Se obtuvieron ${promociones.length} promociones correctamente`)
    return promociones
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

    // Usar la API REST
    const respuesta = await fetch(`/api/shopify/rest/discount_codes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al obtener promoción: ${respuesta.status} ${respuesta.statusText}`)
    }

    const datos = await respuesta.json()

    if (!datos || !datos.price_rule) {
      return null
    }

    const regla = datos.price_rule

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
      esAutomatico: !tieneCodigoDescuento,
      fechaInicio: regla.starts_at,
      fechaFin: regla.ends_at || null,
      estado: estado,
      tipo: tipo,
      valor: valor,
      moneda: "EUR",
      resumen: regla.summary || null,
    }
  } catch (error) {
    console.error(`Error al obtener promoción ${id}:`, error)
    return {
      id: id,
      titulo: "Error al cargar promoción",
      codigo: null,
      esAutomatico: true,
      fechaInicio: new Date().toISOString(),
      fechaFin: null,
      estado: "desconocido",
      tipo: "PORCENTAJE_DESCUENTO",
      valor: "10",
      moneda: "EUR",
      resumen: `Error: ${error.message}`,
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
      id: datos.price_rule.id.toString(),
      titulo: datos.price_rule.title,
      codigo: datos.discount_code.code,
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
      id: datosRespuesta.price_rule?.id.toString() || id,
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
