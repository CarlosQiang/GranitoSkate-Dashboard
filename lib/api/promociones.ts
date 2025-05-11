import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Tipos para las promociones
export type EstadoPromocion = "ACTIVE" | "EXPIRED" | "SCHEDULED" | "INACTIVE"

export interface Promocion {
  id: string
  titulo: string
  resumen?: string
  fechaInicio: string
  fechaFin?: string
  estado: EstadoPromocion
  objetivo: string
  objetivoId?: string
  tipoValor: string
  valor: string
  limiteUso?: number
  contadorUso: number
  codigo?: string
  condiciones: any[]
  precios?: any[]
  fechaCreacion: string
  fechaActualizacion: string
}

/**
 * Obtiene todas las promociones (price rules) de Shopify
 * @param limit Número máximo de promociones a obtener
 * @returns Lista de promociones
 */
export async function obtenerPromociones(limit = 50): Promise<Promocion[]> {
  try {
    const query = gql`
      query {
        priceRules(first: ${limit}) {
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
              usageCount
              createdAt
              updatedAt
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
      console.warn("No se encontraron promociones o la respuesta está incompleta")
      return []
    }

    return data.priceRules.edges.map((edge: any) => {
      const node = edge.node
      const discountCode = node.discountCodes.edges[0]?.node.code || null

      return {
        id: node.id,
        titulo: node.title || "",
        resumen: node.summary || "",
        fechaInicio: node.startsAt || new Date().toISOString(),
        fechaFin: node.endsAt || null,
        estado: node.status || "EXPIRED",
        objetivo: node.target || "",
        tipoValor: node.valueType || "percentage",
        valor: node.value || "0",
        limiteUso: node.usageLimit || null,
        contadorUso: node.usageCount || 0,
        codigo: discountCode,
        condiciones: [],
        precios: [],
        fechaCreacion: node.createdAt || new Date().toISOString(),
        fechaActualizacion: node.updatedAt || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("Error al obtener promociones:", error)
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
    const query = gql`
      query GetPriceRule($id: ID!) {
        priceRule(id: $id) {
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
          usageCount
          createdAt
          updatedAt
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

    const data = await shopifyClient.request(query, { id })

    if (!data || !data.priceRule) {
      console.warn(`Promoción no encontrada: ${id}`)
      return null
    }

    const node = data.priceRule
    const discountCode = node.discountCodes.edges[0]?.node.code || null

    return {
      id: node.id,
      titulo: node.title || "",
      resumen: node.summary || "",
      fechaInicio: node.startsAt || new Date().toISOString(),
      fechaFin: node.endsAt || null,
      estado: node.status || "INACTIVE",
      objetivo: node.target || "",
      tipoValor: node.valueType || "percentage",
      valor: node.value || "0",
      limiteUso: node.usageLimit || null,
      contadorUso: node.usageCount || 0,
      codigo: discountCode,
      condiciones: [],
      precios: [],
      fechaCreacion: node.createdAt || new Date().toISOString(),
      fechaActualizacion: node.updatedAt || new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error al obtener promoción ${id}:`, error)
    return null
  }
}

/**
 * Crea una nueva promoción (price rule)
 * @param data Datos de la promoción
 * @returns La promoción creada
 */
export async function crearPromocion(data: any): Promise<any> {
  try {
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

    // Preparar variables para la mutación
    const variables = {
      priceRule: {
        title: data.titulo,
        target: data.objetivo || "LINE_ITEM",
        valueType: data.tipoValor === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
        value: data.valor,
        customerSelection: { all: true },
        startsAt: data.fechaInicio || new Date().toISOString(),
        endsAt: data.fechaFin || null,
        usageLimit: data.limiteUso || null,
      },
    }

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

    return {
      id: responseData.priceRuleCreate.priceRule.id,
      titulo: responseData.priceRuleCreate.priceRule.title,
      ...data,
    }
  } catch (error) {
    console.error("Error al crear promoción:", error)
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
    if (data.valor) priceRuleInput.value = data.valor
    if (data.tipoValor) priceRuleInput.valueType = data.tipoValor === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT"
    if (data.limiteUso !== undefined) priceRuleInput.usageLimit = data.limiteUso

    const variables = {
      id: id,
      priceRule: priceRuleInput,
    }

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.priceRuleUpdate.userErrors && responseData.priceRuleUpdate.userErrors.length > 0) {
      throw new Error(responseData.priceRuleUpdate.userErrors[0].message)
    }

    return {
      id: responseData.priceRuleUpdate.priceRule.id,
      titulo: responseData.priceRuleUpdate.priceRule.title,
      ...data,
    }
  } catch (error) {
    console.error(`Error al actualizar promoción ${id}:`, error)
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
      id: id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.priceRuleDelete.userErrors && data.priceRuleDelete.userErrors.length > 0) {
      throw new Error(data.priceRuleDelete.userErrors[0].message)
    }

    return { success: true, id: data.priceRuleDelete.deletedPriceRuleId }
  } catch (error) {
    console.error(`Error al eliminar promoción ${id}:`, error)
    throw new Error(`Error al eliminar promoción: ${(error as Error).message}`)
  }
}

// Exportar funciones con nombres alternativos para compatibilidad
export const fetchPromotions = obtenerPromociones
export const fetchPriceListById = obtenerPromocionPorId
export const createPriceList = crearPromocion
export const updatePriceList = actualizarPromocion
export const deletePriceList = eliminarPromocion
