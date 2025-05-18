import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyFetch } from "@/lib/shopify"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

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
    await sql`
      INSERT INTO registro_sincronizacion (
        tipo_entidad, entidad_id, accion, resultado, mensaje, detalles, fecha
      ) VALUES (
        ${tipoEntidad}, ${entidadId}, ${accion}, ${resultado}, ${mensaje}, 
        ${detalles ? JSON.stringify(detalles) : null}, NOW()
      )
    `
  } catch (error) {
    console.error("Error al registrar sincronización:", error)
  }
}

// Función para obtener pedidos de Shopify
async function obtenerPedidosDeShopify(limit = 20) {
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
        orders(first: ${limit}, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              email
              phone
              totalPrice
              subtotalPrice
              totalTax
              totalShippingPrice
              financialStatus
              fulfillmentStatus
              processedAt
              customer {
                id
                displayName
                email
              }
              shippingAddress {
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalTotalPrice
                    variant {
                      id
                      title
                      price
                      sku
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify a través del proxy
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.orders) {
      throw new Error("No se pudieron obtener pedidos de Shopify: respuesta vacía o inválida")
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

// Función para guardar pedidos en la base de datos
async function guardarPedidosEnBD(pedidos) {
  try {
    // Registrar inicio del guardado
    await registrarSincronizacion(
      "pedidos",
      null,
      "guardar",
      "iniciado",
      `Guardando ${pedidos.length} pedidos en la base de datos`,
    )

    // Guardar cada pedido en la base de datos
    for (const pedido of pedidos) {
      const shopifyId = pedido.id.split("/").pop()
      const orderNumber = pedido.name || ""
      const email = pedido.email || ""
      const phone = pedido.phone || ""
      const totalPrice = pedido.totalPrice || "0.00"
      const subtotalPrice = pedido.subtotalPrice || "0.00"
      const totalTax = pedido.totalTax || "0.00"
      const totalShippingPrice = pedido.totalShippingPrice || "0.00"
      const financialStatus = pedido.financialStatus || ""
      const fulfillmentStatus = pedido.fulfillmentStatus || ""
      const processedAt = pedido.processedAt || null

      // Cliente
      const customerId = pedido.customer?.id ? pedido.customer.id.split("/").pop() : null
      const customerName = pedido.customer?.displayName || ""

      // Datos adicionales en JSON
      const datosAdicionales = {
        customer: pedido.customer,
        shippingAddress: pedido.shippingAddress,
        lineItems: pedido.lineItems?.edges?.map((e) => e.node) || [],
      }

      // Verificar si el pedido ya existe
      const existingOrder = await sql`
        SELECT id FROM pedidos WHERE shopify_id = ${shopifyId}
      `

      if (existingOrder.rows.length > 0) {
        // Actualizar pedido existente
        await sql`
          UPDATE pedidos 
          SET 
            numero_pedido = ${orderNumber},
            email = ${email},
            telefono = ${phone},
            precio_total = ${totalPrice},
            subtotal = ${subtotalPrice},
            impuestos = ${totalTax},
            envio = ${totalShippingPrice},
            estado_financiero = ${financialStatus},
            estado_envio = ${fulfillmentStatus},
            fecha_procesado = ${processedAt},
            cliente_id = ${customerId},
            cliente_nombre = ${customerName},
            datos_adicionales = ${JSON.stringify(datosAdicionales)},
            actualizado_en = NOW()
          WHERE shopify_id = ${shopifyId}
        `

        await registrarSincronizacion(
          "pedidos",
          shopifyId,
          "actualizar",
          "completado",
          `Pedido actualizado: ${orderNumber}`,
        )
      } else {
        // Insertar nuevo pedido
        await sql`
          INSERT INTO pedidos (
            shopify_id, numero_pedido, email, telefono, precio_total, 
            subtotal, impuestos, envio, estado_financiero, estado_envio, 
            fecha_procesado, cliente_id, cliente_nombre, 
            datos_adicionales, creado_en, actualizado_en
          ) VALUES (
            ${shopifyId}, ${orderNumber}, ${email}, ${phone}, ${totalPrice},
            ${subtotalPrice}, ${totalTax}, ${totalShippingPrice}, ${financialStatus}, ${fulfillmentStatus},
            ${processedAt}, ${customerId}, ${customerName},
            ${JSON.stringify(datosAdicionales)}, NOW(), NOW()
          )
        `

        await registrarSincronizacion("pedidos", shopifyId, "crear", "completado", `Pedido creado: ${orderNumber}`)
      }
    }

    // Registrar éxito del guardado
    await registrarSincronizacion(
      "pedidos",
      null,
      "guardar",
      "completado",
      `Se guardaron ${pedidos.length} pedidos en la base de datos`,
    )

    return { success: true, count: pedidos.length }
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "pedidos",
      null,
      "guardar",
      "error",
      `Error al guardar pedidos en la base de datos: ${error.message}`,
    )
    console.error("Error al guardar pedidos en la base de datos:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el límite de la URL si existe
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")

    // Obtener pedidos de Shopify
    const pedidos = await obtenerPedidosDeShopify(limit)

    // Guardar pedidos en la base de datos
    const resultado = await guardarPedidosEnBD(pedidos)

    return NextResponse.json({
      success: true,
      message: `Sincronización de pedidos completada. Se sincronizaron ${resultado.count} pedidos.`,
      count: resultado.count,
    })
  } catch (error: any) {
    console.error("Error en sincronización de pedidos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido en sincronización de pedidos",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
