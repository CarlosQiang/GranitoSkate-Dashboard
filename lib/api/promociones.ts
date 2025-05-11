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
  condiciones?: any[]
  precios?: any[]
  fechaCreacion: string
  fechaActualizacion: string
  // Campos para compatibilidad con la interfaz en inglés
  title?: string
  summary?: string
  startsAt?: string
  endsAt?: string
  status?: string
  target?: string
  targetId?: string
  valueType?: string
  value?: string
  usageLimit?: number
  usageCount?: number
  code?: string
  conditions?: any[]
  prices?: any[]
  createdAt?: string
  updatedAt?: string
  type?: string
  error?: boolean
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

      const promocion = {
        id: node.id.split("/").pop(),
        titulo: node.title || "",
        resumen: node.summary || "",
        fechaInicio: node.startsAt || new Date().toISOString(),
        fechaFin: node.endsAt || null,
        estado: node.status || "EXPIRED",
        objetivo: node.target || "",
        tipoValor: node.valueType?.toLowerCase() || "percentage",
        valor: Math.abs(Number.parseFloat(node.value || "0")).toString(),
        limiteUso: node.usageLimit || null,
        contadorUso: node.usageCount || 0,
        codigo: discountCode,
        condiciones: [],
        precios: [],
        fechaCreacion: node.createdAt || new Date().toISOString(),
        fechaActualizacion: node.updatedAt || new Date().toISOString(),
        // Campos para compatibilidad con la interfaz en inglés
        title: node.title || "",
        summary: node.summary || "",
        startsAt: node.startsAt || new Date().toISOString(),
        endsAt: node.endsAt || null,
        status: node.status || "EXPIRED",
        target: node.target || "",
        valueType: node.valueType?.toLowerCase() || "percentage",
        value: Math.abs(Number.parseFloat(node.value || "0")).toString(),
        usageLimit: node.usageLimit || null,
        usageCount: node.usageCount || 0,
        code: discountCode,
        conditions: [],
        prices: [],
        createdAt: node.createdAt || new Date().toISOString(),
        updatedAt: node.updatedAt || new Date().toISOString(),
      }

      return promocion
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
    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
    }

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

    const data = await shopifyClient.request(query, { id: idFormateado })

    if (!data || !data.priceRule) {
      console.warn(`Promoción no encontrada: ${id}`)
      return null
    }

    const node = data.priceRule
    const discountCode = node.discountCodes.edges[0]?.node.code || null

    const promocion = {
      id: node.id.split("/").pop(),
      titulo: node.title || "",
      resumen: node.summary || "",
      fechaInicio: node.startsAt || new Date().toISOString(),
      fechaFin: node.endsAt || null,
      estado: node.status || "INACTIVE",
      objetivo: node.target || "",
      tipoValor: node.valueType?.toLowerCase() || "percentage",
      valor: Math.abs(Number.parseFloat(node.value || "0")).toString(),
      limiteUso: node.usageLimit || null,
      contadorUso: node.usageCount || 0,
      codigo: discountCode,
      condiciones: [],
      precios: [],
      fechaCreacion: node.createdAt || new Date().toISOString(),
      fechaActualizacion: node.updatedAt || new Date().toISOString(),
      // Campos para compatibilidad con la interfaz en inglés
      title: node.title || "",
      summary: node.summary || "",
      startsAt: node.startsAt || new Date().toISOString(),
      endsAt: node.endsAt || null,
      status: node.status || "INACTIVE",
      target: node.target || "",
      valueType: node.valueType?.toLowerCase() || "percentage",
      value: Math.abs(Number.parseFloat(node.value || "0")).toString(),
      usageLimit: node.usageLimit || null,
      usageCount: node.usageCount || 0,
      code: discountCode,
      conditions: [],
      prices: [],
      createdAt: node.createdAt || new Date().toISOString(),
      updatedAt: node.updatedAt || new Date().toISOString(),
    }

    return promocion
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
        title: data.titulo || data.title,
        target: data.objetivo || data.target || "LINE_ITEM",
        valueType: (data.tipoValor || data.valueType) === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
        value: `-${Math.abs(Number.parseFloat(data.valor || data.value || "0"))}`,
        customerSelection: { all: true },
        startsAt: data.fechaInicio || data.startsAt || new Date().toISOString(),
        endsAt: data.fechaFin || data.endsAt || null,
        usageLimit: data.limiteUso || data.usageLimit || null,
      },
    }

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.priceRuleCreate.userErrors && responseData.priceRuleCreate.userErrors.length > 0) {
      throw new Error(responseData.priceRuleCreate.userErrors[0].message)
    }

    // Si es un código de descuento, crear el código
    if (data.codigo || data.code) {
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
          code: data.codigo || data.code,
        },
      }

      const discountCodeData = await shopifyClient.request(discountCodeMutation, discountCodeVariables)

      if (discountCodeData.discountCodeCreate.userErrors && discountCodeData.discountCodeCreate.userErrors.length > 0) {
        throw new Error(discountCodeData.discountCodeCreate.userErrors[0].message)
      }
    }

    return {
      id: responseData.priceRuleCreate.priceRule.id.split("/").pop(),
      titulo: responseData.priceRuleCreate.priceRule.title,
      title: responseData.priceRuleCreate.priceRule.title,
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
    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
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
    const priceRuleInput: any = {}

    if (data.titulo || data.title) priceRuleInput.title = data.titulo || data.title
    if (data.fechaInicio || data.startsAt) priceRuleInput.startsAt = data.fechaInicio || data.startsAt
    if (data.fechaFin !== undefined || data.endsAt !== undefined) priceRuleInput.endsAt = data.fechaFin || data.endsAt

    if ((data.valor || data.value) && (data.tipoValor || data.valueType)) {
      const valor = Number.parseFloat(data.valor || data.value)
      priceRuleInput.valueType = (data.tipoValor || data.valueType) === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT"
      priceRuleInput.value = `-${Math.abs(valor)}`
    }

    const variables = {
      id: idFormateado,
      priceRule: priceRuleInput,
    }

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.priceRuleUpdate.userErrors && responseData.priceRuleUpdate.userErrors.length > 0) {
      throw new Error(responseData.priceRuleUpdate.userErrors[0].message)
    }

    return {
      id: responseData.priceRuleUpdate.priceRule.id.split("/").pop(),
      titulo: responseData.priceRuleUpdate.priceRule.title,
      title: responseData.priceRuleUpdate.priceRule.title,
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
    // Formatear el ID correctamente para PriceRule
    let idFormateado = id
    if (!id.includes("gid://shopify/")) {
      idFormateado = `gid://shopify/PriceRule/${id}`
    }

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
