"use server"

import { createProducto, getProductoByShopifyId, updateProducto } from "@/lib/db/repositories/productos-repository"
import { createVariante } from "@/lib/db/repositories/productos-repository"
import { createImagen } from "@/lib/db/repositories/productos-repository"
import { query } from "@/lib/db"
import { shopifyFetch } from "@/lib/shopify-client"

// Función para registrar la sincronización
async function registrarSincronizacion(
  tipoEntidad: string,
  entidadId: string | null,
  accion: string,
  resultado: string,
  mensaje: string,
  detalles?: any,
) {
  try {
    await query(
      `INSERT INTO registro_sincronizacion (
        tipo_entidad, entidad_id, accion, resultado, mensaje, detalles
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [tipoEntidad, entidadId, accion, resultado, mensaje, detalles ? JSON.stringify(detalles) : null],
    )
  } catch (error) {
    console.error("Error al registrar sincronización:", error)
  }
}

// Función para obtener productos reales de Shopify
export async function obtenerProductosDeShopify(limit = 50) {
  try {
    // Registrar inicio de la obtención
    await registrarSincronizacion(
      "productos",
      null,
      "consulta",
      "iniciado",
      `Obteniendo productos de Shopify (límite: ${limit})`,
    )

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
              images(first: 10) {
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
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    if (!response.data || !response.data.products) {
      throw new Error("No se pudieron obtener productos de Shopify")
    }

    // Registrar éxito de la obtención
    const productCount = response.data.products.edges.length
    await registrarSincronizacion(
      "productos",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${productCount} productos de Shopify`,
    )

    return response.data.products.edges.map((edge: any) => edge.node)
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
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
export async function sincronizarProductos(limit = 50) {
  try {
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
    await registrarSincronizacion(
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

        // Verificar si el producto ya existe
        const productoExistente = shopifyId ? await getProductoByShopifyId(shopifyId) : null

        // Preparar los datos del producto
        const productoObj = {
          shopify_id: shopifyId,
          titulo: productoData.title || "",
          descripcion: productoData.description || "",
          tipo_producto: productoData.productType || "",
          proveedor: productoData.vendor || "",
          estado: (productoData.status || "").toLowerCase(),
          publicado: productoData.status === "ACTIVE",
          destacado: false,
          etiquetas: productoData.tags || [],
          imagen_destacada_url: productoData.images?.edges?.length > 0 ? productoData.images.edges[0].node.url : "",
          precio_base:
            productoData.variants?.edges?.length > 0 ? Number.parseFloat(productoData.variants.edges[0].node.price) : 0,
          precio_comparacion:
            productoData.variants?.edges?.length > 0 && productoData.variants.edges[0].node.compareAtPrice
              ? Number.parseFloat(productoData.variants.edges[0].node.compareAtPrice)
              : null,
          sku: productoData.variants?.edges?.length > 0 ? productoData.variants.edges[0].node.sku : "",
          codigo_barras: productoData.variants?.edges?.length > 0 ? productoData.variants.edges[0].node.barcode : "",
          inventario_disponible:
            productoData.variants?.edges?.length > 0 ? productoData.variants.edges[0].node.inventoryQuantity || 0 : 0,
          politica_inventario:
            productoData.variants?.edges?.length > 0
              ? productoData.variants.edges[0].node.inventoryPolicy?.toLowerCase() || ""
              : "",
          requiere_envio: true,
          peso: productoData.variants?.edges?.length > 0 ? productoData.variants.edges[0].node.weight || 0 : 0,
          unidad_peso:
            productoData.variants?.edges?.length > 0
              ? productoData.variants.edges[0].node.weightUnit?.toLowerCase() || "kg"
              : "kg",
          url_handle: productoData.handle || "",
          fecha_publicacion: productoData.publishedAt ? new Date(productoData.publishedAt) : null,
        }

        let producto

        // Crear o actualizar el producto
        if (productoExistente) {
          producto = await updateProducto(productoExistente.id, productoObj)
          resultados.actualizados++
          await registrarSincronizacion(
            "productos",
            shopifyId,
            "actualizar",
            "exito",
            `Producto actualizado: ${productoObj.titulo}`,
          )
        } else {
          producto = await createProducto(productoObj)
          resultados.creados++
          await registrarSincronizacion(
            "productos",
            shopifyId,
            "crear",
            "exito",
            `Producto creado: ${productoObj.titulo}`,
          )
        }

        // Procesar variantes si existen
        if (producto && productoData.variants?.edges) {
          // Eliminar variantes existentes para evitar duplicados
          await query(`DELETE FROM variantes_producto WHERE producto_id = $1`, [producto.id])

          for (const varianteData of productoData.variants.edges) {
            const variante = varianteData.node
            const varianteShopifyId = variante.id.split("/").pop() || ""

            try {
              await createVariante({
                shopify_id: varianteShopifyId,
                producto_id: producto.id,
                titulo: variante.title || "",
                precio: Number.parseFloat(variante.price) || 0,
                precio_comparacion: variante.compareAtPrice ? Number.parseFloat(variante.compareAtPrice) : null,
                sku: variante.sku || "",
                codigo_barras: variante.barcode || "",
                inventario_disponible: variante.inventoryQuantity || 0,
                politica_inventario: variante.inventoryPolicy?.toLowerCase() || "",
                requiere_envio: true,
                peso: variante.weight || 0,
                unidad_peso: variante.weightUnit?.toLowerCase() || "kg",
                posicion: 1,
              })
            } catch (error) {
              console.error(`Error al crear variante para producto ${producto.id}:`, error)
              await registrarSincronizacion(
                "variantes",
                varianteShopifyId,
                "crear",
                "error",
                `Error al crear variante: ${error.message}`,
              )
            }
          }
        }

        // Procesar imágenes si existen
        if (producto && productoData.images?.edges) {
          // Eliminar imágenes existentes para evitar duplicados
          await query(`DELETE FROM imagenes_producto WHERE producto_id = $1`, [producto.id])

          for (let i = 0; i < productoData.images.edges.length; i++) {
            const imagenData = productoData.images.edges[i].node
            const imagenShopifyId = imagenData.id.split("/").pop() || ""

            try {
              await createImagen({
                shopify_id: imagenShopifyId,
                producto_id: producto.id,
                variante_id: null,
                url: imagenData.url || "",
                texto_alternativo: imagenData.altText || "",
                posicion: i + 1,
                es_destacada: i === 0,
              })
            } catch (error) {
              console.error(`Error al crear imagen para producto ${producto.id}:`, error)
              await registrarSincronizacion(
                "imagenes",
                imagenShopifyId,
                "crear",
                "error",
                `Error al crear imagen: ${error.message}`,
              )
            }
          }
        }

        resultados.detalles.push({
          id: shopifyId,
          titulo: productoObj.titulo,
          resultado: "exito",
        })
      } catch (error) {
        console.error("Error al sincronizar producto:", error)
        resultados.errores++
        resultados.detalles.push({
          id: productoData.id ? productoData.id.split("/").pop() : "",
          titulo: productoData.title || "Desconocido",
          resultado: "error",
          mensaje: error.message,
        })

        await registrarSincronizacion(
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
    await registrarSincronizacion(
      "productos",
      null,
      "sincronizar",
      "completado",
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )

    return resultados
  } catch (error) {
    // Registrar error general
    await registrarSincronizacion(
      "productos",
      null,
      "sincronizar",
      "error",
      `Error general en sincronización: ${error.message}`,
    )
    console.error("Error general en sincronizarProductos:", error)
    throw error
  }
}

// Función para obtener colecciones reales de Shopify
export async function obtenerColeccionesDeShopify(limit = 50) {
  try {
    // Registrar inicio de la obtención
    await registrarSincronizacion(
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
    await registrarSincronizacion(
      "colecciones",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${collectionCount} colecciones de Shopify`,
    )

    return response.data.collections.edges.map((edge: any) => edge.node)
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
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
  // Implementación similar a sincronizarProductos pero para colecciones
  // Esta función se implementará cuando sea necesario
  return { message: "Función no implementada aún" }
}

// Función para obtener clientes reales de Shopify
export async function obtenerClientesDeShopify(limit = 50) {
  try {
    // Registrar inicio de la obtención
    await registrarSincronizacion(
      "clientes",
      null,
      "consulta",
      "iniciado",
      `Obteniendo clientes de Shopify (límite: ${limit})`,
    )

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
    await registrarSincronizacion(
      "clientes",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${customerCount} clientes de Shopify`,
    )

    return response.data.customers.edges.map((edge: any) => edge.node)
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "clientes",
      null,
      "consulta",
      "error",
      `Error al obtener clientes de Shopify: ${error.message}`,
    )
    console.error("Error al obtener clientes de Shopify:", error)
    throw error
  }
}

// Función para sincronizar clientes desde Shopify
export async function sincronizarClientes(limit = 50) {
  // Implementación similar a sincronizarProductos pero para clientes
  // Esta función se implementará cuando sea necesario
  return { message: "Función no implementada aún" }
}

// Función para obtener pedidos reales de Shopify
export async function obtenerPedidosDeShopify(limit = 50) {
  try {
    // Registrar inicio de la obtención
    await registrarSincronizacion(
      "pedidos",
      null,
      "consulta",
      "iniciado",
      `Obteniendo pedidos de Shopify (límite: ${limit})`,
    )

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
    await registrarSincronizacion(
      "pedidos",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${orderCount} pedidos de Shopify`,
    )

    return response.data.orders.edges.map((edge: any) => edge.node)
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "pedidos",
      null,
      "consulta",
      "error",
      `Error al obtener pedidos de Shopify: ${error.message}`,
    )
    console.error("Error al obtener pedidos de Shopify:", error)
    throw error
  }
}

// Función para sincronizar pedidos desde Shopify
export async function sincronizarPedidos(limit = 50) {
  // Implementación similar a sincronizarProductos pero para pedidos
  // Esta función se implementará cuando sea necesario
  return { message: "Función no implementada aún" }
}
