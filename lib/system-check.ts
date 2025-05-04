import shopifyClient from "./shopify"
import { gql } from "graphql-request"

export async function performSystemCheck() {
  console.log("🔍 Iniciando verificación del sistema...")

  try {
    // 1. Verificar conexión con Shopify
    console.log("Verificando conexión con Shopify...")
    const shopName = await checkShopifyConnection()
    console.log(`✅ Conexión con Shopify establecida correctamente (Tienda: ${shopName})`)

    // 2. Verificar acceso a productos
    console.log("Verificando acceso a productos...")
    const productsCount = await checkProductsAccess()
    console.log(`✅ Acceso a productos verificado (${productsCount} productos disponibles)`)

    // 3. Verificar acceso a colecciones
    console.log("Verificando acceso a colecciones...")
    const collectionsCount = await checkCollectionsAccess()
    console.log(`✅ Acceso a colecciones verificado (${collectionsCount} colecciones disponibles)`)

    // 4. Verificar acceso a pedidos
    console.log("Verificando acceso a pedidos...")
    const ordersCount = await checkOrdersAccess()
    console.log(`✅ Acceso a pedidos verificado (${ordersCount} pedidos disponibles)`)

    console.log("✅ Verificación del sistema completada con éxito")
    return {
      success: true,
      shopName,
      counts: {
        products: productsCount,
        collections: collectionsCount,
        orders: ordersCount,
      },
    }
  } catch (error) {
    console.error("❌ Error durante la verificación del sistema:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

async function checkShopifyConnection() {
  try {
    const query = gql`
      query {
        shop {
          name
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.shop.name
  } catch (error) {
    throw new Error(`Error al conectar con Shopify: ${error.message}`)
  }
}

async function checkProductsAccess() {
  try {
    const query = gql`
      query {
        products(first: 1) {
          edges {
            node {
              id
            }
          }
          pageInfo {
            totalCount
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.products.pageInfo.totalCount || 0
  } catch (error) {
    throw new Error(`Error al acceder a productos: ${error.message}`)
  }
}

async function checkCollectionsAccess() {
  try {
    const query = gql`
      query {
        collections(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.collections.edges.length
  } catch (error) {
    throw new Error(`Error al acceder a colecciones: ${error.message}`)
  }
}

async function checkOrdersAccess() {
  try {
    const query = gql`
      query {
        orders(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.orders.edges.length
  } catch (error) {
    throw new Error(`Error al acceder a pedidos: ${error.message}`)
  }
}
