import { sql } from "@vercel/postgres"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"
import { syncProductoWithShopify } from "@/lib/db/repositories/productos-repository"
import * as shopifyAPI from "@/lib/api/products"
import * as collectionsAPI from "@/lib/api/collections" // Cambiado de colecciones a collections
import * as customersAPI from "@/lib/api/customers"
import * as ordersAPI from "@/lib/api/orders"
import * as promotionsAPI from "@/lib/api/promociones"

// Función para sincronizar productos
export async function syncProducts() {
  try {
    // Obtener productos de Shopify
    const shopifyProducts = await shopifyAPI.fetchProducts(250)

    // Contador para estadísticas
    let created = 0
    let updated = 0
    let failed = 0

    // Procesar cada producto
    for (const product of shopifyProducts) {
      try {
        // Verificar si el producto ya existe en la base de datos
        const existingProduct = await checkProductExists(product.id)

        // Sincronizar el producto con la base de datos
        await syncProductoWithShopify(product)

        if (existingProduct) {
          updated++
        } else {
          created++
        }
      } catch (error) {
        console.error(`Error al sincronizar producto ${product.id}:`, error)
        failed++

        // Registrar error
        await logSyncEvent({
          tipo_entidad: "PRODUCT",
          entidad_id: product.id,
          accion: "SYNC",
          resultado: "ERROR",
          mensaje: `Error al sincronizar producto: ${(error as Error).message}`,
        })
      }
    }

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: `Sincronización de productos completada: ${created} creados, ${updated} actualizados, ${failed} fallidos`,
    })

    return { created, updated, failed, total: shopifyProducts.length }
  } catch (error) {
    console.error("Error al sincronizar productos:", error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar productos: ${(error as Error).message}`,
    })

    throw error
  }
}

// Función para sincronizar colecciones
export async function syncCollections() {
  try {
    // Obtener colecciones de Shopify
    const shopifyCollections = await collectionsAPI.fetchCollections() // Cambiado de obtenerColecciones a fetchCollections

    // Contador para estadísticas
    let created = 0
    let updated = 0
    let failed = 0

    // Procesar cada colección
    for (const collection of shopifyCollections) {
      try {
        // Verificar si la colección ya existe en la base de datos
        const existingCollection = await checkCollectionExists(collection.id)

        if (existingCollection) {
          // Actualizar colección existente
          await updateCollectionInDB(existingCollection.id, collection)
          updated++
        } else {
          // Crear nueva colección
          await insertCollectionIntoDB(collection)
          created++
        }

        // Sincronizar productos de la colección
        await syncCollectionProducts(collection.id)
      } catch (error) {
        console.error(`Error al sincronizar colección ${collection.id}:`, error)
        failed++

        // Registrar error
        await logSyncEvent({
          tipo_entidad: "COLLECTION",
          entidad_id: collection.id,
          accion: "SYNC",
          resultado: "ERROR",
          mensaje: `Error al sincronizar colección: ${(error as Error).message}`,
        })
      }
    }

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "COLLECTION",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: `Sincronización de colecciones completada: ${created} creadas, ${updated} actualizadas, ${failed} fallidas`,
    })

    return { created, updated, failed, total: shopifyCollections.length }
  } catch (error) {
    console.error("Error al sincronizar colecciones:", error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "COLLECTION",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar colecciones: ${(error as Error).message}`,
    })

    throw error
  }
}

// Función para sincronizar clientes
export async function syncCustomers() {
  try {
    // Obtener clientes de Shopify
    const shopifyCustomers = await customersAPI.fetchCustomers({ first: 250 })

    // Contador para estadísticas
    let created = 0
    let updated = 0
    let failed = 0

    // Procesar cada cliente
    for (const customer of shopifyCustomers.customers) {
      try {
        // Verificar si el cliente ya existe en la base de datos
        const existingCustomer = await checkCustomerExists(customer.id)

        if (existingCustomer) {
          // Actualizar cliente existente
          await updateCustomerInDB(existingCustomer.id, customer)
          updated++
        } else {
          // Crear nuevo cliente
          await insertCustomerIntoDB(customer)
          created++
        }
      } catch (error) {
        console.error(`Error al sincronizar cliente ${customer.id}:`, error)
        failed++

        // Registrar error
        await logSyncEvent({
          tipo_entidad: "CUSTOMER",
          entidad_id: customer.id,
          accion: "SYNC",
          resultado: "ERROR",
          mensaje: `Error al sincronizar cliente: ${(error as Error).message}`,
        })
      }
    }

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "CUSTOMER",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: `Sincronización de clientes completada: ${created} creados, ${updated} actualizados, ${failed} fallidos`,
    })

    return { created, updated, failed, total: shopifyCustomers.customers.length }
  } catch (error) {
    console.error("Error al sincronizar clientes:", error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "CUSTOMER",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar clientes: ${(error as Error).message}`,
    })

    throw error
  }
}

// Función para sincronizar pedidos
export async function syncOrders() {
  try {
    // Obtener pedidos de Shopify
    const shopifyOrders = await ordersAPI.fetchRecentOrders(250)

    // Contador para estadísticas
    let created = 0
    let updated = 0
    let failed = 0

    // Procesar cada pedido
    for (const order of shopifyOrders) {
      try {
        // Verificar si el pedido ya existe en la base de datos
        const existingOrder = await checkOrderExists(order.id)

        if (existingOrder) {
          // Actualizar pedido existente
          await updateOrderInDB(existingOrder.id, order)
          updated++
        } else {
          // Crear nuevo pedido
          await insertOrderIntoDB(order)
          created++
        }
      } catch (error) {
        console.error(`Error al sincronizar pedido ${order.id}:`, error)
        failed++

        // Registrar error
        await logSyncEvent({
          tipo_entidad: "ORDER",
          entidad_id: order.id,
          accion: "SYNC",
          resultado: "ERROR",
          mensaje: `Error al sincronizar pedido: ${(error as Error).message}`,
        })
      }
    }

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "ORDER",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: `Sincronización de pedidos completada: ${created} creados, ${updated} actualizados, ${failed} fallidos`,
    })

    return { created, updated, failed, total: shopifyOrders.length }
  } catch (error) {
    console.error("Error al sincronizar pedidos:", error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "ORDER",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar pedidos: ${(error as Error).message}`,
    })

    throw error
  }
}

// Función para sincronizar promociones
export async function syncPromotions() {
  try {
    // Obtener promociones de Shopify
    const shopifyPromotions = await promotionsAPI.obtenerPromociones()

    // Contador para estadísticas
    let created = 0
    let updated = 0
    let failed = 0

    // Procesar cada promoción
    for (const promotion of shopifyPromotions) {
      try {
        // Verificar si la promoción ya existe en la base de datos
        const existingPromotion = await checkPromotionExists(promotion.id)

        if (existingPromotion) {
          // Actualizar promoción existente
          await updatePromotionInDB(existingPromotion.id, promotion)
          updated++
        } else {
          // Crear nueva promoción
          await insertPromotionIntoDB(promotion)
          created++
        }
      } catch (error) {
        console.error(`Error al sincronizar promoción ${promotion.id}:`, error)
        failed++

        // Registrar error
        await logSyncEvent({
          tipo_entidad: "PROMOTION",
          entidad_id: promotion.id,
          accion: "SYNC",
          resultado: "ERROR",
          mensaje: `Error al sincronizar promoción: ${(error as Error).message}`,
        })
      }
    }

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: `Sincronización de promociones completada: ${created} creadas, ${updated} actualizadas, ${failed} fallidas`,
    })

    return { created, updated, failed, total: shopifyPromotions.length }
  } catch (error) {
    console.error("Error al sincronizar promociones:", error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar promociones: ${(error as Error).message}`,
    })

    throw error
  }
}

// Función para sincronizar todo
export async function syncAll() {
  try {
    // Registrar inicio de sincronización
    await logSyncEvent({
      tipo_entidad: "ALL",
      accion: "SYNC_ALL",
      resultado: "STARTED",
      mensaje: "Iniciando sincronización completa",
    })

    // Sincronizar productos
    const productsResult = await syncProducts()

    // Sincronizar colecciones
    const collectionsResult = await syncCollections()

    // Sincronizar clientes
    const customersResult = await syncCustomers()

    // Sincronizar pedidos
    const ordersResult = await syncOrders()

    // Sincronizar promociones
    const promotionsResult = await syncPromotions()

    // Registrar finalización de sincronización
    await logSyncEvent({
      tipo_entidad: "ALL",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: "Sincronización completa finalizada",
      detalles: {
        products: productsResult,
        collections: collectionsResult,
        customers: customersResult,
        orders: ordersResult,
        promotions: promotionsResult,
      },
    })

    return {
      products: productsResult,
      collections: collectionsResult,
      customers: customersResult,
      orders: ordersResult,
      promotions: promotionsResult,
    }
  } catch (error) {
    console.error("Error al sincronizar todo:", error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "ALL",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar todo: ${(error as Error).message}`,
    })

    throw error
  }
}

// Funciones auxiliares para verificar existencia en la base de datos
async function checkProductExists(shopifyId: string) {
  const result = await sql`SELECT id FROM productos WHERE shopify_id = ${shopifyId}`
  return result.rows.length > 0 ? result.rows[0] : null
}

async function checkCollectionExists(shopifyId: string) {
  const result = await sql`SELECT id FROM colecciones WHERE shopify_id = ${shopifyId}`
  return result.rows.length > 0 ? result.rows[0] : null
}

async function checkCustomerExists(shopifyId: string) {
  const result = await sql`SELECT id FROM clientes WHERE shopify_id = ${shopifyId}`
  return result.rows.length > 0 ? result.rows[0] : null
}

async function checkOrderExists(shopifyId: string) {
  const result = await sql`SELECT id FROM pedidos WHERE shopify_id = ${shopifyId}`
  return result.rows.length > 0 ? result.rows[0] : null
}

async function checkPromotionExists(shopifyId: string) {
  const result = await sql`SELECT id FROM promociones WHERE shopify_id = ${shopifyId}`
  return result.rows.length > 0 ? result.rows[0] : null
}

// Funciones para insertar en la base de datos
async function insertCollectionIntoDB(collection: any) {
  const {
    id: shopify_id,
    title: titulo,
    description: descripcion,
    handle: url_handle,
    image,
    productsCount,
  } = collection

  await sql`
    INSERT INTO colecciones (
      shopify_id, titulo, descripcion, url_handle, imagen_url,
      es_automatica, publicada, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
    ) VALUES (
      ${shopify_id}, ${titulo}, ${descripcion || null}, ${url_handle || null},
      ${image?.url || null}, false, true, NOW(), NOW(), NOW()
    )
  `

  // Registrar evento
  await logSyncEvent({
    tipo_entidad: "COLLECTION",
    entidad_id: shopify_id,
    accion: "CREATE",
    resultado: "SUCCESS",
    mensaje: `Colección creada: ${titulo}`,
  })
}

async function updateCollectionInDB(id: number, collection: any) {
  const {
    id: shopify_id,
    title: titulo,
    description: descripcion,
    handle: url_handle,
    image,
    productsCount,
  } = collection

  await sql`
    UPDATE colecciones SET
      titulo = ${titulo},
      descripcion = ${descripcion || null},
      url_handle = ${url_handle || null},
      imagen_url = ${image?.url || null},
      fecha_actualizacion = NOW(),
      ultima_sincronizacion = NOW()
    WHERE id = ${id}
  `

  // Registrar evento
  await logSyncEvent({
    tipo_entidad: "COLLECTION",
    entidad_id: shopify_id,
    accion: "UPDATE",
    resultado: "SUCCESS",
    mensaje: `Colección actualizada: ${titulo}`,
  })
}

async function syncCollectionProducts(collectionId: string) {
  try {
    // Obtener productos de la colección desde Shopify
    const collectionProducts = await collectionsAPI.fetchCollectionById(collectionId.split("/").pop() || "") // Cambiado de obtenerColeccionPorId a fetchCollectionById

    // Obtener la colección de la base de datos
    const collectionResult = await sql`SELECT id FROM colecciones WHERE shopify_id = ${collectionId}`

    if (collectionResult.rows.length === 0) {
      throw new Error(`Colección con ID ${collectionId} no encontrada en la base de datos`)
    }

    const collectionDbId = collectionResult.rows[0].id

    // Eliminar relaciones existentes
    await sql`DELETE FROM productos_colecciones WHERE coleccion_id = ${collectionDbId}`

    // Si no hay productos, terminar
    if (!collectionProducts || !collectionProducts.productoCount) {
      return
    }

    // Insertar nuevas relaciones
    // Nota: Aquí necesitamos adaptar según la estructura real de los datos
    // Este es un ejemplo simplificado
    const productIds = Array.isArray(collectionProducts.productos) ? collectionProducts.productos : []

    for (const productId of productIds) {
      // Obtener el ID de la base de datos del producto
      const productResult = await sql`SELECT id FROM productos WHERE shopify_id = ${productId}`

      if (productResult.rows.length > 0) {
        const productDbId = productResult.rows[0].id

        // Insertar relación
        await sql`
          INSERT INTO productos_colecciones (producto_id, coleccion_id, fecha_creacion, fecha_actualizacion)
          VALUES (${productDbId}, ${collectionDbId}, NOW(), NOW())
        `
      }
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "COLLECTION_PRODUCTS",
      entidad_id: collectionId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Productos de colección sincronizados: ${productIds.length} productos`,
    })
  } catch (error) {
    console.error(`Error al sincronizar productos de colección ${collectionId}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "COLLECTION_PRODUCTS",
      entidad_id: collectionId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar productos de colección: ${(error as Error).message}`,
    })

    throw error
  }
}

async function insertCustomerIntoDB(customer: any) {
  const {
    id: shopify_id,
    firstName: nombre,
    lastName: apellidos,
    email,
    phone: telefono,
    ordersCount: total_pedidos,
    totalSpent,
    verifiedEmail: email_verificado,
    tags,
  } = customer

  await sql`
    INSERT INTO clientes (
      shopify_id, email, nombre, apellidos, telefono, acepta_marketing,
      total_pedidos, total_gastado, etiquetas, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
    ) VALUES (
      ${shopify_id}, ${email || null}, ${nombre || null}, ${apellidos || null},
      ${telefono || null}, false, ${total_pedidos || 0}, ${totalSpent?.amount || 0},
      ${tags ? JSON.stringify(tags) : null}, NOW(), NOW(), NOW()
    )
  `

  // Registrar evento
  await logSyncEvent({
    tipo_entidad: "CUSTOMER",
    entidad_id: shopify_id,
    accion: "CREATE",
    resultado: "SUCCESS",
    mensaje: `Cliente creado: ${nombre} ${apellidos}`,
  })
}

async function updateCustomerInDB(id: number, customer: any) {
  const {
    id: shopify_id,
    firstName: nombre,
    lastName: apellidos,
    email,
    phone: telefono,
    ordersCount: total_pedidos,
    totalSpent,
    verifiedEmail: email_verificado,
    tags,
  } = customer

  await sql`
    UPDATE clientes SET
      email = ${email || null},
      nombre = ${nombre || null},
      apellidos = ${apellidos || null},
      telefono = ${telefono || null},
      total_pedidos = ${total_pedidos || 0},
      total_gastado = ${totalSpent?.amount || 0},
      etiquetas = ${tags ? JSON.stringify(tags) : null},
      fecha_actualizacion = NOW(),
      ultima_sincronizacion = NOW()
    WHERE id = ${id}
  `

  // Registrar evento
  await logSyncEvent({
    tipo_entidad: "CUSTOMER",
    entidad_id: shopify_id,
    accion: "UPDATE",
    resultado: "SUCCESS",
    mensaje: `Cliente actualizado: ${nombre} ${apellidos}`,
  })
}

async function insertOrderIntoDB(order: any) {
  const {
    id: shopify_id,
    name: numero_pedido,
    customer,
    email: email_cliente,
    financialStatus: estado_financiero,
    fulfillmentStatus: estado_cumplimiento,
    totalPrice: total,
    subtotalPrice: subtotal,
    totalTax: impuestos,
    totalShippingPrice: envio,
    totalDiscounts: descuentos,
    currencyCode: moneda,
    tags,
  } = order

  // Buscar cliente en la base de datos
  let clienteId = null
  if (customer?.id) {
    const clienteResult = await sql`SELECT id FROM clientes WHERE shopify_id = ${customer.id}`
    if (clienteResult.rows.length > 0) {
      clienteId = clienteResult.rows[0].id
    }
  }

  await sql`
    INSERT INTO pedidos (
      shopify_id, numero_pedido, cliente_id, email_cliente, estado_financiero,
      estado_cumplimiento, moneda, subtotal, impuestos, envio, descuentos, total,
      etiquetas, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
    ) VALUES (
      ${shopify_id}, ${numero_pedido}, ${clienteId}, ${email_cliente || null},
      ${estado_financiero || null}, ${estado_cumplimiento || null}, ${moneda || "EUR"},
      ${subtotal || 0}, ${impuestos || 0}, ${envio || 0}, ${descuentos || 0}, ${total || 0},
      ${tags ? JSON.stringify(tags) : null}, NOW(), NOW(), NOW()
    )
  `

  // Registrar evento
  await logSyncEvent({
    tipo_entidad: "ORDER",
    entidad_id: shopify_id,
    accion: "CREATE",
    resultado: "SUCCESS",
    mensaje: `Pedido creado: ${numero_pedido}`,
  })
}

async function updateOrderInDB(id: number, order: any) {
  const {
    id: shopify_id,
    name: numero_pedido,
    customer,
    email: email_cliente,
    financialStatus: estado_financiero,
    fulfillmentStatus: estado_cumplimiento,
    totalPrice: total,
    subtotalPrice: subtotal,
    totalTax: impuestos,
    totalShippingPrice: envio,
    totalDiscounts: descuentos,
    currencyCode: moneda,
    tags,
  } = order

  // Buscar cliente en la base de datos
  let clienteId = null
  if (customer?.id) {
    const clienteResult = await sql`SELECT id FROM clientes WHERE shopify_id = ${customer.id}`
    if (clienteResult.rows.length > 0) {
      clienteId = clienteResult.rows[0].id
    }
  }

  await sql`
    UPDATE pedidos SET
      numero_pedido = ${numero_pedido},
      cliente_id = ${clienteId},
      email_cliente = ${email_cliente || null},
      estado_financiero = ${estado_financiero || null},
      estado_cumplimiento = ${estado_cumplimiento || null},
      moneda = ${moneda || "EUR"},
      subtotal = ${subtotal || 0},
      impuestos = ${impuestos || 0},
      envio = ${envio || 0},
      descuentos = ${descuentos || 0},
      total = ${total || 0},
      etiquetas = ${tags ? JSON.stringify(tags) : null},
      fecha_actualizacion = NOW(),
      ultima_sincronizacion = NOW()
    WHERE id = ${id}
  `

  // Registrar evento
  await logSyncEvent({
    tipo_entidad: "ORDER",
    entidad_id: shopify_id,
    accion: "UPDATE",
    resultado: "SUCCESS",
    mensaje: `Pedido actualizado: ${numero_pedido}`,
  })
}

async function insertPromotionIntoDB(promotion: any) {
  const {
    id: shopify_id,
    title: titulo,
    description: descripcion,
    type: tipo,
    value: valor,
    code: codigo,
    target: objetivo,
    targetId: objetivo_id,
    startsAt: fecha_inicio,
    endsAt: fecha_fin,
    status: estado,
    usageLimit: limite_uso,
    usageCount: contador_uso,
    isAutomatic: es_automatica,
  } = promotion

  await sql`
    INSERT INTO promociones (
      shopify_id, titulo, descripcion, tipo, valor, codigo, objetivo, objetivo_id,
      fecha_inicio, fecha_fin, activa, limite_uso, contador_uso, es_automatica,
      fecha_creacion, fecha_actualizacion, ultima_sincronizacion
    ) VALUES (
      ${shopify_id}, ${titulo}, ${descripcion || null}, ${tipo || "PERCENTAGE_DISCOUNT"},
      ${valor || 0}, ${codigo || null}, ${objetivo || null}, ${objetivo_id || null},
      ${fecha_inicio ? new Date(fecha_inicio) : null}, ${fecha_fin ? new Date(fecha_fin) : null},
      ${estado === "ACTIVE"}, ${limite_uso || null}, ${contador_uso || 0}, ${es_automatica || false},
      NOW(), NOW(), NOW()
    )
  `

  // Registrar evento
  await logSyncEvent({
    tipo_entidad: "PROMOTION",
    entidad_id: shopify_id,
    accion: "CREATE",
    resultado: "SUCCESS",
    mensaje: `Promoción creada: ${titulo}`,
  })
}

async function updatePromotionInDB(id: number, promotion: any) {
  const {
    id: shopify_id,
    title: titulo,
    description: descripcion,
    type: tipo,
    value: valor,
    code: codigo,
    target: objetivo,
    targetId: objetivo_id,
    startsAt: fecha_inicio,
    endsAt: fecha_fin,
    status: estado,
    usageLimit: limite_uso,
    usageCount: contador_uso,
    isAutomatic: es_automatica,
  } = promotion

  await sql`
    UPDATE promociones SET
      titulo = ${titulo},
      descripcion = ${descripcion || null},
      tipo = ${tipo || "PERCENTAGE_DISCOUNT"},
      valor = ${valor || 0},
      codigo = ${codigo || null},
      objetivo = ${objetivo || null},
      objetivo_id = ${objetivo_id || null},
      fecha_inicio = ${fecha_inicio ? new Date(fecha_inicio) : null},
      fecha_fin = ${fecha_fin ? new Date(fecha_fin) : null},
      activa = ${estado === "ACTIVE"},
      limite_uso = ${limite_uso || null},
      contador_uso = ${contador_uso || 0},
      es_automatica = ${es_automatica || false},
      fecha_actualizacion = NOW(),
      ultima_sincronizacion = NOW()
    WHERE id = ${id}
  `

  // Registrar evento
  await logSyncEvent({
    tipo_entidad: "PROMOTION",
    entidad_id: shopify_id,
    accion: "UPDATE",
    resultado: "SUCCESS",
    mensaje: `Promoción actualizada: ${titulo}`,
  })
}
