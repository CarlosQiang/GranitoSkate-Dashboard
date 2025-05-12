import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let promotionsCache = null
let lastUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export type PromotionStatus = "active" | "expired" | "scheduled" | "UNKNOWN"
export type PromotionValueType = "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y"

export type Promotion = {
  id: string
  title: string
  code: string | null
  isAutomatic: boolean
  startsAt: string
  endsAt: string | null
  status: PromotionStatus
  valueType: PromotionValueType
  value: string | number
  currencyCode?: string
  summary?: string | null
  error?: boolean
}

/**
 * Obtiene todas las promociones de Shopify
 * @param limit Número máximo de promociones a obtener
 * @returns Lista de promociones
 */
export async function fetchPromotions(limit = 20) {
  try {
    // Usar caché si existe y tiene menos de 5 minutos
    const now = new Date()
    if (promotionsCache && lastUpdate && now.getTime() - lastUpdate.getTime() < CACHE_DURATION) {
      console.log("Usando caché de promociones")
      return promotionsCache
    }

    console.log(`Obteniendo ${limit} promociones de Shopify...`)

    // Consulta para obtener las reglas de precio (price rules)
    const query = gql`
      {
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

    const promotions = data.priceRules.edges
      .map((edge) => {
        const node = edge.node

        if (!node) return null

        // Determinar si tiene código de descuento
        const hasDiscountCode = node.discountCodes?.edges?.length > 0
        const code = hasDiscountCode ? node.discountCodes.edges[0].node.code : null

        // Mapear estado
        let status: PromotionStatus = "UNKNOWN"
        if (node.status === "ACTIVE") status = "active"
        else if (node.status === "EXPIRED") status = "expired"
        else if (node.status === "SCHEDULED") status = "scheduled"

        // Mapear tipo de valor
        let valueType: PromotionValueType = "percentage"
        if (node.valueType === "PERCENTAGE") valueType = "percentage"
        else if (node.valueType === "FIXED_AMOUNT") valueType = "fixed_amount"

        // Asegurar que el valor sea positivo
        const valueNumeric = Math.abs(Number.parseFloat(node.value || "0"))
        const value = valueNumeric.toString()

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          code: code,
          isAutomatic: !hasDiscountCode,
          startsAt: node.startsAt,
          endsAt: node.endsAt,
          status: status,
          valueType: valueType,
          value: value,
          currencyCode: "EUR",
          summary: node.summary || null,
        }
      })
      .filter(Boolean) // Eliminar valores nulos

    // Actualizar caché
    promotionsCache = promotions
    lastUpdate = new Date()

    console.log(`Se obtuvieron ${promotions.length} promociones correctamente`)
    return promotions
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
export async function fetchPromotionById(id) {
  try {
    // Intentar obtener de la caché primero
    if (promotionsCache && lastUpdate) {
      const cachedPromotion = promotionsCache.find((promo) => promo.id === id)
      if (cachedPromotion) {
        console.log(`Usando promoción cacheada para ID: ${id}`)
        return cachedPromotion
      }
    }

    console.log(`Obteniendo promoción con ID: ${id}`)

    // Formatear el ID correctamente para PriceRule
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    const query = gql`
      {
        priceRule(id: "${formattedId}") {
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
      return {
        id: id,
        title: "Promoción no encontrada",
        code: null,
        isAutomatic: true,
        startsAt: new Date().toISOString(),
        endsAt: null,
        status: "UNKNOWN" as PromotionStatus,
        valueType: "percentage" as PromotionValueType,
        value: "10",
        currencyCode: "EUR",
        summary: "Esta promoción no se pudo cargar correctamente",
        error: true,
      }
    }

    const node = data.priceRule

    // Determinar si tiene código de descuento
    const hasDiscountCode = node.discountCodes?.edges?.length > 0
    const code = hasDiscountCode ? node.discountCodes.edges[0].node.code : null

    // Mapear estado
    let status: PromotionStatus = "UNKNOWN"
    if (node.status === "ACTIVE") status = "active"
    else if (node.status === "EXPIRED") status = "expired"
    else if (node.status === "SCHEDULED") status = "scheduled"

    // Mapear tipo de valor
    let valueType: PromotionValueType = "percentage"
    if (node.valueType === "PERCENTAGE") valueType = "percentage"
    else if (node.valueType === "FIXED_AMOUNT") valueType = "fixed_amount"

    // Asegurar que el valor sea positivo
    const valueNumeric = Math.abs(Number.parseFloat(node.value || "0"))
    const value = valueNumeric.toString()

    return {
      id: node.id.split("/").pop(),
      title: node.title,
      code: code,
      isAutomatic: !hasDiscountCode,
      startsAt: node.startsAt,
      endsAt: node.endsAt,
      status: status,
      valueType: valueType,
      value: value,
      currencyCode: "EUR",
      summary: node.summary || null,
    }
  } catch (error) {
    console.error(`Error al obtener promoción ${id}:`, error)
    return {
      id: id,
      title: "Error al cargar promoción",
      code: null,
      isAutomatic: true,
      startsAt: new Date().toISOString(),
      endsAt: null,
      status: "UNKNOWN" as PromotionStatus,
      valueType: "percentage" as PromotionValueType,
      value: "10",
      currencyCode: "EUR",
      summary: `Error: ${error.message}`,
      error: true,
    }
  }
}

/**
 * Crea una nueva promoción
 * @param promotionData Datos de la promoción a crear
 * @returns La promoción creada
 */
export async function createPromotion(promotionData) {
  try {
    // Validar que el valor sea un número positivo
    const value = Number.parseFloat(promotionData.valor || promotionData.value || "0")
    if (isNaN(value) || value <= 0) {
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

    // Determinar el tipo de valor
    const valueType =
      promotionData.tipo === "PORCENTAJE_DESCUENTO" || promotionData.valueType === "percentage"
        ? "PERCENTAGE"
        : "FIXED_AMOUNT"

    // Asegurarse de que el valor sea negativo para descuentos
    const ruleValue = -Math.abs(value)

    const variables = {
      priceRule: {
        title: promotionData.titulo || promotionData.title || "Nueva promoción",
        target: "LINE_ITEM",
        valueType: valueType,
        value: ruleValue.toString(),
        customerSelection: { all: true },
        allocationMethod: "ACROSS",
        startsAt: promotionData.fechaInicio || promotionData.startsAt || new Date().toISOString(),
        endsAt: promotionData.fechaFin || promotionData.endsAt || null,
      },
    }

    console.log("Creando promoción con variables:", JSON.stringify(variables, null, 2))

    const data = await shopifyClient.request(mutation, variables)

    if (data.priceRuleCreate.userErrors && data.priceRuleCreate.userErrors.length > 0) {
      throw new Error(data.priceRuleCreate.userErrors[0].message)
    }

    // Si es un código de descuento, crear el código
    const code = promotionData.codigo || promotionData.code
    if (code) {
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
          code: code,
        },
      }

      const discountCodeData = await shopifyClient.request(discountCodeMutation, discountCodeVariables)

      if (discountCodeData.discountCodeCreate.userErrors && discountCodeData.discountCodeCreate.userErrors.length > 0) {
        throw new Error(discountCodeData.discountCodeCreate.userErrors[0].message)
      }
    }

    // Invalidar caché
    promotionsCache = null
    lastUpdate = null

    return {
      id: data.priceRuleCreate.priceRule.id.split("/").pop(),
      title: data.priceRuleCreate.priceRule.title,
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
export async function deletePromotion(id) {
  try {
    // Formatear el ID correctamente para PriceRule
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Eliminando promoción con ID: ${formattedId}`)

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

    const data = await shopifyClient.request(mutation, { id: formattedId })

    if (data.priceRuleDelete.userErrors && data.priceRuleDelete.userErrors.length > 0) {
      throw new Error(data.priceRuleDelete.userErrors[0].message)
    }

    // Invalidar caché
    promotionsCache = null
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
 * @param data Datos actualizados de la promoción
 * @returns Promoción actualizada
 */
export async function updatePromotion(id, data) {
  try {
    // Formatear el ID correctamente para PriceRule
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Actualizando promoción ${formattedId} con datos:`, data)

    // Validar que el valor sea un número positivo si se está actualizando
    if (data.valor || data.value) {
      const value = Number.parseFloat(data.valor || data.value)
      if (isNaN(value) || value <= 0) {
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

    if (data.titulo || data.title) priceRuleInput.title = data.titulo || data.title
    if (data.fechaInicio || data.startsAt) priceRuleInput.startsAt = data.fechaInicio || data.startsAt
    if (data.fechaFin || data.endsAt) priceRuleInput.endsAt = data.fechaFin || data.endsAt

    const tipo = data.tipo || data.valueType
    const valor = data.valor || data.value

    if (valor && tipo) {
      priceRuleInput.valueType =
        tipo === "PORCENTAJE_DESCUENTO" || tipo === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT"
      priceRuleInput.value = (-Math.abs(Number.parseFloat(valor))).toString()
    }

    const variables = {
      id: formattedId,
      priceRule: priceRuleInput,
    }

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.priceRuleUpdate.userErrors && responseData.priceRuleUpdate.userErrors.length > 0) {
      throw new Error(responseData.priceRuleUpdate.userErrors[0].message)
    }

    // Invalidar caché
    promotionsCache = null
    lastUpdate = null

    return {
      id: responseData.priceRuleUpdate.priceRule.id.split("/").pop(),
      title: responseData.priceRuleUpdate.priceRule.title,
      ...data,
    }
  } catch (error) {
    console.error(`Error al actualizar promoción ${id}:`, error)
    throw new Error(`Error al actualizar promoción: ${error.message}`)
  }
}

// Funciones para compatibilidad con la API anterior
export const fetchPriceListById = fetchPromotionById
export const deletePriceList = deletePromotion
export const createPriceList = createPromotion
export const updatePriceList = updatePromotion
export const fetchPriceLists = fetchPromotions
export const getPriceListById = fetchPromotionById
