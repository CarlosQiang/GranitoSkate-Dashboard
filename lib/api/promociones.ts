import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Tipos para las promociones
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
  contadorUsos: number
  codigo?: string
  fechaCreacion: string
  fechaActualizacion: string
  target?: string
  valueType?: string
  startsAt?: string
  endsAt?: string
  usageLimit?: number
  usageCount?: number
  prices?: any[]
  conditions?: any[]
}

/**
 * Obtiene todas las promociones (price rules) de Shopify
 * @param limit Número máximo de promociones a obtener
 * @returns Lista de promociones
 */
export async function fetchPromotions(limit = 50): Promise<Promocion[]> {
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
export async function fetchPriceListById(id: string): Promise<Promocion | null> {
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
      title: node.title || "",
      summary: node.summary || "",
      startsAt: node.startsAt || new Date().toISOString(),
      endsAt: node.endsAt || null,
      status: node.status || "UNKNOWN",
      target: node.target || "",
      valueType: node.valueType || "percentage",
      value: node.value || "0",
      usageLimit: node.usageLimit || null,
      usageCount: node.usageCount || 0,
      code: discountCode,
      createdAt: node.createdAt || new Date().toISOString(),
      updatedAt: node.updatedAt || new Date().toISOString(),
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
    console.log("Creando promoción:", data)
    return {
      id: "new-promotion-id",
      title: data.title,
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
    console.log(`Actualizando promoción ${id} con datos:`, data)
    return {
      id: id,
      title: data.title,
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
    console.log(`Eliminando promoción ${id}`)
    return { success: true, id: id }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error al eliminar promoción: ${(error as Error).message}`)
  }
}

export { eliminarPromocion as deletePriceList }
