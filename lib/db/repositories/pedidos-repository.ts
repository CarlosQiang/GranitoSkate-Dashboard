import { sql } from "@vercel/postgres"
import type { Pedido, LineaPedido, Transaccion, Envio } from "../schema"
import { logSyncEvent } from "./registro-repository"

// Obtener todos los pedidos
export async function getAllPedidos(): Promise<Pedido[]> {
  try {
    const result = await sql`
      SELECT * FROM pedidos
      ORDER BY fecha_creacion DESC
    `
    return result.rows
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    throw error
  }
}

// Obtener un pedido por ID
export async function getPedidoById(id: number): Promise<Pedido | null> {
  try {
    const result = await sql`
      SELECT * FROM pedidos
      WHERE id = ${id}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener pedido con ID ${id}:`, error)
    throw error
  }
}

// Obtener un pedido por Shopify ID
export async function getPedidoByShopifyId(shopifyId: string): Promise<Pedido | null> {
  try {
    const result = await sql`
      SELECT * FROM pedidos
      WHERE shopify_id = ${shopifyId}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener pedido con Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

// Obtener pedidos por cliente ID
export async function getPedidosByClienteId(clienteId: number): Promise<Pedido[]> {
  try {
    const result = await sql`
      SELECT * FROM pedidos
      WHERE cliente_id = ${clienteId}
      ORDER BY fecha_creacion DESC
    `
    return result.rows
  } catch (error) {
    console.error(`Error al obtener pedidos del cliente con ID ${clienteId}:`, error)
    throw error
  }
}

// Crear un nuevo pedido
export async function createPedido(data: Partial<Pedido>): Promise<Pedido> {
  try {
    const {
      shopify_id,
      numero_pedido,
      cliente_id,
      email_cliente,
      estado,
      estado_financiero,
      estado_cumplimiento,
      moneda,
      subtotal,
      impuestos,
      envio,
      descuentos,
      total,
      ip_cliente,
      navegador_cliente,
      notas,
      etiquetas,
      riesgo_fraude,
      cancelado = false,
      fecha_cancelacion,
      motivo_cancelacion,
      fecha_procesamiento,
    } = data

    const result = await sql`
      INSERT INTO pedidos (
        shopify_id, numero_pedido, cliente_id, email_cliente, estado,
        estado_financiero, estado_cumplimiento, moneda, subtotal, impuestos,
        envio, descuentos, total, ip_cliente, navegador_cliente, notas,
        etiquetas, riesgo_fraude, cancelado, fecha_cancelacion, motivo_cancelacion,
        fecha_creacion, fecha_actualizacion, fecha_procesamiento
      )
      VALUES (
        ${shopify_id || null}, ${numero_pedido || null}, ${cliente_id || null},
        ${email_cliente || null}, ${estado || null}, ${estado_financiero || null},
        ${estado_cumplimiento || null}, ${moneda || null}, ${subtotal || null},
        ${impuestos || null}, ${envio || null}, ${descuentos || null},
        ${total || null}, ${ip_cliente || null}, ${navegador_cliente || null},
        ${notas || null}, ${etiquetas ? JSON.stringify(etiquetas) : null},
        ${riesgo_fraude || null}, ${cancelado}, ${fecha_cancelacion || null},
        ${motivo_cancelacion || null}, NOW(), NOW(), ${fecha_procesamiento || null}
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear pedido:", error)
    throw error
  }
}

// Actualizar un pedido existente
export async function updatePedido(id: number, data: Partial<Pedido>): Promise<Pedido> {
  try {
    // Primero obtenemos el pedido actual
    const currentPedido = await getPedidoById(id)
    if (!currentPedido) {
      throw new Error(`Pedido con ID ${id} no encontrado`)
    }

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentPedido,
      ...data,
      fecha_actualizacion: new Date(),
    }

    const {
      shopify_id,
      numero_pedido,
      cliente_id,
      email_cliente,
      estado,
      estado_financiero,
      estado_cumplimiento,
      moneda,
      subtotal,
      impuestos,
      envio,
      descuentos,
      total,
      ip_cliente,
      navegador_cliente,
      notas,
      etiquetas,
      riesgo_fraude,
      cancelado,
      fecha_cancelacion,
      motivo_cancelacion,
      fecha_procesamiento,
      ultima_sincronizacion,
    } = updatedData

    const result = await sql`
      UPDATE pedidos
      SET
        shopify_id = ${shopify_id || null},
        numero_pedido = ${numero_pedido || null},
        cliente_id = ${cliente_id || null},
        email_cliente = ${email_cliente || null},
        estado = ${estado || null},
        estado_financiero = ${estado_financiero || null},
        estado_cumplimiento = ${estado_cumplimiento || null},
        moneda = ${moneda || null},
        subtotal = ${subtotal || null},
        impuestos = ${impuestos || null},
        envio = ${envio || null},
        descuentos = ${descuentos || null},
        total = ${total || null},
        ip_cliente = ${ip_cliente || null},
        navegador_cliente = ${navegador_cliente || null},
        notas = ${notas || null},
        etiquetas = ${etiquetas ? JSON.stringify(etiquetas) : null},
        riesgo_fraude = ${riesgo_fraude || null},
        cancelado = ${cancelado},
        fecha_cancelacion = ${fecha_cancelacion || null},
        motivo_cancelacion = ${motivo_cancelacion || null},
        fecha_actualizacion = NOW(),
        fecha_procesamiento = ${fecha_procesamiento || null},
        ultima_sincronizacion = ${ultima_sincronizacion || null}
      WHERE id = ${id}
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar pedido con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un pedido
export async function deletePedido(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM pedidos
      WHERE id = ${id}
      RETURNING id
    `

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar pedido con ID ${id}:`, error)
    throw error
  }
}

// Buscar pedidos
export async function searchPedidos(
  query: string,
  limit = 10,
  offset = 0,
): Promise<{ pedidos: Pedido[]; total: number }> {
  try {
    const searchQuery = `%${query}%`

    const pedidosResult = await sql`
      SELECT * FROM pedidos
      WHERE 
        numero_pedido ILIKE ${searchQuery} OR
        email_cliente ILIKE ${searchQuery} OR
        notas ILIKE ${searchQuery}
      ORDER BY fecha_creacion DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total FROM pedidos
      WHERE 
        numero_pedido ILIKE ${searchQuery} OR
        email_cliente ILIKE ${searchQuery} OR
        notas ILIKE ${searchQuery}
    `

    return {
      pedidos: pedidosResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error(`Error al buscar pedidos con query "${query}":`, error)
    throw error
  }
}

// Obtener líneas de un pedido
export async function getLineasByPedidoId(pedidoId: number): Promise<LineaPedido[]> {
  try {
    const result = await sql`
      SELECT * FROM lineas_pedido
      WHERE pedido_id = ${pedidoId}
      ORDER BY id ASC
    `
    return result.rows
  } catch (error) {
    console.error(`Error al obtener líneas del pedido con ID ${pedidoId}:`, error)
    throw error
  }
}

// Crear una nueva línea de pedido
export async function createLineaPedido(data: Partial<LineaPedido>): Promise<LineaPedido> {
  try {
    const {
      shopify_id,
      pedido_id,
      producto_id,
      variante_id,
      titulo,
      variante_titulo,
      sku,
      cantidad,
      precio,
      descuento,
      total,
      requiere_envio = true,
      impuesto,
      propiedades,
      estado_cumplimiento,
    } = data

    const result = await sql`
      INSERT INTO lineas_pedido (
        shopify_id, pedido_id, producto_id, variante_id, titulo,
        variante_titulo, sku, cantidad, precio, descuento, total,
        requiere_envio, impuesto, propiedades, estado_cumplimiento,
        fecha_creacion, fecha_actualizacion
      )
      VALUES (
        ${shopify_id || null}, ${pedido_id}, ${producto_id || null},
        ${variante_id || null}, ${titulo || null}, ${variante_titulo || null},
        ${sku || null}, ${cantidad || null}, ${precio || null},
        ${descuento || null}, ${total || null}, ${requiere_envio},
        ${impuesto || null}, ${propiedades ? JSON.stringify(propiedades) : null},
        ${estado_cumplimiento || null}, NOW(), NOW()
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear línea de pedido:", error)
    throw error
  }
}

// Actualizar una línea de pedido existente
export async function updateLineaPedido(id: number, data: Partial<LineaPedido>): Promise<LineaPedido> {
  try {
    // Primero obtenemos la línea actual
    const result = await sql`
      SELECT * FROM lineas_pedido
      WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      throw new Error(`Línea de pedido con ID ${id} no encontrada`)
    }

    const currentLinea = result.rows[0]

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentLinea,
      ...data,
      fecha_actualizacion: new Date(),
    }

    const {
      shopify_id,
      pedido_id,
      producto_id,
      variante_id,
      titulo,
      variante_titulo,
      sku,
      cantidad,
      precio,
      descuento,
      total,
      requiere_envio,
      impuesto,
      propiedades,
      estado_cumplimiento,
      ultima_sincronizacion,
    } = updatedData

    const updateResult = await sql`
      UPDATE lineas_pedido
      SET
        shopify_id = ${shopify_id || null},
        pedido_id = ${pedido_id},
        producto_id = ${producto_id || null},
        variante_id = ${variante_id || null},
        titulo = ${titulo || null},
        variante_titulo = ${variante_titulo || null},
        sku = ${sku || null},
        cantidad = ${cantidad || null},
        precio = ${precio || null},
        descuento = ${descuento || null},
        total = ${total || null},
        requiere_envio = ${requiere_envio},
        impuesto = ${impuesto || null},
        propiedades = ${propiedades ? JSON.stringify(propiedades) : null},
        estado_cumplimiento = ${estado_cumplimiento || null},
        fecha_actualizacion = NOW(),
        ultima_sincronizacion = ${ultima_sincronizacion || null}
      WHERE id = ${id}
      RETURNING *
    `

    return updateResult.rows[0]
  } catch (error) {
    console.error(`Error al actualizar línea de pedido con ID ${id}:`, error)
    throw error
  }
}

// Eliminar una línea de pedido
export async function deleteLineaPedido(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM lineas_pedido
      WHERE id = ${id}
      RETURNING id
    `

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar línea de pedido con ID ${id}:`, error)
    throw error
  }
}

// Obtener transacciones de un pedido
export async function getTransaccionesByPedidoId(pedidoId: number): Promise<Transaccion[]> {
  try {
    const result = await sql`
      SELECT * FROM transacciones
      WHERE pedido_id = ${pedidoId}
      ORDER BY fecha_creacion DESC
    `
    return result.rows
  } catch (error) {
    console.error(`Error al obtener transacciones del pedido con ID ${pedidoId}:`, error)
    throw error
  }
}

// Crear una nueva transacción
export async function createTransaccion(data: Partial<Transaccion>): Promise<Transaccion> {
  try {
    const { shopify_id, pedido_id, tipo, estado, pasarela_pago, monto, moneda, error_codigo, error_mensaje } = data

    const result = await sql`
      INSERT INTO transacciones (
        shopify_id, pedido_id, tipo, estado, pasarela_pago,
        monto, moneda, error_codigo, error_mensaje,
        fecha_creacion, fecha_actualizacion
      )
      VALUES (
        ${shopify_id || null}, ${pedido_id}, ${tipo || null},
        ${estado || null}, ${pasarela_pago || null}, ${monto || null},
        ${moneda || null}, ${error_codigo || null}, ${error_mensaje || null},
        NOW(), NOW()
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear transacción:", error)
    throw error
  }
}

// Obtener envíos de un pedido
export async function getEnviosByPedidoId(pedidoId: number): Promise<Envio[]> {
  try {
    const result = await sql`
      SELECT * FROM envios
      WHERE pedido_id = ${pedidoId}
      ORDER BY fecha_creacion DESC
    `
    return result.rows
  } catch (error) {
    console.error(`Error al obtener envíos del pedido con ID ${pedidoId}:`, error)
    throw error
  }
}

// Crear un nuevo envío
export async function createEnvio(data: Partial<Envio>): Promise<Envio> {
  try {
    const { shopify_id, pedido_id, estado, servicio_envio, numero_seguimiento, url_seguimiento, fecha_entrega } = data

    const result = await sql`
      INSERT INTO envios (
        shopify_id, pedido_id, estado, servicio_envio,
        numero_seguimiento, url_seguimiento, fecha_creacion,
        fecha_actualizacion, fecha_entrega
      )
      VALUES (
        ${shopify_id || null}, ${pedido_id}, ${estado || null},
        ${servicio_envio || null}, ${numero_seguimiento || null},
        ${url_seguimiento || null}, NOW(), NOW(), ${fecha_entrega || null}
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear envío:", error)
    throw error
  }
}

// Sincronizar un pedido con Shopify
export async function syncPedidoWithShopify(order: any): Promise<number> {
  try {
    // Verificar si el pedido ya existe
    const existingOrder = await getPedidoByShopifyId(order.id)
    let orderDbId

    if (existingOrder) {
      // Actualizar pedido existente
      const updatedOrder = await updatePedido(existingOrder.id, {
        numero_pedido: order.name || order.orderNumber,
        email_cliente: order.email,
        estado: order.status,
        estado_financiero: order.financialStatus,
        estado_cumplimiento: order.fulfillmentStatus,
        moneda: order.currencyCode,
        subtotal: order.subtotalPrice?.amount,
        impuestos: order.totalTax?.amount,
        envio: order.totalShippingPrice?.amount,
        descuentos: order.totalDiscounts?.amount,
        total: order.totalPrice?.amount,
        cancelado: order.cancelledAt ? true : false,
        fecha_cancelacion: order.cancelledAt ? new Date(order.cancelledAt) : null,
        motivo_cancelacion: order.cancelReason,
        fecha_procesamiento: order.processedAt ? new Date(order.processedAt) : null,
        ultima_sincronizacion: new Date(),
      })

      orderDbId = updatedOrder.id

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "ORDER",
        entidad_id: order.id,
        accion: "UPDATE",
        resultado: "SUCCESS",
        mensaje: `Pedido actualizado: ${order.name || order.orderNumber}`,
      })
    } else {
      // Buscar cliente si existe
      let clienteId = null
      if (order.customer?.id) {
        const clienteResult = await sql`
          SELECT id FROM clientes WHERE shopify_id = ${order.customer.id}
        `
        if (clienteResult.rows.length > 0) {
          clienteId = clienteResult.rows[0].id
        }
      }

      // Crear nuevo pedido
      const newOrder = await createPedido({
        shopify_id: order.id,
        numero_pedido: order.name || order.orderNumber,
        cliente_id: clienteId,
        email_cliente: order.email,
        estado: order.status,
        estado_financiero: order.financialStatus,
        estado_cumplimiento: order.fulfillmentStatus,
        moneda: order.currencyCode,
        subtotal: order.subtotalPrice?.amount,
        impuestos: order.totalTax?.amount,
        envio: order.totalShippingPrice?.amount,
        descuentos: order.totalDiscounts?.amount,
        total: order.totalPrice?.amount,
        ip_cliente: order.clientIp,
        navegador_cliente: order.browserUserAgent,
        notas: order.note,
        etiquetas: order.tags || [],
        riesgo_fraude: order.riskLevel,
        cancelado: order.cancelledAt ? true : false,
        fecha_cancelacion: order.cancelledAt ? new Date(order.cancelledAt) : null,
        motivo_cancelacion: order.cancelReason,
        fecha_procesamiento: order.processedAt ? new Date(order.processedAt) : null,
        ultima_sincronizacion: new Date(),
      })

      orderDbId = newOrder.id

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "ORDER",
        entidad_id: order.id,
        accion: "CREATE",
        resultado: "SUCCESS",
        mensaje: `Pedido creado: ${order.name || order.orderNumber}`,
      })
    }

    // Sincronizar líneas de pedido
    if (order.lineItems && Array.isArray(order.lineItems)) {
      await syncLineasPedido(orderDbId, order.id, order.lineItems)
    }

    // Sincronizar transacciones
    if (order.transactions && Array.isArray(order.transactions)) {
      await syncTransaccionesPedido(orderDbId, order.id, order.transactions)
    }

    // Sincronizar envíos
    if (order.fulfillments && Array.isArray(order.fulfillments)) {
      await syncEnviosPedido(orderDbId, order.id, order.fulfillments)
    }

    return orderDbId
  } catch (error) {
    console.error(`Error al sincronizar pedido ${order.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "ORDER",
      entidad_id: order.id,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar pedido: ${(error as Error).message}`,
    })

    throw error
  }
}

// Sincronizar líneas de pedido
async function syncLineasPedido(pedidoDbId: number, shopifyPedidoId: string, lineItems: any[]): Promise<void> {
  try {
    // Eliminar líneas existentes
    await sql`DELETE FROM lineas_pedido WHERE pedido_id = ${pedidoDbId}`

    // Insertar nuevas líneas
    for (const lineItem of lineItems) {
      // Buscar producto y variante si existen
      let productoId = null
      let varianteId = null

      if (lineItem.product?.id) {
        const productoResult = await sql`
          SELECT id FROM productos WHERE shopify_id = ${lineItem.product.id}
        `
        if (productoResult.rows.length > 0) {
          productoId = productoResult.rows[0].id

          if (lineItem.variant?.id) {
            const varianteResult = await sql`
              SELECT id FROM variantes_producto 
              WHERE shopify_id = ${lineItem.variant.id} AND producto_id = ${productoId}
            `
            if (varianteResult.rows.length > 0) {
              varianteId = varianteResult.rows[0].id
            }
          }
        }
      }

      await sql`
        INSERT INTO lineas_pedido (
          shopify_id, pedido_id, producto_id, variante_id, titulo,
          variante_titulo, sku, cantidad, precio, descuento, total,
          requiere_envio, impuesto, propiedades, estado_cumplimiento,
          fecha_creacion, fecha_actualizacion, ultima_sincronizacion
        )
        VALUES (
          ${lineItem.id}, ${pedidoDbId}, ${productoId}, ${varianteId},
          ${lineItem.title}, ${lineItem.variantTitle}, ${lineItem.sku},
          ${lineItem.quantity}, ${lineItem.price?.amount}, ${lineItem.discountAllocations?.reduce((sum: number, da: any) => sum + (da.amount?.amount || 0), 0) || 0},
          ${lineItem.totalPrice?.amount}, ${lineItem.requiresShipping !== false},
          ${lineItem.tax?.amount}, ${lineItem.properties ? JSON.stringify(lineItem.properties) : null},
          ${lineItem.fulfillmentStatus}, NOW(), NOW(), NOW()
        )
      `
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "ORDER_LINEITEMS",
      entidad_id: shopifyPedidoId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Líneas de pedido sincronizadas: ${lineItems.length} líneas`,
    })
  } catch (error) {
    console.error(`Error al sincronizar líneas del pedido ${shopifyPedidoId}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "ORDER_LINEITEMS",
      entidad_id: shopifyPedidoId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar líneas de pedido: ${(error as Error).message}`,
    })

    throw error
  }
}

// Sincronizar transacciones de pedido
async function syncTransaccionesPedido(
  pedidoDbId: number,
  shopifyPedidoId: string,
  transactions: any[],
): Promise<void> {
  try {
    // Eliminar transacciones existentes
    await sql`DELETE FROM transacciones WHERE pedido_id = ${pedidoDbId}`

    // Insertar nuevas transacciones
    for (const transaction of transactions) {
      await sql`
        INSERT INTO transacciones (
          shopify_id, pedido_id, tipo, estado, pasarela_pago,
          monto, moneda, error_codigo, error_mensaje,
          fecha_creacion, fecha_actualizacion, ultima_sincronizacion
        )
        VALUES (
          ${transaction.id}, ${pedidoDbId}, ${transaction.kind},
          ${transaction.status}, ${transaction.gateway},
          ${transaction.amount?.amount}, ${transaction.amount?.currencyCode},
          ${transaction.errorCode}, ${transaction.errorMessage},
          ${transaction.createdAt ? new Date(transaction.createdAt) : new Date()},
          NOW(), NOW()
        )
      `
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "ORDER_TRANSACTIONS",
      entidad_id: shopifyPedidoId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Transacciones de pedido sincronizadas: ${transactions.length} transacciones`,
    })
  } catch (error) {
    console.error(`Error al sincronizar transacciones del pedido ${shopifyPedidoId}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "ORDER_TRANSACTIONS",
      entidad_id: shopifyPedidoId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar transacciones de pedido: ${(error as Error).message}`,
    })

    throw error
  }
}

// Sincronizar envíos de pedido
async function syncEnviosPedido(pedidoDbId: number, shopifyPedidoId: string, fulfillments: any[]): Promise<void> {
  try {
    // Eliminar envíos existentes
    await sql`DELETE FROM envios WHERE pedido_id = ${pedidoDbId}`

    // Insertar nuevos envíos
    for (const fulfillment of fulfillments) {
      await sql`
        INSERT INTO envios (
          shopify_id, pedido_id, estado, servicio_envio,
          numero_seguimiento, url_seguimiento, fecha_creacion,
          fecha_actualizacion, fecha_entrega, ultima_sincronizacion
        )
        VALUES (
          ${fulfillment.id}, ${pedidoDbId}, ${fulfillment.status},
          ${fulfillment.service}, ${fulfillment.trackingNumber},
          ${fulfillment.trackingUrl}, 
          ${fulfillment.createdAt ? new Date(fulfillment.createdAt) : new Date()},
          NOW(), ${fulfillment.deliveredAt ? new Date(fulfillment.deliveredAt) : null},
          NOW()
        )
      `
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "ORDER_FULFILLMENTS",
      entidad_id: shopifyPedidoId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Envíos de pedido sincronizados: ${fulfillments.length} envíos`,
    })
  } catch (error) {
    console.error(`Error al sincronizar envíos del pedido ${shopifyPedidoId}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "ORDER_FULFILLMENTS",
      entidad_id: shopifyPedidoId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar envíos de pedido: ${(error as Error).message}`,
    })

    throw error
  }
}
