import { query } from "@/lib/db"
import type { Pedido, LineaPedido, Transaccion, Envio } from "@/lib/db/schema"

// Funciones para pedidos
export async function getAllPedidos() {
  try {
    const result = await query(
      `SELECT * FROM pedidos 
       ORDER BY fecha_creacion DESC`,
    )

    return result.rows
  } catch (error) {
    console.error("Error getting all pedidos:", error)
    throw error
  }
}

export async function getPedidoById(id: number) {
  try {
    const result = await query(
      `SELECT * FROM pedidos 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting pedido with ID ${id}:`, error)
    throw error
  }
}

export async function getPedidoByShopifyId(shopifyId: string) {
  try {
    const result = await query(
      `SELECT * FROM pedidos 
       WHERE shopify_id = $1`,
      [shopifyId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting pedido with Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

export async function getPedidosByClienteId(clienteId: number) {
  try {
    const result = await query(
      `SELECT * FROM pedidos 
       WHERE cliente_id = $1 
       ORDER BY fecha_creacion DESC`,
      [clienteId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting pedidos for cliente ID ${clienteId}:`, error)
    throw error
  }
}

export async function createPedido(pedido: Partial<Pedido>) {
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
      cancelado,
      fecha_cancelacion,
      motivo_cancelacion,
      fecha_procesamiento,
    } = pedido

    const result = await query(
      `INSERT INTO pedidos (
        shopify_id, numero_pedido, cliente_id, email_cliente, estado,
        estado_financiero, estado_cumplimiento, moneda, subtotal,
        impuestos, envio, descuentos, total, ip_cliente,
        navegador_cliente, notas, etiquetas, riesgo_fraude,
        cancelado, fecha_cancelacion, motivo_cancelacion, fecha_procesamiento
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *`,
      [
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
        cancelado !== undefined ? cancelado : false,
        fecha_cancelacion,
        motivo_cancelacion,
        fecha_procesamiento,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating pedido:", error)
    throw error
  }
}

export async function updatePedido(id: number, pedido: Partial<Pedido>) {
  try {
    // Construir dinámicamente la consulta de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Añadir cada campo a actualizar
    Object.entries(pedido).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    // Añadir fecha de actualización
    updates.push(`fecha_actualizacion = NOW()`)

    // Añadir el ID al final de los valores
    values.push(id)

    const result = await query(
      `UPDATE pedidos 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values,
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error updating pedido with ID ${id}:`, error)
    throw error
  }
}

export async function deletePedido(id: number) {
  try {
    const result = await query(
      `DELETE FROM pedidos 
       WHERE id = $1 
       RETURNING id`,
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting pedido with ID ${id}:`, error)
    throw error
  }
}

// Funciones para líneas de pedido
export async function getLineasByPedidoId(pedidoId: number) {
  try {
    const result = await query(
      `SELECT * FROM lineas_pedido 
       WHERE pedido_id = $1`,
      [pedidoId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting lineas for pedido ID ${pedidoId}:`, error)
    throw error
  }
}

export async function createLineaPedido(linea: Partial<LineaPedido>) {
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
      requiere_envio,
      impuesto,
      propiedades,
      estado_cumplimiento,
    } = linea

    const result = await query(
      `INSERT INTO lineas_pedido (
        shopify_id, pedido_id, producto_id, variante_id, titulo,
        variante_titulo, sku, cantidad, precio, descuento,
        total, requiere_envio, impuesto, propiedades, estado_cumplimiento
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *`,
      [
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
        requiere_envio !== undefined ? requiere_envio : true,
        impuesto,
        propiedades ? JSON.stringify(propiedades) : null,
        estado_cumplimiento,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating linea pedido:", error)
    throw error
  }
}

// Funciones para transacciones
export async function getTransaccionesByPedidoId(pedidoId: number) {
  try {
    const result = await query(
      `SELECT * FROM transacciones 
       WHERE pedido_id = $1 
       ORDER BY fecha_creacion`,
      [pedidoId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting transacciones for pedido ID ${pedidoId}:`, error)
    throw error
  }
}

export async function createTransaccion(transaccion: Partial<Transaccion>) {
  try {
    const { shopify_id, pedido_id, tipo, estado, pasarela_pago, monto, moneda, error_codigo, error_mensaje } =
      transaccion

    const result = await query(
      `INSERT INTO transacciones (
        shopify_id, pedido_id, tipo, estado, pasarela_pago,
        monto, moneda, error_codigo, error_mensaje
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *`,
      [shopify_id, pedido_id, tipo, estado, pasarela_pago, monto, moneda, error_codigo, error_mensaje],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating transaccion:", error)
    throw error
  }
}

// Funciones para envíos
export async function getEnviosByPedidoId(pedidoId: number) {
  try {
    const result = await query(
      `SELECT * FROM envios 
       WHERE pedido_id = $1 
       ORDER BY fecha_creacion`,
      [pedidoId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting envios for pedido ID ${pedidoId}:`, error)
    throw error
  }
}

export async function createEnvio(envio: Partial<Envio>) {
  try {
    const { shopify_id, pedido_id, estado, servicio_envio, numero_seguimiento, url_seguimiento, fecha_entrega } = envio

    const result = await query(
      `INSERT INTO envios (
        shopify_id, pedido_id, estado, servicio_envio,
        numero_seguimiento, url_seguimiento, fecha_entrega
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *`,
      [shopify_id, pedido_id, estado, servicio_envio, numero_seguimiento, url_seguimiento, fecha_entrega],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating envio:", error)
    throw error
  }
}
