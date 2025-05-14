import { shopifyFetch } from "./shopify"

// Función para obtener productos de Shopify
export async function getProducts(limit = 50) {
  try {
    const response = await shopifyFetch({
      endpoint: `products.json?limit=${limit}`,
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.statusText}`)
    }

    const data = await response.json()
    return data.products
  } catch (error) {
    console.error("Error al obtener productos de Shopify:", error)
    throw error
  }
}

// Función para obtener colecciones de Shopify
export async function getCollections(limit = 50) {
  try {
    const response = await shopifyFetch({
      endpoint: `custom_collections.json?limit=${limit}`,
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener colecciones: ${response.statusText}`)
    }

    const data = await response.json()
    return data.custom_collections
  } catch (error) {
    console.error("Error al obtener colecciones de Shopify:", error)
    throw error
  }
}

// Función para obtener clientes de Shopify
export async function getCustomers(limit = 50) {
  try {
    const response = await shopifyFetch({
      endpoint: `customers.json?limit=${limit}`,
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener clientes: ${response.statusText}`)
    }

    const data = await response.json()
    return data.customers
  } catch (error) {
    console.error("Error al obtener clientes de Shopify:", error)
    throw error
  }
}

// Función para obtener pedidos de Shopify
export async function getOrders(limit = 50) {
  try {
    const response = await shopifyFetch({
      endpoint: `orders.json?limit=${limit}&status=any`,
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Error al obtener pedidos: ${response.statusText}`)
    }

    const data = await response.json()
    return data.orders
  } catch (error) {
    console.error("Error al obtener pedidos de Shopify:", error)
    throw error
  }
}

// Función para obtener promociones (price rules y discount codes) de Shopify
export async function getPromotions(limit = 50) {
  try {
    // Obtener price rules
    const priceRulesResponse = await shopifyFetch({
      endpoint: `price_rules.json?limit=${limit}`,
      method: "GET",
    })

    if (!priceRulesResponse.ok) {
      throw new Error(`Error al obtener price rules: ${priceRulesResponse.statusText}`)
    }

    const priceRulesData = await priceRulesResponse.json()
    const priceRules = priceRulesData.price_rules

    // Para cada price rule, obtener sus discount codes
    const promotions = []
    for (const rule of priceRules) {
      const discountCodesResponse = await shopifyFetch({
        endpoint: `price_rules/${rule.id}/discount_codes.json`,
        method: "GET",
      })

      if (discountCodesResponse.ok) {
        const discountCodesData = await discountCodesResponse.json()
        const discountCodes = discountCodesData.discount_codes

        // Combinar price rule con sus discount codes
        for (const code of discountCodes) {
          promotions.push({
            id: code.id,
            price_rule_id: rule.id,
            code: code.code,
            title: rule.title,
            value_type: rule.value_type,
            value: rule.value,
            target_type: rule.target_type,
            target_selection: rule.target_selection,
            allocation_method: rule.allocation_method,
            starts_at: rule.starts_at,
            ends_at: rule.ends_at,
            status: code.status || rule.status,
            usage_limit: rule.usage_limit,
          })
        }
      }
    }

    return promotions
  } catch (error) {
    console.error("Error al obtener promociones de Shopify:", error)
    throw error
  }
}

// Función para verificar la conexión con Shopify
export async function verifyShopifyConnection() {
  try {
    const response = await shopifyFetch({
      endpoint: "shop.json",
      method: "GET",
    })

    if (!response.ok) {
      return { connected: false, error: response.statusText }
    }

    const data = await response.json()
    return { connected: true, shop: data.shop }
  } catch (error) {
    console.error("Error al verificar conexión con Shopify:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
