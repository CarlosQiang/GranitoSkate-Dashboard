import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Promotion, PromotionCondition, PromotionTarget } from "@/types/promotions"

// Función para crear una lista de precios (promoción)
export async function createPriceList(promotionData: Partial<Promotion>) {
  const mutation = gql`
    mutation priceListCreate($input: PriceListInput!) {
      priceListCreate(input: $input) {
        priceList {
          id
          name
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Convertir nuestra estructura de promoción a formato de Shopify PriceList
    const input = {
      name: promotionData.title,
      // Configuramos el tipo de ajuste según el tipo de promoción
      adjustment: {
        type: promotionData.type === "PERCENTAGE_DISCOUNT" ? "PERCENTAGE_DECREASE" : "FIXED_AMOUNT_OFF",
        value: promotionData.value?.toString(),
      },
      // Configuramos las condiciones
      customerPredicate: getCustomerPredicate(promotionData),
      // Fechas de inicio y fin
      startsAt: promotionData.startDate,
      endsAt: promotionData.endDate,
    }

    console.log("Creando lista de precios:", JSON.stringify(input, null, 2))
    const data = await shopifyClient.request(mutation, { input })

    if (data.priceListCreate.userErrors && data.priceListCreate.userErrors.length > 0) {
      throw new Error(data.priceListCreate.userErrors[0].message)
    }

    return data.priceListCreate.priceList
  } catch (error) {
    console.error("Error creating price list:", error)
    throw error
  }
}

// Función para obtener todas las listas de precios (promociones)
export async function fetchPriceLists() {
  const query = gql`
    query {
      priceLists(first: 50) {
        edges {
          node {
            id
            name
            startsAt
            endsAt
            currency
            adjustment {
              type
              value
            }
            customerPredicate
            productPredicate
            fixedPricesCount
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query)

    if (!data || !data.priceLists || !data.priceLists.edges) {
      console.error("Respuesta de listas de precios incompleta:", data)
      return []
    }

    // Convertir el formato de Shopify a nuestro formato de promoción
    return data.priceLists.edges.map((edge: any) => {
      const node = edge.node
      return {
        id: node.id.split("/").pop(),
        title: node.name,
        type: mapAdjustmentTypeToPromotionType(node.adjustment?.type),
        value: Number.parseFloat(node.adjustment?.value || "0"),
        active: Boolean(
          node.startsAt &&
            new Date(node.startsAt) <= new Date() &&
            (!node.endsAt || new Date(node.endsAt) >= new Date()),
        ),
        startDate: node.startsAt,
        endDate: node.endsAt,
        conditions: parsePredicates(node.customerPredicate, node.productPredicate),
        usageCount: node.fixedPricesCount || 0,
        createdAt: node.startsAt,
        updatedAt: node.startsAt,
        target: determineTargetFromPredicate(node.productPredicate),
      }
    })
  } catch (error) {
    console.error("Error fetching price lists:", error)
    return []
  }
}

// Función para obtener una lista de precios por ID
export async function fetchPriceListById(id: string) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = id.includes("gid://shopify/PriceList/")
  const formattedId = isFullShopifyId ? id : `gid://shopify/PriceList/${id}`

  const query = gql`
    query getPriceList($id: ID!) {
      priceList(id: $id) {
        id
        name
        startsAt
        endsAt
        currency
        adjustment {
          type
          value
        }
        customerPredicate
        productPredicate
        fixedPricesCount
        prices(first: 50) {
          edges {
            node {
              price {
                amount
                currencyCode
              }
              variant {
                id
                product {
                  title
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.priceList) {
      throw new Error(`Lista de precios no encontrada: ${id}`)
    }

    // Convertir el formato de Shopify a nuestro formato de promoción
    const priceList = data.priceList
    return {
      id: priceList.id.split("/").pop(),
      title: priceList.name,
      type: mapAdjustmentTypeToPromotionType(priceList.adjustment?.type),
      value: Number.parseFloat(priceList.adjustment?.value || "0"),
      active: Boolean(
        priceList.startsAt &&
          new Date(priceList.startsAt) <= new Date() &&
          (!priceList.endsAt || new Date(priceList.endsAt) >= new Date()),
      ),
      startDate: priceList.startsAt,
      endDate: priceList.endsAt,
      conditions: parsePredicates(priceList.customerPredicate, priceList.productPredicate),
      usageCount: priceList.fixedPricesCount || 0,
      createdAt: priceList.startsAt,
      updatedAt: priceList.startsAt,
      target: determineTargetFromPredicate(priceList.productPredicate),
      prices:
        priceList.prices?.edges?.map((edge: any) => ({
          price: edge.node.price,
          productTitle: edge.node.variant.product.title,
          variantId: edge.node.variant.id.split("/").pop(),
        })) || [],
    }
  } catch (error) {
    console.error(`Error fetching price list ${id}:`, error)
    throw error
  }
}

// Función para actualizar una lista de precios
export async function updatePriceList(id: string, promotionData: Partial<Promotion>) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = id.includes("gid://shopify/PriceList/")
  const formattedId = isFullShopifyId ? id : `gid://shopify/PriceList/${id}`

  const mutation = gql`
    mutation priceListUpdate($id: ID!, $input: PriceListInput!) {
      priceListUpdate(id: $id, input: $input) {
        priceList {
          id
          name
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Convertir nuestra estructura de promoción a formato de Shopify PriceList
    const input = {
      name: promotionData.title,
      // Actualizamos el tipo de ajuste si se proporciona
      adjustment: promotionData.type
        ? {
            type: promotionData.type === "PERCENTAGE_DISCOUNT" ? "PERCENTAGE_DECREASE" : "FIXED_AMOUNT_OFF",
            value: promotionData.value?.toString(),
          }
        : undefined,
      // Actualizamos las condiciones si se proporcionan
      customerPredicate: promotionData.conditions ? getCustomerPredicate(promotionData) : undefined,
      // Actualizamos las fechas si se proporcionan
      startsAt: promotionData.startDate,
      endsAt: promotionData.endDate,
    }

    console.log("Actualizando lista de precios:", JSON.stringify(input, null, 2))
    const data = await shopifyClient.request(mutation, { id: formattedId, input })

    if (data.priceListUpdate.userErrors && data.priceListUpdate.userErrors.length > 0) {
      throw new Error(data.priceListUpdate.userErrors[0].message)
    }

    return data.priceListUpdate.priceList
  } catch (error) {
    console.error(`Error updating price list ${id}:`, error)
    throw error
  }
}

// Función para eliminar una lista de precios
export async function deletePriceList(id: string) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = id.includes("gid://shopify/PriceList/")
  const formattedId = isFullShopifyId ? id : `gid://shopify/PriceList/${id}`

  const mutation = gql`
    mutation priceListDelete($id: ID!) {
      priceListDelete(id: $id) {
        deletedPriceListId
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, { id: formattedId })

    if (data.priceListDelete.userErrors && data.priceListDelete.userErrors.length > 0) {
      throw new Error(data.priceListDelete.userErrors[0].message)
    }

    return data.priceListDelete.deletedPriceListId
  } catch (error) {
    console.error(`Error deleting price list ${id}:`, error)
    throw error
  }
}

// Función para añadir productos específicos a una lista de precios con precios fijos
export async function addFixedPricesToPriceList(
  priceListId: string,
  prices: Array<{ variantId: string; price: number }>,
) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = priceListId.includes("gid://shopify/PriceList/")
  const formattedPriceListId = isFullShopifyId ? priceListId : `gid://shopify/PriceList/${priceListId}`

  // Formatear los IDs de variantes
  const formattedPrices = prices.map((price) => ({
    variantId: price.variantId.includes("gid://shopify/ProductVariant/")
      ? price.variantId
      : `gid://shopify/ProductVariant/${price.variantId}`,
    price: price.price.toString(),
  }))

  const mutation = gql`
    mutation priceListFixedPricesAdd($priceListId: ID!, $prices: [PriceListPriceInput!]!) {
      priceListFixedPricesAdd(priceListId: $priceListId, prices: $prices) {
        priceList {
          id
          fixedPricesCount
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      priceListId: formattedPriceListId,
      prices: formattedPrices.map((p) => ({
        variantId: p.variantId,
        price: { amount: p.price, currencyCode: "EUR" },
      })),
    })

    if (data.priceListFixedPricesAdd.userErrors && data.priceListFixedPricesAdd.userErrors.length > 0) {
      throw new Error(data.priceListFixedPricesAdd.userErrors[0].message)
    }

    return data.priceListFixedPricesAdd.priceList
  } catch (error) {
    console.error(`Error adding fixed prices to price list ${priceListId}:`, error)
    throw error
  }
}

// Función para eliminar precios fijos de una lista de precios
export async function removeFixedPricesFromPriceList(priceListId: string, variantIds: string[]) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = priceListId.includes("gid://shopify/PriceList/")
  const formattedPriceListId = isFullShopifyId ? priceListId : `gid://shopify/PriceList/${priceListId}`

  // Formatear los IDs de variantes
  const formattedVariantIds = variantIds.map((id) =>
    id.includes("gid://shopify/ProductVariant/") ? id : `gid://shopify/ProductVariant/${id}`,
  )

  const mutation = gql`
    mutation priceListFixedPricesDelete($priceListId: ID!, $variantIds: [ID!]!) {
      priceListFixedPricesDelete(priceListId: $priceListId, variantIds: $variantIds) {
        deletedFixedPriceIds
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      priceListId: formattedPriceListId,
      variantIds: formattedVariantIds,
    })

    if (data.priceListFixedPricesDelete.userErrors && data.priceListFixedPricesDelete.userErrors.length > 0) {
      throw new Error(data.priceListFixedPricesDelete.userErrors[0].message)
    }

    return data.priceListFixedPricesDelete.deletedFixedPriceIds
  } catch (error) {
    console.error(`Error removing fixed prices from price list ${priceListId}:`, error)
    throw error
  }
}

// Función para obtener productos disponibles para añadir a una promoción
export async function fetchProductsForPromotion(searchTerm = "", limit = 20) {
  const query = gql`
    query GetProductsForPromotion($searchTerm: String, $limit: Int!) {
      products(first: $limit, query: $searchTerm) {
        edges {
          node {
            id
            title
            featuredImage {
              url
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  inventoryQuantity
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { searchTerm, limit })

    if (!data || !data.products || !data.products.edges) {
      console.error("Respuesta de productos incompleta:", data)
      return []
    }

    return data.products.edges.map((edge: any) => {
      const node = edge.node
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        featuredImage: node.featuredImage,
        variants: node.variants.edges.map((variantEdge: any) => {
          const variantNode = variantEdge.node
          return {
            id: variantNode.id.split("/").pop(),
            title: variantNode.title,
            price: variantNode.price,
            inventoryQuantity: variantNode.inventoryQuantity,
          }
        }),
      }
    })
  } catch (error) {
    console.error("Error fetching products for promotion:", error)
    return []
  }
}

// Función para obtener colecciones disponibles para añadir a una promoción
export async function fetchCollectionsForPromotion(searchTerm = "", limit = 20) {
  const query = gql`
    query GetCollectionsForPromotion($searchTerm: String, $limit: Int!) {
      collections(first: $limit, query: $searchTerm) {
        edges {
          node {
            id
            title
            productsCount
            image {
              url
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { searchTerm, limit })

    if (!data || !data.collections || !data.collections.edges) {
      console.error("Respuesta de colecciones incompleta:", data)
      return []
    }

    return data.collections.edges.map((edge: any) => {
      const node = edge.node
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        productsCount: node.productsCount,
        image: node.image,
      }
    })
  } catch (error) {
    console.error("Error fetching collections for promotion:", error)
    return []
  }
}

// Funciones auxiliares
function getCustomerPredicate(promotionData: Partial<Promotion>) {
  if (!promotionData.conditions || promotionData.conditions.length === 0) {
    return undefined
  }

  // Implementar lógica para convertir condiciones a predicados de Shopify
  const minAmountCondition = promotionData.conditions.find((c) => c.type === "MINIMUM_AMOUNT")
  if (minAmountCondition) {
    return `customer.orders.any(order, order.totalPrice >= ${minAmountCondition.value})`
  }

  const firstPurchaseCondition = promotionData.conditions.find((c) => c.type === "FIRST_PURCHASE")
  if (firstPurchaseCondition) {
    return "customer.orders.count == 0"
  }

  return undefined
}

function mapAdjustmentTypeToPromotionType(adjustmentType: string): "PERCENTAGE_DISCOUNT" | "FIXED_AMOUNT_DISCOUNT" {
  switch (adjustmentType) {
    case "PERCENTAGE_DECREASE":
      return "PERCENTAGE_DISCOUNT"
    case "FIXED_AMOUNT_OFF":
      return "FIXED_AMOUNT_DISCOUNT"
    default:
      return "PERCENTAGE_DISCOUNT"
  }
}

function parsePredicates(customerPredicate?: string, productPredicate?: string): PromotionCondition[] {
  const conditions: PromotionCondition[] = []

  if (customerPredicate?.includes("order.totalPrice >=")) {
    const match = customerPredicate.match(/order\.totalPrice >= (\d+)/)
    if (match && match[1]) {
      conditions.push({
        type: "MINIMUM_AMOUNT",
        value: Number.parseFloat(match[1]),
      })
    }
  }

  if (customerPredicate?.includes("customer.orders.count == 0")) {
    conditions.push({
      type: "FIRST_PURCHASE",
      value: true,
    })
  }

  if (productPredicate?.includes("product.inCollection")) {
    const match = productPredicate.match(/product\.inCollection$$['"]([^'"]+)['"]$$/)
    if (match && match[1]) {
      conditions.push({
        type: "SPECIFIC_CUSTOMER_GROUP",
        value: match[1],
      })
    }
  }

  return conditions
}

function determineTargetFromPredicate(productPredicate?: string): PromotionTarget {
  if (!productPredicate) return "CART"

  if (productPredicate.includes("product.inCollection")) {
    return "COLLECTION"
  }

  if (productPredicate.includes("product.id ==")) {
    return "PRODUCT"
  }

  if (productPredicate.includes("variant.id ==")) {
    return "VARIANT"
  }

  return "CART"
}
