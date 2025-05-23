import { query, insert, update, findById, findAll, findByField, remove } from "@/lib/db"

export type Pedido = {
  id?: number
  shopify_id?: string
  cliente_id?: string
  total?: number
  estado?: string
  datos_adicionales?: any
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

export async function getAllPedidos() {
  return findAll("pedidos")
}

export async function getPedidoById(id: number) {
  return findById("pedidos", id)
}

export async function getPedidoByShopifyId(shopifyId: string) {
  return findByField("pedidos", "shopify_id", shopifyId)
}

export async function getPedidosByClienteId(clienteId: string) {
  try {
    const result = await query(`SELECT * FROM pedidos WHERE cliente_id = $1 ORDER BY fecha_creacion DESC`, [clienteId])
    return result.rows
  } catch (error) {
    console.error(`Error al obtener pedidos para cliente ${clienteId}:`, error)
    throw error
  }
}

export async function createPedido(pedido: Pedido) {
  return insert("pedidos", pedido)
}

export async function updatePedido(id: number, pedido: Partial<Pedido>) {
  return update("pedidos", id, pedido)
}

export async function deletePedido(id: number) {
  return remove("pedidos", id)
}

export async function savePedidoFromShopify(shopifyData: any) {
  try {
    // Extraer datos básicos del pedido de Shopify
    const shopifyId = shopifyData.id.split("/").pop() || ""
    const clienteId = shopifyData.customer?.id.split("/").pop() || null

    // Verificar si el pedido ya existe
    const existingOrder = await getPedidoByShopifyId(shopifyId)

    // Preparar datos del pedido
    const pedidoData: Pedido = {
      shopify_id: shopifyId,
      cliente_id: clienteId,
      total: Number.parseFloat(shopifyData.totalPriceSet?.shopMoney?.amount || 0),
      estado: shopifyData.financialStatus || "",
      datos_adicionales: JSON.stringify({
        name: shopifyData.name || "",
        email: shopifyData.email || "",
        phone: shopifyData.phone || "",
        processedAt: shopifyData.processedAt || null,
        fulfillmentStatus: shopifyData.fulfillmentStatus || "",
        subtotal: Number.parseFloat(shopifyData.subtotalPriceSet?.shopMoney?.amount || 0),
        shipping: Number.parseFloat(shopifyData.totalShippingPriceSet?.shopMoney?.amount || 0),
        tax: Number.parseFloat(shopifyData.totalTaxSet?.shopMoney?.amount || 0),
        lineItems:
          shopifyData.lineItems?.edges?.map((edge: any) => ({
            id: edge.node.id.split("/").pop(),
            title: edge.node.title,
            quantity: edge.node.quantity,
            variant: edge.node.variant
              ? {
                  id: edge.node.variant.id.split("/").pop(),
                  title: edge.node.variant.title,
                  sku: edge.node.variant.sku,
                  price: edge.node.variant.price,
                  productId: edge.node.variant.product?.id.split("/").pop(),
                }
              : null,
            total: Number.parseFloat(edge.node.originalTotalSet?.shopMoney?.amount || 0),
          })) || [],
        shippingAddress: shopifyData.shippingAddress || null,
        transactions:
          shopifyData.transactions?.edges?.map((edge: any) => ({
            id: edge.node.id.split("/").pop(),
            kind: edge.node.kind,
            status: edge.node.status,
            gateway: edge.node.gateway,
            amount: Number.parseFloat(edge.node.amountSet?.shopMoney?.amount || 0),
            errorCode: edge.node.errorCode,
            createdAt: edge.node.createdAt,
          })) || [],
        tags: shopifyData.tags || [],
      }),
    }

    // Crear o actualizar el pedido
    if (existingOrder) {
      return updatePedido(existingOrder.id, pedidoData)
    } else {
      return createPedido(pedidoData)
    }
  } catch (error) {
    console.error("Error al guardar pedido desde Shopify:", error)
    throw error
  }
}
