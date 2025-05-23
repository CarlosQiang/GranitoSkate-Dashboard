"use server"

import { shopifyFetch } from "@/lib/shopify"
import { logSyncEvent } from "@/lib/db"
import { saveProductFromShopify } from "@/lib/repositories/productos-repository"
import { saveColeccionFromShopify } from "@/lib/repositories/colecciones-repository"
import { saveClienteFromShopify } from "@/lib/repositories/clientes-repository"
import { savePedidoFromShopify } from "@/lib/repositories/pedidos-repository"

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
        const producto = await saveProductFromShopify(productoData)

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
        const coleccion = await saveColeccionFromShopify(coleccionData)

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
        const cliente = await saveClienteFromShopify(clienteData)

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
        const pedido = await savePedidoFromShopify(pedidoData)

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

// Exportar cada función individualmente
// Las funciones ya están siendo exportadas individualmente arriba
