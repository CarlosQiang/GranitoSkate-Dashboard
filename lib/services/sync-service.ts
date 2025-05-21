"use server"

import { shopifyFetch } from "@/lib/shopify"
import { logSyncEvent } from "@/lib/db"
import * as productosRepository from "@/lib/repositories/productos-repository"
import * as coleccionesRepository from "@/lib/repositories/colecciones-repository"
import * as clientesRepository from "@/lib/repositories/clientes-repository"
import * as pedidosRepository from "@/lib/repositories/pedidos-repository"
import db from "@/lib/db/vercel-postgres"
import {
  fetchShopifyProducts,
  fetchShopifyCollections,
  fetchShopifyCustomers,
  fetchShopifyOrders,
  getShopifyProducts,
  getShopifyCollections,
} from "./shopify-service"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "sync-service",
})

// Función para obtener productos de Shopify
export async function obtenerProductosDeShopify(limit = 10) {
  try {
    console.log(`Obteniendo ${limit} productos de Shopify...`)

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.SHOPIFY_API_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error("Variables de entorno de Shopify no configuradas")
    }

    // Registrar inicio de la obtención
    await logSyncEvent("productos", null, "consulta", "iniciado", `Obteniendo productos de Shopify (límite: ${limit})`)

    // Consulta GraphQL para obtener productos
    const query = `
      query {
        products(first: ${limit}) {
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
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 5) {
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

    // Registrar éxito de la obtención
    const productCount = response.data.products.edges.length
    await logSyncEvent(
      "productos",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${productCount} productos de Shopify`,
    )

    console.log(`Se obtuvieron ${productCount} productos de Shopify`)
    return response.data.products.edges.map((edge: any) => edge.node)
  } catch (error: any) {
    // Registrar error
    await logSyncEvent(
      "productos",
      null,
      "consulta",
      "error",
      `Error al obtener productos de Shopify: ${error.message}`,
    )
    console.error("Error al obtener productos de Shopify:", error)
    throw error
  }
}

// Función para sincronizar productos desde Shopify
export async function sincronizarProductos(limit = 10) {
  try {
    console.log(`Iniciando sincronización de productos (límite: ${limit})...`)

    // Obtener productos reales de Shopify
    const productos = await obtenerProductosDeShopify(limit)

    const resultados = {
      total: productos.length,
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[],
    }

    // Registrar inicio de sincronización
    await logSyncEvent(
      "productos",
      null,
      "sincronizar",
      "iniciado",
      `Iniciando sincronización de ${productos.length} productos`,
    )

    for (const productoData of productos) {
      try {
        // Extraer el ID de Shopify
        const shopifyId = productoData.id.split("/").pop() || ""
        console.log(`Procesando producto: ${productoData.title} (ID: ${shopifyId})`)

        // Guardar producto usando el nuevo método simplificado
        const producto = await productosRepository.saveProductFromShopify(productoData)

        if (producto.id) {
          // Determinar si fue creado o actualizado
          if (
            producto.fecha_creacion &&
            producto.fecha_actualizacion &&
            new Date(producto.fecha_creacion).getTime() === new Date(producto.fecha_actualizacion).getTime()
          ) {
            resultados.creados++
            await logSyncEvent("productos", shopifyId, "crear", "exito", `Producto creado: ${productoData.title}`)
          } else {
            resultados.actualizados++
            await logSyncEvent(
              "productos",
              shopifyId,
              "actualizar",
              "exito",
              `Producto actualizado: ${productoData.title}`,
            )
          }
        }

        resultados.detalles.push({
          id: shopifyId,
          titulo: productoData.title,
          resultado: "exito",
        })
      } catch (error: any) {
        console.error("Error al sincronizar producto:", error)
        resultados.errores++
        resultados.detalles.push({
          id: productoData.id ? productoData.id.split("/").pop() : "",
          titulo: productoData.title || "Desconocido",
          resultado: "error",
          mensaje: error.message,
        })

        await logSyncEvent(
          "productos",
          productoData.id ? productoData.id.split("/").pop() : "",
          "sincronizar",
          "error",
          `Error al sincronizar producto: ${error.message}`,
          { error: error.message, stack: error.stack },
        )
      }
    }

    // Registrar finalización de sincronización
    await logSyncEvent(
      "productos",
      null,
      "sincronizar",
      "completado",
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )

    console.log(
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )
    return resultados
  } catch (error: any) {
    // Registrar error general
    await logSyncEvent("productos", null, "sincronizar", "error", `Error general en sincronización: ${error.message}`)
    console.error("Error general en sincronizarProductos:", error)
    throw error
  }
}

// Función para obtener colecciones de Shopify
export async function obtenerColeccionesDeShopify(limit = 50) {
  try {
    // Registrar inicio de la obtención
    await logSyncEvent(
      "colecciones",
      null,
      "consulta",
      "iniciado",
      `Obteniendo colecciones de Shopify (límite: ${limit})`,
    )

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
              image {
                url
                altText
              }
              products(first: 50) {
                edges {
                  node {
                    id
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

    if (!response.data || !response.data.collections) {
      throw new Error("No se pudieron obtener colecciones de Shopify")
    }

    // Registrar éxito de la obtención
    const collectionCount = response.data.collections.edges.length
    await logSyncEvent(
      "colecciones",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${collectionCount} colecciones de Shopify`,
    )

    return response.data.collections.edges.map((edge: any) => edge.node)
  } catch (error: any) {
    // Registrar error
    await logSyncEvent(
      "colecciones",
      null,
      "consulta",
      "error",
      `Error al obtener colecciones de Shopify: ${error.message}`,
    )
    console.error("Error al obtener colecciones de Shopify:", error)
    throw error
  }
}

// Función para sincronizar colecciones desde Shopify
export async function sincronizarColecciones(limit = 50) {
  try {
    console.log(`Iniciando sincronización de colecciones (límite: ${limit})...`)

    // Obtener colecciones reales de Shopify
    const colecciones = await obtenerColeccionesDeShopify(limit)

    const resultados = {
      total: colecciones.length,
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[],
    }

    // Registrar inicio de sincronización
    await logSyncEvent(
      "colecciones",
      null,
      "sincronizar",
      "iniciado",
      `Iniciando sincronización de ${colecciones.length} colecciones`,
    )

    for (const coleccionData of colecciones) {
      try {
        // Extraer el ID de Shopify
        const shopifyId = coleccionData.id.split("/").pop() || ""
        console.log(`Procesando colección: ${coleccionData.title} (ID: ${shopifyId})`)

        // Guardar colección usando el nuevo método simplificado
        const coleccion = await coleccionesRepository.saveColeccionFromShopify(coleccionData)

        if (coleccion.id) {
          // Determinar si fue creada o actualizada
          if (
            coleccion.fecha_creacion &&
            coleccion.fecha_actualizacion &&
            new Date(coleccion.fecha_creacion).getTime() === new Date(coleccion.fecha_actualizacion).getTime()
          ) {
            resultados.creados++
            await logSyncEvent("colecciones", shopifyId, "crear", "exito", `Colección creada: ${coleccionData.title}`)
          } else {
            resultados.actualizados++
            await logSyncEvent(
              "colecciones",
              shopifyId,
              "actualizar",
              "exito",
              `Colección actualizada: ${coleccionData.title}`,
            )
          }
        }

        resultados.detalles.push({
          id: shopifyId,
          titulo: coleccionData.title,
          resultado: "exito",
        })
      } catch (error: any) {
        console.error("Error al sincronizar colección:", error)
        resultados.errores++
        resultados.detalles.push({
          id: coleccionData.id ? coleccionData.id.split("/").pop() : "",
          titulo: coleccionData.title || "Desconocido",
          resultado: "error",
          mensaje: error.message,
        })

        await logSyncEvent(
          "colecciones",
          coleccionData.id ? coleccionData.id.split("/").pop() : "",
          "sincronizar",
          "error",
          `Error al sincronizar colección: ${error.message}`,
          { error: error.message, stack: error.stack },
        )
      }
    }

    // Registrar finalización de sincronización
    await logSyncEvent(
      "colecciones",
      null,
      "sincronizar",
      "completado",
      `Sincronización completada: ${resultados.creados} creadas, ${resultados.actualizados} actualizadas, ${resultados.errores} errores`,
    )

    console.log(
      `Sincronización completada: ${resultados.creados} creadas, ${resultados.actualizados} actualizadas, ${resultados.errores} errores`,
    )
    return resultados
  } catch (error: any) {
    // Registrar error general
    await logSyncEvent("colecciones", null, "sincronizar", "error", `Error general en sincronización: ${error.message}`)
    console.error("Error general en sincronizarColecciones:", error)
    throw error
  }
}

// Función para obtener clientes de Shopify
export async function obtenerClientesDeShopify(limit = 50) {
  try {
    // Registrar inicio de la obtención
    await logSyncEvent("clientes", null, "consulta", "iniciado", `Obteniendo clientes de Shopify (límite: ${limit})`)

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

    if (!response.data || !response.data.customers) {
      throw new Error("No se pudieron obtener clientes de Shopify")
    }

    // Registrar éxito de la obtención
    const customerCount = response.data.customers.edges.length
    await logSyncEvent("clientes", null, "consulta", "completado", `Se obtuvieron ${customerCount} clientes de Shopify`)

    return response.data.customers.edges.map((edge: any) => edge.node)
  } catch (error: any) {
    // Registrar error
    await logSyncEvent("clientes", null, "consulta", "error", `Error al obtener clientes de Shopify: ${error.message}`)
    console.error("Error al obtener clientes de Shopify:", error)
    throw error
  }
}

// Función para sincronizar clientes desde Shopify
export async function sincronizarClientes(limit = 50) {
  try {
    console.log(`Iniciando sincronización de clientes (límite: ${limit})...`)

    // Obtener clientes reales de Shopify
    const clientes = await obtenerClientesDeShopify(limit)

    const resultados = {
      total: clientes.length,
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[],
    }

    // Registrar inicio de sincronización
    await logSyncEvent(
      "clientes",
      null,
      "sincronizar",
      "iniciado",
      `Iniciando sincronización de ${clientes.length} clientes`,
    )

    for (const clienteData of clientes) {
      try {
        // Extraer el ID de Shopify
        const shopifyId = clienteData.id.split("/").pop() || ""
        console.log(`Procesando cliente: ${clienteData.firstName} ${clienteData.lastName} (ID: ${shopifyId})`)

        // Guardar cliente usando el nuevo método simplificado
        const cliente = await clientesRepository.saveClienteFromShopify(clienteData)

        if (cliente.id) {
          // Determinar si fue creado o actualizado
          if (
            cliente.fecha_creacion &&
            cliente.fecha_actualizacion &&
            new Date(cliente.fecha_creacion).getTime() === new Date(cliente.fecha_actualizacion).getTime()
          ) {
            resultados.creados++
            await logSyncEvent(
              "clientes",
              shopifyId,
              "crear",
              "exito",
              `Cliente creado: ${clienteData.firstName} ${clienteData.lastName}`,
            )
          } else {
            resultados.actualizados++
            await logSyncEvent(
              "clientes",
              shopifyId,
              "actualizar",
              "exito",
              `Cliente actualizado: ${clienteData.firstName} ${clienteData.lastName}`,
            )
          }
        }

        resultados.detalles.push({
          id: shopifyId,
          nombre: `${clienteData.firstName} ${clienteData.lastName}`,
          resultado: "exito",
        })
      } catch (error: any) {
        console.error("Error al sincronizar cliente:", error)
        resultados.errores++
        resultados.detalles.push({
          id: clienteData.id ? clienteData.id.split("/").pop() : "",
          nombre: `${clienteData.firstName || "Desconocido"} ${clienteData.lastName || ""}`,
          resultado: "error",
          mensaje: error.message,
        })

        await logSyncEvent(
          "clientes",
          clienteData.id ? clienteData.id.split("/").pop() : "",
          "sincronizar",
          "error",
          `Error al sincronizar cliente: ${error.message}`,
          { error: error.message, stack: error.stack },
        )
      }
    }

    // Registrar finalización de sincronización
    await logSyncEvent(
      "clientes",
      null,
      "sincronizar",
      "completado",
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )

    console.log(
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )
    return resultados
  } catch (error: any) {
    // Registrar error general
    await logSyncEvent("clientes", null, "sincronizar", "error", `Error general en sincronización: ${error.message}`)
    console.error("Error general en sincronizarClientes:", error)
    throw error
  }
}

// Función para obtener pedidos de Shopify
export async function obtenerPedidosDeShopify(limit = 50) {
  try {
    // Registrar inicio de la obtención
    await logSyncEvent("pedidos", null, "consulta", "iniciado", `Obteniendo pedidos de Shopify (límite: ${limit})`)

    // Consulta GraphQL para obtener pedidos
    const query = `
      query {
        orders(first: ${limit}) {
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

    if (!response.data || !response.data.orders) {
      throw new Error("No se pudieron obtener pedidos de Shopify")
    }

    // Registrar éxito de la obtención
    const orderCount = response.data.orders.edges.length
    await logSyncEvent("pedidos", null, "consulta", "completado", `Se obtuvieron ${orderCount} pedidos de Shopify`)

    return response.data.orders.edges.map((edge: any) => edge.node)
  } catch (error: any) {
    // Registrar error
    await logSyncEvent("pedidos", null, "consulta", "error", `Error al obtener pedidos de Shopify: ${error.message}`)
    console.error("Error al obtener pedidos de Shopify:", error)
    throw error
  }
}

// Función para sincronizar pedidos desde Shopify
export async function sincronizarPedidos(limit = 50) {
  try {
    console.log(`Iniciando sincronización de pedidos (límite: ${limit})...`)

    // Obtener pedidos reales de Shopify
    const pedidos = await obtenerPedidosDeShopify(limit)

    const resultados = {
      total: pedidos.length,
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[],
    }

    // Registrar inicio de sincronización
    await logSyncEvent(
      "pedidos",
      null,
      "sincronizar",
      "iniciado",
      `Iniciando sincronización de ${pedidos.length} pedidos`,
    )

    for (const pedidoData of pedidos) {
      try {
        // Extraer el ID de Shopify
        const shopifyId = pedidoData.id.split("/").pop() || ""
        console.log(`Procesando pedido: ${pedidoData.name} (ID: ${shopifyId})`)

        // Guardar pedido usando el nuevo método simplificado
        const pedido = await pedidosRepository.savePedidoFromShopify(pedidoData)

        if (pedido.id) {
          // Determinar si fue creado o actualizado
          if (
            pedido.fecha_creacion &&
            pedido.fecha_actualizacion &&
            new Date(pedido.fecha_creacion).getTime() === new Date(pedido.fecha_actualizacion).getTime()
          ) {
            resultados.creados++
            await logSyncEvent("pedidos", shopifyId, "crear", "exito", `Pedido creado: ${pedidoData.name}`)
          } else {
            resultados.actualizados++
            await logSyncEvent("pedidos", shopifyId, "actualizar", "exito", `Pedido actualizado: ${pedidoData.name}`)
          }
        }

        resultados.detalles.push({
          id: shopifyId,
          nombre: pedidoData.name,
          resultado: "exito",
        })
      } catch (error: any) {
        console.error("Error al sincronizar pedido:", error)
        resultados.errores++
        resultados.detalles.push({
          id: pedidoData.id ? pedidoData.id.split("/").pop() : "",
          nombre: pedidoData.name || "Desconocido",
          resultado: "error",
          mensaje: error.message,
        })

        await logSyncEvent(
          "pedidos",
          pedidoData.id ? pedidoData.id.split("/").pop() : "",
          "sincronizar",
          "error",
          `Error al sincronizar pedido: ${error.message}`,
          { error: error.message, stack: error.stack },
        )
      }
    }

    // Registrar finalización de sincronización
    await logSyncEvent(
      "pedidos",
      null,
      "sincronizar",
      "completado",
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )

    console.log(
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )
    return resultados
  } catch (error: any) {
    // Registrar error general
    await logSyncEvent("pedidos", null, "sincronizar", "error", `Error general en sincronización: ${error.message}`)
    console.error("Error general en sincronizarPedidos:", error)
    throw error
  }
}

// Función para sincronizar productos desde Shopify
export async function syncProducts(limit = 100) {
  try {
    // Obtener productos de Shopify
    const shopifyProducts = await fetchShopifyProducts(limit)

    if (!shopifyProducts || shopifyProducts.length === 0) {
      await db.logSyncEvent("productos", "BATCH", "sincronizar", "error", "No se encontraron productos en Shopify", {})
      return {
        success: false,
        message: "No se encontraron productos en Shopify",
      }
    }

    // Sincronizar cada producto
    const results = {
      total: shopifyProducts.length,
      success: 0,
      errors: 0,
      created: 0,
      updated: 0,
      details: [] as any[],
    }

    for (const product of shopifyProducts) {
      try {
        const result = await productosRepository.saveProductFromShopify(product)
        results.success++
        if (result.action === "updated") {
          results.updated++
        } else {
          results.created++
        }

        results.details.push({
          id: product.id,
          title: product.title,
          status: "success",
          action: result.action,
        })
      } catch (error) {
        results.errors++
        results.details.push({
          id: product.id,
          title: product.title,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Registrar evento de sincronización
    await db.logSyncEvent(
      "productos",
      "BATCH",
      "sincronizar",
      results.errors === 0 ? "exito" : "parcial",
      `Sincronización de productos: ${results.success} exitosos (${results.created} creados, ${results.updated} actualizados), ${results.errors} errores`,
      { results },
    )

    return {
      success: true,
      message: `Sincronización completada: ${results.success} productos sincronizados, ${results.errors} errores`,
      results,
    }
  } catch (error) {
    console.error("Error general al sincronizar productos:", error)

    // Registrar evento de error
    await db.logSyncEvent("productos", "BATCH", "sincronizar", "error", "Error general al sincronizar productos", {
      error: error instanceof Error ? error.message : String(error),
    })

    throw error
  }
}

// Función para sincronizar colecciones desde Shopify
export async function syncCollections(limit = 50) {
  try {
    console.log(`Iniciando sincronización de colecciones (límite: ${limit})...`)

    // Obtener colecciones de Shopify
    const shopifyCollections = await fetchShopifyCollections(limit)

    if (!shopifyCollections || shopifyCollections.length === 0) {
      await db.logSyncEvent(
        "colecciones",
        "BATCH",
        "sincronizar",
        "error",
        "No se encontraron colecciones en Shopify",
        {},
      )
      return {
        success: false,
        message: "No se encontraron colecciones en Shopify",
      }
    }

    // Sincronizar cada colección
    const results = {
      total: shopifyCollections.length,
      success: 0,
      errors: 0,
      created: 0,
      updated: 0,
      details: [] as any[],
    }

    for (const collection of shopifyCollections) {
      try {
        const result = await coleccionesRepository.saveColeccionFromShopify(collection)
        results.success++
        if (result.action === "updated") {
          results.updated++
        } else {
          results.created++
        }

        results.details.push({
          id: collection.id,
          title: collection.title,
          status: "success",
          action: result.action,
        })
      } catch (error) {
        results.errors++
        results.details.push({
          id: collection.id,
          title: collection.title,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Registrar evento de sincronización
    await db.logSyncEvent(
      "colecciones",
      "BATCH",
      "sincronizar",
      results.errors === 0 ? "exito" : "parcial",
      `Sincronización de colecciones: ${results.success} exitosas (${results.created} creadas, ${results.updated} actualizadas), ${results.errors} errores`,
      { results },
    )

    return {
      success: true,
      message: `Sincronización completada: ${results.success} colecciones sincronizadas, ${results.errors} errores`,
      results,
    }
  } catch (error) {
    console.error("Error general al sincronizar colecciones:", error)

    // Registrar evento de error
    await db.logSyncEvent("colecciones", "BATCH", "sincronizar", "error", "Error general al sincronizar colecciones", {
      error: error instanceof Error ? error.message : String(error),
    })

    throw error
  }
}

// Función para sincronizar clientes desde Shopify
export async function syncCustomers(limit = 50) {
  try {
    console.log(`Iniciando sincronización de clientes (límite: ${limit})...`)

    // Obtener clientes de Shopify
    const shopifyCustomers = await fetchShopifyCustomers(limit)

    if (!shopifyCustomers || shopifyCustomers.length === 0) {
      await db.logSyncEvent("clientes", "BATCH", "sincronizar", "error", "No se encontraron clientes en Shopify", {})
      return {
        success: false,
        message: "No se encontraron clientes en Shopify",
      }
    }

    // Sincronizar cada cliente
    const results = {
      success: true,
      syncedCount: 0,
      errorCount: 0,
      successfulCustomers: [],
      failedCustomers: [],
    }

    for (const customer of shopifyCustomers) {
      try {
        const result = await clientesRepository.saveClienteFromShopify(customer)
        results.syncedCount++
        results.successfulCustomers.push({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          action: result.accion,
        })
      } catch (error) {
        results.errorCount++
        results.failedCustomers.push({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Registrar evento de sincronización
    await db.logSyncEvent(
      "clientes",
      "BATCH",
      "sincronizar",
      results.errorCount === 0 ? "exito" : "parcial",
      `Sincronización de clientes: ${results.syncedCount} exitosos, ${results.errorCount} fallidos`,
      {
        syncedCount: results.syncedCount,
        errorCount: results.errorCount,
        successfulCustomers: results.successfulCustomers,
        failedCustomers: results.failedCustomers,
      },
    )

    return {
      success: true,
      message: `Sincronización completada: ${results.syncedCount} clientes sincronizados, ${results.errorCount} errores`,
      ...results,
    }
  } catch (error) {
    console.error("Error general al sincronizar clientes:", error)

    // Registrar evento de error
    await db.logSyncEvent("clientes", "BATCH", "sincronizar", "error", "Error general al sincronizar clientes", {
      error: error instanceof Error ? error.message : String(error),
    })

    return {
      success: false,
      message: "Error general al sincronizar clientes",
      error: error instanceof Error ? error.message : String(error),
      syncedCount: 0,
      errorCount: 1,
    }
  }
}

// Función para sincronizar pedidos desde Shopify
export async function syncOrders(limit = 50) {
  try {
    console.log(`Iniciando sincronización de pedidos (límite: ${limit})...`)

    // Obtener pedidos de Shopify
    const shopifyOrders = await fetchShopifyOrders(limit)

    if (!shopifyOrders || shopifyOrders.length === 0) {
      await db.logSyncEvent("pedidos", "BATCH", "sincronizar", "error", "No se encontraron pedidos en Shopify", {})
      return {
        success: false,
        message: "No se encontraron pedidos en Shopify",
      }
    }

    // Sincronizar cada pedido
    const results = {
      success: true,
      syncedCount: 0,
      errorCount: 0,
      successfulOrders: [],
      failedOrders: [],
    }

    for (const order of shopifyOrders) {
      try {
        const result = await pedidosRepository.savePedidoFromShopify(order)
        results.syncedCount++
        results.successfulOrders.push({
          id: order.id,
          name: order.name,
          action: result.accion,
        })
      } catch (error) {
        results.errorCount++
        results.failedOrders.push({
          id: order.id,
          name: order.name,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Registrar evento de sincronización
    await db.logSyncEvent(
      "pedidos",
      "BATCH",
      "sincronizar",
      results.errorCount === 0 ? "exito" : "parcial",
      `Sincronización de pedidos: ${results.syncedCount} exitosos, ${results.errorCount} fallidos`,
      {
        syncedCount: results.syncedCount,
        errorCount: results.errorCount,
        successfulOrders: results.successfulOrders,
        failedOrders: results.failedOrders,
      },
    )

    return {
      success: true,
      message: `Sincronización completada: ${results.syncedCount} pedidos sincronizados, ${results.errorCount} errores`,
      ...results,
    }
  } catch (error) {
    console.error("Error general al sincronizar pedidos:", error)

    // Registrar evento de error
    await db.logSyncEvent("pedidos", "BATCH", "sincronizar", "error", "Error general al sincronizar pedidos", {
      error: error instanceof Error ? error.message : String(error),
    })

    return {
      success: false,
      message: "Error general al sincronizar pedidos",
      error: error instanceof Error ? error.message : String(error),
      syncedCount: 0,
      errorCount: 1,
    }
  }
}

/**
 * Sincroniza productos de Shopify con la base de datos
 * @param limit Número máximo de productos a sincronizar
 * @returns Resultado de la sincronización
 */
export async function syncProductsToDatabase(limit = 100) {
  try {
    logger.info(`Iniciando sincronización de productos (límite: ${limit})`)

    // Obtener productos de Shopify
    const productos = await getShopifyProducts(true, limit)

    if (!productos || productos.length === 0) {
      logger.warn("No se encontraron productos en Shopify")
      return {
        success: false,
        message: "No se encontraron productos en Shopify",
      }
    }

    logger.info(`Se obtuvieron ${productos.length} productos de Shopify`)

    const results = {
      total: productos.length,
      success: 0,
      errors: 0,
      created: 0,
      updated: 0,
      details: [] as any[],
    }

    // Sincronizar cada producto
    for (const producto of productos) {
      try {
        logger.debug(`Sincronizando producto: ${producto.title}`)

        // Verificar si el producto ya existe
        const existingProduct = await productosRepository.getProductByShopifyId(producto.id)

        const result = await productosRepository.saveProductFromShopify(producto)

        results.success++
        if (existingProduct) {
          results.updated++
        } else {
          results.created++
        }

        results.details.push({
          id: producto.id,
          title: producto.title,
          status: "success",
          action: existingProduct ? "updated" : "created",
        })

        logger.debug(`Producto sincronizado correctamente: ${producto.title}`)
      } catch (error) {
        logger.error(`Error al sincronizar producto ${producto.id}`, {
          error: error instanceof Error ? error.message : "Error desconocido",
        })

        results.errors++
        results.details.push({
          id: producto.id,
          title: producto.title,
          status: "error",
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    // Registrar el evento de sincronización
    await db.logSyncEvent(
      "productos",
      "BATCH",
      "sincronizar",
      results.errors === 0 ? "exito" : "parcial",
      `Sincronización de productos: ${results.success} exitosos (${results.created} creados, ${results.updated} actualizados), ${results.errors} errores`,
      { results },
    )

    logger.info(`Sincronización de productos completada: ${results.success} exitosos, ${results.errors} errores`)

    return {
      success: true,
      message: `Sincronización completada: ${results.success} productos sincronizados, ${results.errors} errores`,
      results,
    }
  } catch (error) {
    logger.error("Error al sincronizar productos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Registrar el error
    await db.logSyncEvent("productos", "BATCH", "sincronizar", "error", "Error general al sincronizar productos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    throw error
  }
}

/**
 * Sincroniza colecciones de Shopify con la base de datos
 * @param limit Número máximo de colecciones a sincronizar
 * @returns Resultado de la sincronización
 */
export async function syncCollectionsToDatabase(limit = 50) {
  try {
    logger.info(`Iniciando sincronización de colecciones (límite: ${limit})`)

    // Obtener colecciones de Shopify
    const colecciones = await getShopifyCollections(true, limit)

    if (!colecciones || colecciones.length === 0) {
      logger.warn("No se encontraron colecciones en Shopify")
      return {
        success: false,
        message: "No se encontraron colecciones en Shopify",
      }
    }

    logger.info(`Se obtuvieron ${colecciones.length} colecciones de Shopify`)

    const results = {
      total: colecciones.length,
      success: 0,
      errors: 0,
      created: 0,
      updated: 0,
      details: [] as any[],
    }

    // Sincronizar cada colección
    for (const coleccion of colecciones) {
      try {
        logger.debug(`Sincronizando colección: ${coleccion.title}`)

        // Verificar si la colección ya existe
        const existingCollection = await coleccionesRepository.getCollectionByShopifyId(coleccion.id)

        const result = await coleccionesRepository.saveColeccionFromShopify(coleccion)

        results.success++
        if (existingCollection) {
          results.updated++
        } else {
          results.created++
        }

        results.details.push({
          id: coleccion.id,
          title: coleccion.title,
          status: "success",
          action: existingCollection ? "updated" : "created",
        })

        logger.debug(`Colección sincronizada correctamente: ${coleccion.title}`)
      } catch (error) {
        logger.error(`Error al sincronizar colección ${coleccion.id}`, {
          error: error instanceof Error ? error.message : "Error desconocido",
        })

        results.errors++
        results.details.push({
          id: coleccion.id,
          title: coleccion.title,
          status: "error",
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    // Registrar el evento de sincronización
    await db.logSyncEvent(
      "colecciones",
      "BATCH",
      "sincronizar",
      results.errors === 0 ? "exito" : "parcial",
      `Sincronización de colecciones: ${results.success} exitosas (${results.created} creadas, ${results.updated} actualizadas), ${results.errors} errores`,
      { results },
    )

    logger.info(`Sincronización de colecciones completada: ${results.success} exitosas, ${results.errors} errores`)

    return {
      success: true,
      message: `Sincronización completada: ${results.success} colecciones sincronizadas, ${results.errors} errores`,
      results,
    }
  } catch (error) {
    logger.error("Error al sincronizar colecciones", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Registrar el error
    await db.logSyncEvent("colecciones", "BATCH", "sincronizar", "error", "Error general al sincronizar colecciones", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    throw error
  }
}

/**
 * Sincroniza un producto específico de Shopify con la base de datos
 * @param shopifyId ID de Shopify del producto
 * @returns Resultado de la sincronización
 */
export async function syncProductByShopifyId(shopifyId: string) {
  try {
    logger.info(`Iniciando sincronización de producto con ID ${shopifyId}`)

    // Obtener productos de Shopify
    const productos = await getShopifyProducts(true)

    // Encontrar el producto específico
    const producto = productos.find((p) => p.id === shopifyId || p.id.includes(shopifyId))

    if (!producto) {
      logger.warn(`No se encontró el producto con ID ${shopifyId} en Shopify`)
      return {
        success: false,
        message: `No se encontró el producto con ID ${shopifyId} en Shopify`,
      }
    }

    logger.info(`Producto encontrado en Shopify: ${producto.title}`)

    // Sincronizar el producto
    const result = await productosRepository.saveProductFromShopify(producto)

    logger.info(`Producto sincronizado correctamente: ${producto.title}`)

    return {
      success: true,
      message: `Producto sincronizado correctamente: ${producto.title}`,
      data: result,
    }
  } catch (error) {
    logger.error(`Error al sincronizar producto con ID ${shopifyId}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    throw error
  }
}

/**
 * Sincroniza una colección específica de Shopify con la base de datos
 * @param shopifyId ID de Shopify de la colección
 * @returns Resultado de la sincronización
 */
export async function syncCollectionByShopifyId(shopifyId: string) {
  try {
    logger.info(`Iniciando sincronización de colección con ID ${shopifyId}`)

    // Obtener colecciones de Shopify
    const colecciones = await getShopifyCollections(true)

    // Encontrar la colección específica
    const coleccion = colecciones.find((c) => c.id === shopifyId || c.id.includes(shopifyId))

    if (!coleccion) {
      logger.warn(`No se encontró la colección con ID ${shopifyId} en Shopify`)
      return {
        success: false,
        message: `No se encontró la colección con ID ${shopifyId} en Shopify`,
      }
    }

    logger.info(`Colección encontrada en Shopify: ${coleccion.title}`)

    // Sincronizar la colección
    const result = await coleccionesRepository.saveColeccionFromShopify(coleccion)

    logger.info(`Colección sincronizada correctamente: ${coleccion.title}`)

    return {
      success: true,
      message: `Colección sincronizada correctamente: ${coleccion.title}`,
      data: result,
    }
  } catch (error) {
    logger.error(`Error al sincronizar colección con ID ${shopifyId}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    throw error
  }
}

// Exportar todas las funciones
