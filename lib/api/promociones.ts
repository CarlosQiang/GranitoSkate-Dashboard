import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let promocionesCache = null
let lastUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export type EstadoPromocion = "ACTIVE" | "EXPIRED" | "SCHEDULED" | "UNKNOWN"

export interface Promocion {
  id: string
  titulo: string
  resumen: string
  fechaInicio: string
  fechaFin?: string
  estado: EstadoPromocion
  objetivo: string
  tipoValor: string
  valor: string
  limiteUso?: number
  contadorUso: number
  codigo?: string
  fechaCreacion: string
  fechaActualizacion: string
}

/**
 * Obtiene todas las promociones (price rules) de Shopify
 * @returns Lista de promociones
 */
export async function obtenerPromociones(limite = 50): Promise<Promocion[]> {
  try {
    // Usar caché si existe y tiene menos de 5 minutos
    const now = new Date()
    if (promocionesCache && lastUpdate && now.getTime() - lastUpdate.getTime() < CACHE_DURATION) {
      console.log("Usando caché de promociones")
      return promocionesCache
    }

    console.log(`Fetching ${limite} promotions from Shopify...`)

    // Consulta actualizada para ser compatible con la API 2023-01 de Shopify
    const query = gql`
      query GetPriceRules {
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
              customerSelection {
                all
              }
              discountCodes(first: 1) {
                edges {
                  node {
                    code
                    usageCount
                  }
                }
                
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.priceRules || !data.priceRules.edges) {
      console.warn("No se encontraron promociones o la respuesta está incompleta")
      return []
    }

    const promociones = data.priceRules.edges
      .map((edge) => {
        const node = edge.node

        if (!node) return null

        // Determinar si tiene código de descuento
        const tieneCodigoDescuento = node.discountCodes?.edges?.length > 0
        const codigo = tieneCodigoDescuento ? node.discountCodes.edges[0].node.code : null
        const contadorUso = tieneCodigoDescuento ? node.discountCodes.edges[0].node.usageCount : 0

        return {
          id: node.id.split("/").pop(),
          titulo: node.title,
          resumen: node.summary || "",
          fechaInicio: node.startsAt,
          fechaFin: node.endsAt,
          estado: node.status as EstadoPromocion,
          objetivo: node.target,
          tipoValor: node.valueType.toLowerCase(),
          valor: Math.abs(Number.parseFloat(node.value)).toString(),
          limiteUso: node.usageLimit,
          contadorUso: contadorUso,
          codigo: codigo,
          fechaCreacion: node.createdAt,
          fechaActualizacion: node.updatedAt,
        }
      })
      .filter(Boolean) // Eliminar valores nulos

    // Actualizar caché
    promocionesCache = promociones
    lastUpdate = new Date()

    console.log(`Successfully fetched ${promociones.length} promotions`)
    return promociones
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción
 */
export async function obtenerPromocionPorId(id: string): Promise<Promocion | null> {
  try {
    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Fetching promotion with ID: ${idFormateado}`)

    const query = gql`
      query GetPriceRule {
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
          customerSelection {
            all
          }
          discountCodes(first: 1) {
            edges {
              node {
                code
                usageCount
              }
            }
          }
          createdAt
          updatedAt
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.priceRule) {
      throw new Error(`Promoción no encontrada: ${id}`)
    }

    const node = data.priceRule

    // Determinar si tiene código de descuento
    const tieneCodigoDescuento = node.discountCodes?.edges?.length > 0
    const codigo = tieneCodigoDescuento ? node.discountCodes.edges[0].node.code : null
    const contadorUso = tieneCodigoDescuento ? node.discountCodes.edges[0].node.usageCount : 0

    return {
      id: node.id.split("/").pop(),
      titulo: node.title,
      resumen: node.summary || "",
      fechaInicio: node.startsAt,
      fechaFin: node.endsAt,
      estado: node.status as EstadoPromocion,
      objetivo: node.target,
      tipoValor: node.valueType.toLowerCase(),
      valor: Math.abs(Number.parseFloat(node.value)).toString(),
      limiteUso: node.usageLimit,
      contadorUso: contadorUso,
      codigo: codigo,
      fechaCreacion: node.createdAt,
      fechaActualizacion: node.updatedAt,
    }
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    throw new Error(`Error al cargar promoción: ${(error as Error).message}`)
  }
}

/**
 * Crea una nueva promoción (price rule)
 * @param data Datos de la promoción
 * @returns La promoción creada
 */
export async function crearPromocion(data: any): Promise<any> {
  try {
    // Validar que el valor sea un número positivo
    const valor = Number.parseFloat(data.valor.toString())
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
    const valorRegla = data.tipoValor === "percentage" ? -Math.abs(valor) : -Math.abs(valor)

    // Preparar variables para la mutación
    const variables = {
      priceRule: {
        title: data.titulo,
        target: "LINE_ITEM",
        valueType: data.tipoValor === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
        value: valorRegla.toString(),
        customerSelection: { all: true },
        allocationMethod: "ACROSS",
        startsAt: data.fechaInicio || new Date().toISOString(),
        endsAt: data.fechaFin || null,
        usageLimit: data.limiteUso || null,
      },
    }

    console.log("Creating promotion with variables:", JSON.stringify(variables, null, 2))

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.priceRuleCreate.userErrors && responseData.priceRuleCreate.userErrors.length > 0) {
      throw new Error(responseData.priceRuleCreate.userErrors[0].message)
    }

    // Si es un código de descuento, crear el código
    if (data.codigo) {
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
          priceRuleId: responseData.priceRuleCreate.priceRule.id,
          code: data.codigo,
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
      id: responseData.priceRuleCreate.priceRule.id.split("/").pop(),
      titulo: responseData.priceRuleCreate.priceRule.title,
      ...data,
    }
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error al crear promoción: ${(error as Error).message}`)
  }
}

/**
 * Actualiza una promoción existente
 * @param id ID de la promoción
 * @param data Datos a actualizar
 * @returns La promoción actualizada
 */
export async function actualizarPromocion(id: string, data: any): Promise<any> {
  try {
    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Updating promotion ${idFormateado} with data:`, data)

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
    const priceRuleInput: any = {}

    if (data.titulo) priceRuleInput.title = data.titulo
    if (data.fechaInicio) priceRuleInput.startsAt = data.fechaInicio
    if (data.fechaFin !== undefined) priceRuleInput.endsAt = data.fechaFin

    if (data.valor && data.tipoValor) {
      const valor = Number.parseFloat(data.valor.toString())
      if (isNaN(valor) || valor <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }

      priceRuleInput.valueType = data.tipoValor === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT"
      priceRuleInput.value = (-Math.abs(valor)).toString()
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
      ...data,
    }
  } catch (error) {
    console.error(`Error updating promotion ${id}:`, error)
    throw new Error(`Error al actualizar promoción: ${(error as Error).message}`)
  }
}

/**
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns Success status and ID
 */
export async function eliminarPromocion(id: string): Promise<any> {
  try {
    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Deleting promotion with ID: ${idFormateado}`)

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

    const variables = {
      id: idFormateado,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.priceRuleDelete.userErrors && data.priceRuleDelete.userErrors.length > 0) {
      throw new Error(data.priceRuleDelete.userErrors[0].message)
    }

    // Invalidar caché
    promocionesCache = null
    lastUpdate = null

    return { success: true, id: data.priceRuleDelete.deletedPriceRuleId }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error al eliminar promoción: ${(error as Error).message}`)
  }
}

// Alias para compatibilidad con la versión en inglés
export const fetchPriceListById = obtenerPromocionPorId
export const createPriceList = crearPromocion
export const updatePriceList = actualizarPromocion
export const deletePriceList = eliminarPromocion
export const getPriceListById = obtenerPromocionPorId
