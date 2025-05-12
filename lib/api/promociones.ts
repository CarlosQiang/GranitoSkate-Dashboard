import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let promocionesCache = null
let lastUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

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
export async function obtenerPromociones(limite = 20) {
  try {
    // Usar caché si existe y tiene menos de 5 minutos
    const now = new Date()
    if (promocionesCache && lastUpdate && now.getTime() - lastUpdate.getTime() < CACHE_DURATION) {
      console.log("Usando caché de promociones")
      return promocionesCache
    }

    console.log(`Obteniendo ${limite} promociones de Shopify...`)

    // Consulta para obtener las reglas de precio (price rules)
    const query = gql`
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
      console.error("Respuesta incompleta de promociones:", data)
      return []
    }

    const promociones = data.priceRules.edges
      .map((edge) => {
        const node = edge.node

        if (!node) return null

        // Determinar si tiene código de descuento
        const tieneCodigoDescuento = node.discountCodes?.edges?.length > 0
        const codigo = tieneCodigoDescuento ? node.discountCodes.edges[0].node.code : null

        // Mapear estado
        let estado: EstadoPromocion = "desconocido"
        if (node.status === "ACTIVE") estado = "activa"
        else if (node.status === "EXPIRED") estado = "expirada"
        else if (node.status === "SCHEDULED") estado = "programada"

        // Mapear tipo de valor
        let tipo = "PORCENTAJE_DESCUENTO"
        if (node.valueType === "PERCENTAGE") tipo = "PORCENTAJE_DESCUENTO"
        else if (node.valueType === "FIXED_AMOUNT") tipo = "CANTIDAD_FIJA"

        // Asegurar que el valor sea positivo
        const valorNumerico = Math.abs(Number.parseFloat(node.value || "0"))
        const valor = valorNumerico.toString()

        return {
          id: node.id.split("/").pop(),
          titulo: node.title,
          codigo: codigo,
          esAutomatica: !tieneCodigoDescuento,
          fechaInicio: node.startsAt,
          fechaFin: node.endsAt,
          estado: estado,
          tipo: tipo,
          valor: valor,
          moneda: "EUR",
          descripcion: node.summary || null,
        }
      })
      .filter(Boolean) // Eliminar valores nulos

    // Actualizar caché
    promocionesCache = promociones
    lastUpdate = new Date()

    console.log(`Se obtuvieron ${promociones.length} promociones correctamente`)
    return promociones
  } catch (error) {
    console.error("Error al obtener promociones:", error)

    // Intentar método alternativo
    try {
      console.log("Intentando método alternativo para obtener promociones...")

      // Consulta alternativa usando discountNodes
      const query = gql`
        {
          discountNodes(first: ${limite}) {
            edges {
              node {
                id
                discount {
                  ... on DiscountCodeBasic {
                    title
                    codes(first: 1) {
                      edges {
                        node {
                          code
                        }
                      }
                    }
                    startsAt
                    endsAt
                    status
                    customerGets {
                      value {
                        ... on DiscountPercentageValue {
                          percentage
                        }
                        ... on DiscountAmount {
                          amount {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `

      const data = await shopifyClient.request(query)

      if (!data || !data.discountNodes || !data.discountNodes.edges) {
        console.error("Respuesta incompleta de promociones (método alternativo):", data)
        return []
      }

      const promociones = data.discountNodes.edges
        .map((edge) => {
          const node = edge.node
          if (!node || !node.discount) return null

          const discount = node.discount
          const codigo = discount.codes?.edges?.[0]?.node?.code || null
          let valor = "10"
          let tipo = "PORCENTAJE_DESCUENTO"

          if (discount.customerGets?.value) {
            if (discount.customerGets.value.percentage) {
              valor = (discount.customerGets.value.percentage * 100).toString()
              tipo = "PORCENTAJE_DESCUENTO"
            } else if (discount.customerGets.value.amount?.amount) {
              valor = discount.customerGets.value.amount.amount.toString()
              tipo = "CANTIDAD_FIJA"
            }
          }

          // Mapear estado
          let estado: EstadoPromocion = "desconocido"
          if (discount.status === "ACTIVE") estado = "activa"
          else if (discount.status === "EXPIRED") estado = "expirada"
          else if (discount.status === "SCHEDULED") estado = "programada"

          return {
            id: node.id.split("/").pop(),
            titulo: discount.title || "Promoción",
            codigo: codigo,
            esAutomatica: !codigo,
            fechaInicio: discount.startsAt || new Date().toISOString(),
            fechaFin: discount.endsAt || null,
            estado: estado,
            tipo: tipo,
            valor: valor,
            moneda: discount.customerGets?.value?.amount?.currencyCode || "EUR",
            descripcion: null,
          }
        })
        .filter(Boolean)

      // Actualizar caché
      promocionesCache = promociones
      lastUpdate = new Date()

      console.log(`Se obtuvieron ${promociones.length} promociones correctamente (método alternativo)`)
      return promociones
    } catch (alternativeError) {
      console.error("Error al obtener promociones (método alternativo):", alternativeError)

      // Devolver array vacío para evitar romper la UI
      return []
    }
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
    if (promocionesCache && lastUpdate) {
      const promocionCacheada = promocionesCache.find((promo) => promo.id === id)
      if (promocionCacheada) {
        console.log(`Usando promoción cacheada para ID: ${id}`)
        return promocionCacheada
      }
    }

    console.log(`Obteniendo promoción con ID: ${id}`)

    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
    }

    const query = gql`
      {
        priceRule(id: "${idFormateado}") {
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
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.priceRule) {
      // Si no se encuentra, devolver un objeto con datos mínimos para evitar errores
      return {
        id: id,
        titulo: "Promoción no encontrada",
        codigo: null,
        esAutomatica: true,
        fechaInicio: new Date().toISOString(),
        fechaFin: null,
        estado: "desconocido",
        tipo: "PORCENTAJE_DESCUENTO",
        valor: "10",
        moneda: "EUR",
        descripcion: "Esta promoción no se pudo cargar correctamente",
        error: true,
      }
    }

    const node = data.priceRule

    // Determinar si tiene código de descuento
    const tieneCodigoDescuento = node.discountCodes?.edges?.length > 0
    const codigo = tieneCodigoDescuento ? node.discountCodes.edges[0].node.code : null

    // Mapear estado
    let estado: EstadoPromocion = "desconocido"
    if (node.status === "ACTIVE") estado = "activa"
    else if (node.status === "EXPIRED") estado = "expirada"
    else if (node.status === "SCHEDULED") estado = "programada"

    // Mapear tipo de valor
    let tipo = "PORCENTAJE_DESCUENTO"
    if (node.valueType === "PERCENTAGE") tipo = "PORCENTAJE_DESCUENTO"
    else if (node.valueType === "FIXED_AMOUNT") tipo = "CANTIDAD_FIJA"

    // Asegurar que el valor sea positivo
    const valorNumerico = Math.abs(Number.parseFloat(node.value || "0"))
    const valor = valorNumerico.toString()

    return {
      id: node.id.split("/").pop(),
      titulo: node.title,
      codigo: codigo,
      esAutomatica: !tieneCodigoDescuento,
      fechaInicio: node.startsAt,
      fechaFin: node.endsAt,
      estado: estado,
      tipo: tipo,
      valor: valor,
      moneda: "EUR",
      descripcion: node.summary || null,
    }
  } catch (error) {
    console.error(`Error al obtener promoción ${id}:`, error)

    // Devolver un objeto con datos mínimos para evitar errores
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
    const valor = Number.parseFloat(datosPromocion.valor)
    if (isNaN(valor) || valor <= 0) {
      throw new Error("El valor de la promoción debe ser un número mayor que cero")
    }

    // Crear una regla de precio (PriceRule)
    const mutation = gql`
      mutation priceRuleCreate($priceRule: PriceRuleInput!) {
        priceRuleCreate(priceRule: $priceRule) {
          priceRule {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Asegurarse de que el valor sea negativo para descuentos
    const valorRegla = datosPromocion.tipo === "PORCENTAJE_DESCUENTO" ? -Math.abs(valor) : -Math.abs(valor)

    const variables = {
      priceRule: {
        title: datosPromocion.titulo,
        target: "LINE_ITEM",
        valueType: datosPromocion.tipo === "PORCENTAJE_DESCUENTO" ? "PERCENTAGE" : "FIXED_AMOUNT",
        value: valorRegla.toString(),
        customerSelection: { all: true },
        allocationMethod: "ACROSS",
        startsAt: datosPromocion.fechaInicio || new Date().toISOString(),
        endsAt: datosPromocion.fechaFin || null,
      },
    }

    console.log("Creando promoción con variables:", JSON.stringify(variables, null, 2))

    const data = await shopifyClient.request(mutation, variables)

    if (data.priceRuleCreate.userErrors && data.priceRuleCreate.userErrors.length > 0) {
      throw new Error(data.priceRuleCreate.userErrors[0].message)
    }

    // Si es un código de descuento, crear el código
    if (datosPromocion.codigo) {
      const discountCodeMutation = gql`
        mutation discountCodeCreate($discountCode: DiscountCodeInput!) {
          discountCodeCreate(discountCode: $discountCode) {
            discountCode {
              id
              code
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      const discountCodeVariables = {
        discountCode: {
          priceRuleId: data.priceRuleCreate.priceRule.id,
          code: datosPromocion.codigo,
        },
      }

      const discountCodeData = await shopifyClient.request(discountCodeMutation, discountCodeVariables)

      if (discountCodeData.discountCodeCreate.userErrors && discountCodeData.discountCodeCreate.userErrors.length > 0) {
        throw new Error(discountCodeData.discountCodeCreate.userErrors[0].message)
      }
    }

    // Invalidar caché
    promocionesCache = null
    lastUpdate = null

    return {
      id: data.priceRuleCreate.priceRule.id.split("/").pop(),
      titulo: data.priceRuleCreate.priceRule.title,
    }
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw new Error(`Error al crear promoción: ${error.message}`)
  }
}

/**
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns Estado de éxito e ID
 */
export async function eliminarPromocion(id) {
  try {
    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Eliminando promoción con ID: ${idFormateado}`)

    const mutation = gql`
      mutation priceRuleDelete($id: ID!) {
        priceRuleDelete(id: $id) {
          deletedPriceRuleId
          userErrors {
            field
            message
          }
        }
      }
    `

    const data = await shopifyClient.request(mutation, { id: idFormateado })

    if (data.priceRuleDelete.userErrors && data.priceRuleDelete.userErrors.length > 0) {
      throw new Error(data.priceRuleDelete.userErrors[0].message)
    }

    // Invalidar caché
    promocionesCache = null
    lastUpdate = null

    return { success: true, id: data.priceRuleDelete.deletedPriceRuleId }
  } catch (error) {
    console.error(`Error al eliminar promoción ${id}:`, error)
    throw new Error(`Error al eliminar promoción: ${error.message}`)
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
    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Actualizando promoción ${idFormateado} con datos:`, datos)

    // Validar que el valor sea un número positivo si se está actualizando
    if (datos.valor) {
      const valor = Number.parseFloat(datos.valor)
      if (isNaN(valor) || valor <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }
    }

    const mutation = gql`
      mutation priceRuleUpdate($id: ID!, $priceRule: PriceRuleInput!) {
        priceRuleUpdate(id: $id, priceRule: $priceRule) {
          priceRule {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Preparar los datos para la actualización
    const priceRuleInput = {}

    if (datos.titulo) priceRuleInput.title = datos.titulo
    if (datos.fechaInicio) priceRuleInput.startsAt = datos.fechaInicio
    if (datos.fechaFin) priceRuleInput.endsAt = datos.fechaFin

    if (datos.valor && datos.tipo) {
      priceRuleInput.valueType = datos.tipo === "PORCENTAJE_DESCUENTO" ? "PERCENTAGE" : "FIXED_AMOUNT"
      priceRuleInput.value = (
        datos.tipo === "PORCENTAJE_DESCUENTO"
          ? -Math.abs(Number.parseFloat(datos.valor))
          : -Math.abs(Number.parseFloat(datos.valor))
      ).toString()
    }

    const variables = {
      id: idFormateado,
      priceRule: priceRuleInput,
    }

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.priceRuleUpdate.userErrors && responseData.priceRuleUpdate.userErrors.length > 0) {
      throw new Error(responseData.priceRuleUpdate.userErrors[0].message)
    }

    // Invalidar caché
    promocionesCache = null
    lastUpdate = null

    return {
      id: responseData.priceRuleUpdate.priceRule.id.split("/").pop(),
      titulo: responseData.priceRuleUpdate.priceRule.title,
      ...datos,
    }
  } catch (error) {
    console.error(`Error al actualizar promoción ${id}:`, error)
    throw new Error(`Error al actualizar promoción: ${error.message}`)
  }
}
