import { shopifyFetch } from "@/lib/shopify"
import { shopifyCache } from "./cache-service"

/**
 * Obtiene productos de Shopify y los almacena en caché
 * @param forceRefresh Si es true, ignora la caché y obtiene datos frescos de Shopify
 * @param limit Número máximo de productos a obtener
 * @returns Array de productos
 */
export async function fetchShopifyProducts(forceRefresh = false, limit = 100): Promise<any[]> {
  try {
    // Si la caché es válida y no se fuerza la actualización, devolver datos en caché
    if (!forceRefresh && shopifyCache.isProductCacheValid() && shopifyCache.getProductCacheSize() > 0) {
      console.log("Usando productos en caché")
      return shopifyCache.getAllProducts()
    }

    console.log(`Obteniendo ${limit} productos de Shopify...`)

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
      const errorMessage = response.errors.map((e: any) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.products) {
      throw new Error("No se pudieron obtener productos de Shopify: respuesta vacía o inválida")
    }

    // Extraer productos de la respuesta
    const products = response.data.products.edges.map((edge: any) => edge.node)
    console.log(`Se obtuvieron ${products.length} productos de Shopify`)

    // Almacenar en caché
    shopifyCache.cacheProducts(products)

    return products
  } catch (error: any) {
    console.error("Error al obtener productos de Shopify:", error)

    // Si hay un error pero tenemos datos en caché, devolverlos como fallback
    if (shopifyCache.getProductCacheSize() > 0) {
      console.log("Usando productos en caché como fallback después de un error")
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
export async function fetchShopifyCollections(forceRefresh = false, limit = 50): Promise<any[]> {
  try {
    // Si la caché es válida y no se fuerza la actualización, devolver datos en caché
    if (!forceRefresh && shopifyCache.isCollectionCacheValid() && shopifyCache.getCollectionCacheSize() > 0) {
      console.log("Usando colecciones en caché")
      return shopifyCache.getAllCollections()
    }

    console.log(`Obteniendo ${limit} colecciones de Shopify...`)

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
      const errorMessage = response.errors.map((e: any) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.collections) {
      throw new Error("No se pudieron obtener colecciones de Shopify: respuesta vacía o inválida")
    }

    // Extraer colecciones de la respuesta
    const collections = response.data.collections.edges.map((edge: any) => edge.node)
    console.log(`Se obtuvieron ${collections.length} colecciones de Shopify`)

    // Almacenar en caché
    shopifyCache.cacheCollections(collections)

    return collections
  } catch (error: any) {
    console.error("Error al obtener colecciones de Shopify:", error)

    // Si hay un error pero tenemos datos en caché, devolverlos como fallback
    if (shopifyCache.getCollectionCacheSize() > 0) {
      console.log("Usando colecciones en caché como fallback después de un error")
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
export async function fetchShopifyCustomers(forceRefresh = false, limit = 50): Promise<any[]> {
  try {
    // Si la caché es válida y no se fuerza la actualización, devolver datos en caché
    if (!forceRefresh && shopifyCache.isCustomerCacheValid() && shopifyCache.getCustomerCacheSize() > 0) {
      console.log("Usando clientes en caché")
      return shopifyCache.getAllCustomers()
    }

    console.log(`Obteniendo ${limit} clientes de Shopify...`)

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
      const errorMessage = response.errors.map((e: any) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.customers) {
      throw new Error("No se pudieron obtener clientes de Shopify: respuesta vacía o inválida")
    }

    // Extraer clientes de la respuesta
    const customers = response.data.customers.edges.map((edge: any) => edge.node)
    console.log(`Se obtuvieron ${customers.length} clientes de Shopify`)

    // Almacenar en caché
    shopifyCache.cacheCustomers(customers)

    return customers
  } catch (error: any) {
    console.error("Error al obtener clientes de Shopify:", error)

    // Si hay un error pero tenemos datos en caché, devolverlos como fallback
    if (shopifyCache.getCustomerCacheSize() > 0) {
      console.log("Usando clientes en caché como fallback después de un error")
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
export async function fetchShopifyOrders(forceRefresh = false, limit = 50): Promise<any[]> {
  try {
    // Si la caché es válida y no se fuerza la actualización, devolver datos en caché
    if (!forceRefresh && shopifyCache.isOrderCacheValid() && shopifyCache.getOrderCacheSize() > 0) {
      console.log("Usando pedidos en caché")
      return shopifyCache.getAllOrders()
    }

    console.log(`Obteniendo ${limit} pedidos de Shopify...`)

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
      const errorMessage = response.errors.map((e: any) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.orders) {
      throw new Error("No se pudieron obtener pedidos de Shopify: respuesta vacía o inválida")
    }

    // Extraer pedidos de la respuesta
    const orders = response.data.orders.edges.map((edge: any) => edge.node)
    console.log(`Se obtuvieron ${orders.length} pedidos de Shopify`)

    // Almacenar en caché
    shopifyCache.cacheOrders(orders)

    return orders
  } catch (error: any) {
    console.error("Error al obtener pedidos de Shopify:", error)

    // Si hay un error pero tenemos datos en caché, devolverlos como fallback
    if (shopifyCache.getOrderCacheSize() > 0) {
      console.log("Usando pedidos en caché como fallback después de un error")
      return shopifyCache.getAllOrders()
    }

    throw error
  }
}

/**
 * Obtiene estadísticas de la caché
 * @returns Estadísticas de la caché
 */
export function getCacheStats(): Record<string, any> {
  return shopifyCache.getCacheStats()
}

/**
 * Limpia la caché
 */
export function clearCache(): void {
  shopifyCache.clearCache()
}
