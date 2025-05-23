import { shopifyFetch } from "@/lib/shopify"
import { shopifyCache } from "@/lib/services/cache-service"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "shopify-service",
})

// Caché en memoria para productos
let productCache = []
let productCacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Caché en memoria para colecciones
let collectionCache = []
let collectionCacheTimestamp = 0

// Caché en memoria para clientes
let customerCache = []
let customerCacheTimestamp = 0

// Caché en memoria para pedidos
let orderCache = []
let orderCacheTimestamp = 0

/**
 * Obtiene productos de Shopify y los almacena en caché
 * @param forceRefresh Si es true, ignora la caché y obtiene datos frescos de Shopify
 * @param limit Número máximo de productos a obtener
 * @returns Array de productos
 */
export async function fetchShopifyProducts(forceRefresh = false, limit = 100) {
  try {
    // Si la caché es válida y no se fuerza la actualización, devolver datos en caché
    const now = Date.now()
    if (!forceRefresh && productCache.length > 0 && now - productCacheTimestamp < CACHE_TTL) {
      logger.debug("Usando productos en caché", { count: productCache.length })
      return productCache
    }

    logger.info(`Obteniendo ${limit} productos de Shopify...`)

    // Consulta GraphQL para obtener productos
    const query = `
      query {
        products(first: ${limit}, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              description
              productType
              vendor
              status
              publishedAt
              handle
              tags
              featuredImage {
                url
                altText
              }
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    weight
                    weightUnit
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.products) {
      throw new Error("No se pudieron obtener productos de Shopify: respuesta vacía o inválida")
    }

    // Extraer productos de la respuesta
    const products = response.data.products.edges.map((edge) => edge.node)
    logger.info(`Se obtuvieron ${products.length} productos de Shopify`)

    // Almacenar en caché
    productCache = products
    productCacheTimestamp = now

    // También almacenar en el servicio de caché global
    shopifyCache.cacheProducts(products)

    return products
  } catch (error) {
    logger.error("Error al obtener productos de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Si hay un error pero tenemos datos en caché, devolverlos como fallback
    if (productCache.length > 0) {
      logger.info("Usando productos en caché como fallback después de un error", { count: productCache.length })
      return productCache
    }

    // Si hay productos en el caché global, usarlos como último recurso
    if (shopifyCache.getProductCacheSize() > 0) {
      logger.info("Usando productos del caché global como último recurso", {
        count: shopifyCache.getProductCacheSize(),
      })
      return shopifyCache.getAllProducts()
    }

    throw error
  }
}

/**
 * Obtiene colecciones de Shopify y las almacena en caché
 * @param forceRefresh Si es true, ignora la caché y obtiene datos frescos de Shopify
 * @param limit Número máximo de colecciones a obtener
 * @returns Array de colecciones
 */
export async function fetchShopifyCollections(forceRefresh = false, limit = 50) {
  try {
    // Si la caché es válida y no se fuerza la actualización, devolver datos en caché
    const now = Date.now()
    if (!forceRefresh && collectionCache.length > 0 && now - collectionCacheTimestamp < CACHE_TTL) {
      logger.debug("Usando colecciones en caché", { count: collectionCache.length })
      return collectionCache
    }

    logger.info(`Obteniendo ${limit} colecciones de Shopify...`)

    // Consulta GraphQL para obtener colecciones
    const query = `
      query {
        collections(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              handle
              productsCount
              image {
                url
                altText
              }
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.collections) {
      throw new Error("No se pudieron obtener colecciones de Shopify: respuesta vacía o inválida")
    }

    // Extraer colecciones de la respuesta
    const collections = response.data.collections.edges.map((edge) => edge.node)
    logger.info(`Se obtuvieron ${collections.length} colecciones de Shopify`)

    // Almacenar en caché
    collectionCache = collections
    collectionCacheTimestamp = now

    // También almacenar en el servicio de caché global
    shopifyCache.cacheCollections(collections)

    return collections
  } catch (error) {
    logger.error("Error al obtener colecciones de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Si hay un error pero tenemos datos en caché, devolverlos como fallback
    if (collectionCache.length > 0) {
      logger.info("Usando colecciones en caché como fallback después de un error", { count: collectionCache.length })
      return collectionCache
    }

    // Si hay colecciones en el caché global, usarlas como último recurso
    if (shopifyCache.getCollectionCacheSize() > 0) {
      logger.info("Usando colecciones del caché global como último recurso", {
        count: shopifyCache.getCollectionCacheSize(),
      })
      return shopifyCache.getAllCollections()
    }

    throw error
  }
}

/**
 * Obtiene clientes de Shopify y los almacena en caché
 * @param forceRefresh Si es true, ignora la caché y obtiene datos frescos de Shopify
 * @param limit Número máximo de clientes a obtener
 * @returns Array de clientes
 */
export async function fetchShopifyCustomers(forceRefresh = false, limit = 50) {
  try {
    // Si la caché es válida y no se fuerza la actualización, devolver datos en caché
    const now = Date.now()
    if (!forceRefresh && customerCache.length > 0 && now - customerCacheTimestamp < CACHE_TTL) {
      logger.debug("Usando clientes en caché", { count: customerCache.length })
      return customerCache
    }

    logger.info(`Obteniendo ${limit} clientes de Shopify...`)

    // Consulta GraphQL para obtener clientes
    const query = `
      query {
        customers(first: ${limit}) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              acceptsMarketing
              note
              tags
              addresses(first: 5) {
                edges {
                  node {
                    id
                    address1
                    address2
                    city
                    province
                    zip
                    country
                    firstName
                    lastName
                    phone
                    company
                  }
                }
              }
              defaultAddress {
                id
              }
              orders(first: 5) {
                edges {
                  node {
                    id
                    name
                    totalPriceSet {
                      shopMoney {
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
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.customers) {
      throw new Error("No se pudieron obtener clientes de Shopify: respuesta vacía o inválida")
    }

    // Extraer clientes de la respuesta
    const customers = response.data.customers.edges.map((edge) => edge.node)
    logger.info(`Se obtuvieron ${customers.length} clientes de Shopify`)

    // Almacenar en caché
    customerCache = customers
    customerCacheTimestamp = now

    // También almacenar en el servicio de caché global
    shopifyCache.cacheCustomers(customers)

    return customers
  } catch (error) {
    logger.error("Error al obtener clientes de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Si hay un error pero tenemos datos en caché, devolverlos como fallback
    if (customerCache.length > 0) {
      logger.info("Usando clientes en caché como fallback después de un error", { count: customerCache.length })
      return customerCache
    }

    // Si hay clientes en el caché global, usarlos como último recurso
    if (shopifyCache.getCustomerCacheSize() > 0) {
      logger.info("Usando clientes del caché global como último recurso", {
        count: shopifyCache.getCustomerCacheSize(),
      })
      return shopifyCache.getAllCustomers()
    }

    throw error
  }
}

/**
 * Obtiene pedidos de Shopify y los almacena en caché
 * @param forceRefresh Si es true, ignora la caché y obtiene datos frescos de Shopify
 * @param limit Número máximo de pedidos a obtener
 * @returns Array de pedidos
 */
export async function fetchShopifyOrders(forceRefresh = false, limit = 50) {
  try {
    // Si la caché es válida y no se fuerza la actualización, devolver datos en caché
    const now = Date.now()
    if (!forceRefresh && orderCache.length > 0 && now - orderCacheTimestamp < CACHE_TTL) {
      logger.debug("Usando pedidos en caché", { count: orderCache.length })
      return orderCache
    }

    logger.info(`Obteniendo ${limit} pedidos de Shopify...`)

    // Consulta GraphQL para obtener pedidos
    const query = `
      query {
        orders(first: ${limit}, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              email
              phone
              processedAt
              financialStatus
              fulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalShippingPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                firstName
                lastName
                email
              }
              lineItems(first: 20) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                      sku
                      price
                      product {
                        id
                      }
                    }
                    originalTotalSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              shippingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                zip
                country
                phone
              }
              transactions(first: 5) {
                edges {
                  node {
                    id
                    kind
                    status
                    gateway
                    amountSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    errorCode
                    createdAt
                  }
                }
              }
              tags
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.orders) {
      throw new Error("No se pudieron obtener pedidos de Shopify: respuesta vacía o inválida")
    }

    // Extraer pedidos de la respuesta
    const orders = response.data.orders.edges.map((edge) => edge.node)
    logger.info(`Se obtuvieron ${orders.length} pedidos de Shopify`)

    // Almacenar en caché
    orderCache = orders
    orderCacheTimestamp = now

    // También almacenar en el servicio de caché global
    shopifyCache.cacheOrders(orders)

    return orders
  } catch (error) {
    logger.error("Error al obtener pedidos de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Si hay un error pero tenemos datos en caché, devolverlos como fallback
    if (orderCache.length > 0) {
      logger.info("Usando pedidos en caché como fallback después de un error", { count: orderCache.length })
      return orderCache
    }

    // Si hay pedidos en el caché global, usarlos como último recurso
    if (shopifyCache.getOrderCacheSize() > 0) {
      logger.info("Usando pedidos del caché global como último recurso", {
        count: shopifyCache.getOrderCacheSize(),
      })
      return shopifyCache.getAllOrders()
    }

    throw error
  }
}

/**
 * Obtiene estadísticas de la caché
 * @returns Estadísticas de la caché
 */
export function getCacheStats() {
  return {
    productos: {
      cantidad: productCache.length,
      ultimaActualizacion: new Date(productCacheTimestamp).toISOString(),
      tiempoTranscurrido: Date.now() - productCacheTimestamp,
      valido: Date.now() - productCacheTimestamp < CACHE_TTL,
    },
    colecciones: {
      cantidad: collectionCache.length,
      ultimaActualizacion: new Date(collectionCacheTimestamp).toISOString(),
      tiempoTranscurrido: Date.now() - collectionCacheTimestamp,
      valido: Date.now() - collectionCacheTimestamp < CACHE_TTL,
    },
    clientes: {
      cantidad: customerCache.length,
      ultimaActualizacion: new Date(customerCacheTimestamp).toISOString(),
      tiempoTranscurrido: Date.now() - customerCacheTimestamp,
      valido: Date.now() - customerCacheTimestamp < CACHE_TTL,
    },
    pedidos: {
      cantidad: orderCache.length,
      ultimaActualizacion: new Date(orderCacheTimestamp).toISOString(),
      tiempoTranscurrido: Date.now() - orderCacheTimestamp,
      valido: Date.now() - orderCacheTimestamp < CACHE_TTL,
    },
  }
}

/**
 * Limpia la caché
 */
export function clearCache() {
  productCache = []
  productCacheTimestamp = 0
  collectionCache = []
  collectionCacheTimestamp = 0
  customerCache = []
  customerCacheTimestamp = 0
  orderCache = []
  orderCacheTimestamp = 0

  // También limpiar el caché global
  shopifyCache.clearCache()

  logger.info("Caché limpiada correctamente")

  return {
    success: true,
    message: "Caché limpiada correctamente",
  }
}

// Inicializar caché
console.log("Inicializando caché de datos de Shopify")

// Exportar todas las funciones
export {
  fetchShopifyProducts as getShopifyProducts,
  fetchShopifyCollections as getShopifyCollections,
  fetchShopifyCustomers as getShopifyCustomers,
  fetchShopifyOrders as getShopifyOrders,
}
