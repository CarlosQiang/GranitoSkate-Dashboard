import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando reemplazo completo de pedidos...")

    // Obtener TODOS los pedidos directamente de Shopify
    const ordersQuery = `
      query {
        orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                displayName
                email
                firstName
                lastName
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      price
                    }
                    product {
                      id
                      title
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
                country
                zip
                phone
              }
              billingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                country
                zip
              }
              financialStatus
              fulfillmentStatus
              tags
              note
              cancelledAt
              cancelReason
            }
          }
        }
      }
    `

    console.log("🔍 Obteniendo pedidos de Shopify...")
    const ordersResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: ordersQuery }),
      },
    )

    if (!ordersResponse.ok) {
      throw new Error(`Error de Shopify API: ${ordersResponse.status}`)
    }

    const ordersData = await ordersResponse.json()
    const orders = ordersData.data?.orders?.edges || []

    console.log(`📦 Pedidos obtenidos de Shopify: ${orders.length}`)

    // 1. Borrar todos los pedidos existentes
    console.log("🗑️ Borrando pedidos existentes...")
    const deleteResult = await query("DELETE FROM pedidos")
    const borrados = deleteResult.rowCount || 0
    console.log(`🗑️ ${borrados} pedidos borrados`)

    // 2. Insertar los nuevos pedidos
    let insertados = 0
    let errores = 0

    for (const edge of orders) {
      try {
        const order = edge.node
        const shopifyId = order.id.split("/").pop()

        // Extraer datos del cliente
        const customerId = order.customer?.id ? order.customer.id.split("/").pop() : null

        // Insertar el pedido
        const insertResult = await query(
          `INSERT INTO pedidos (
            shopify_id, numero_pedido, cliente_id, email_cliente, estado,
            estado_financiero, estado_cumplimiento, moneda, subtotal,
            impuestos, envio, descuentos, total, notas, etiquetas,
            cancelado, fecha_cancelacion, motivo_cancelacion, fecha_procesamiento
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
          ) RETURNING id`,
          [
            shopifyId,
            order.name,
            customerId,
            order.customer?.email || null,
            "open", // estado por defecto
            order.financialStatus || "pending",
            order.fulfillmentStatus || "unfulfilled",
            order.totalPriceSet?.shopMoney?.currencyCode || "EUR",
            0, // subtotal - calcularemos después
            0, // impuestos
            0, // envío
            0, // descuentos
            Number.parseFloat(order.totalPriceSet?.shopMoney?.amount || "0"),
            order.note || null,
            order.tags ? order.tags.join(",") : null,
            !!order.cancelledAt,
            order.cancelledAt ? new Date(order.cancelledAt) : null,
            order.cancelReason || null,
            order.processedAt ? new Date(order.processedAt) : new Date(order.createdAt),
          ],
        )

        const pedidoId = insertResult.rows[0].id

        // Insertar líneas de pedido
        for (const lineItemEdge of order.lineItems.edges) {
          const lineItem = lineItemEdge.node
          const lineItemShopifyId = lineItem.id.split("/").pop()
          const variantId = lineItem.variant?.id ? lineItem.variant.id.split("/").pop() : null
          const productId = lineItem.product?.id ? lineItem.product.id.split("/").pop() : null

          await query(
            `INSERT INTO lineas_pedido (
              shopify_id, pedido_id, producto_id, variante_id, titulo,
              cantidad, precio, total
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8
            )`,
            [
              lineItemShopifyId,
              pedidoId,
              productId,
              variantId,
              lineItem.title,
              lineItem.quantity,
              Number.parseFloat(lineItem.variant?.price || "0"),
              Number.parseFloat(lineItem.variant?.price || "0") * lineItem.quantity,
            ],
          )
        }

        insertados++
        console.log(`✅ Pedido insertado: ${order.name} (${shopifyId})`)
      } catch (error) {
        console.error(`❌ Error insertando pedido:`, error)
        errores++
      }
    }

    // 3. Contar total en BD
    const countResult = await query("SELECT COUNT(*) as total FROM pedidos")
    const totalEnBD = Number.parseInt(countResult.rows[0].total)

    console.log(`✅ Reemplazo completado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`)
    console.log(`📊 Total en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`,
      results: {
        borrados,
        insertados,
        errores,
      },
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error en reemplazo de pedidos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de pedidos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
