import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando reemplazo completo de clientes...")

    // Obtener TODOS los clientes directamente de Shopify
    const customersQuery = `
      query {
        customers(first: 250, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              email
              firstName
              lastName
              phone
              acceptsMarketing
              createdAt
              updatedAt
              note
              tags
              ordersCount
              totalSpent
              state
              addresses {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
                default
              }
              defaultAddress {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
              }
            }
          }
        }
      }
    `

    console.log("🔍 Obteniendo clientes de Shopify...")
    const customersResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: customersQuery }),
      },
    )

    if (!customersResponse.ok) {
      throw new Error(`Error de Shopify API: ${customersResponse.status}`)
    }

    const customersData = await customersResponse.json()
    const customers = customersData.data?.customers?.edges || []

    console.log(`👥 Clientes obtenidos de Shopify: ${customers.length}`)

    // 1. Borrar todos los clientes existentes (y sus direcciones)
    console.log("🗑️ Borrando clientes existentes...")
    await query("DELETE FROM direcciones_cliente")
    const deleteResult = await query("DELETE FROM clientes")
    const borrados = deleteResult.rowCount || 0
    console.log(`🗑️ ${borrados} clientes borrados`)

    // 2. Insertar los nuevos clientes
    let insertados = 0
    let errores = 0

    for (const edge of customers) {
      try {
        const customer = edge.node
        const shopifyId = customer.id.split("/").pop()

        // Insertar el cliente
        const insertResult = await query(
          `INSERT INTO clientes (
            shopify_id, email, nombre, apellidos, telefono,
            acepta_marketing, notas, etiquetas, total_pedidos,
            total_gastado, estado
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          ) RETURNING id`,
          [
            shopifyId,
            customer.email,
            customer.firstName || "",
            customer.lastName || "",
            customer.phone || null,
            customer.acceptsMarketing || false,
            customer.note || null,
            customer.tags ? customer.tags.join(",") : null,
            customer.ordersCount || 0,
            Number.parseFloat(customer.totalSpent || "0"),
            customer.state || "enabled",
          ],
        )

        const clienteId = insertResult.rows[0].id

        // Insertar direcciones del cliente
        if (customer.addresses && customer.addresses.length > 0) {
          for (const address of customer.addresses) {
            const addressShopifyId = address.id.split("/").pop()

            await query(
              `INSERT INTO direcciones_cliente (
                shopify_id, cliente_id, es_predeterminada, nombre, apellidos,
                empresa, direccion1, direccion2, ciudad, provincia,
                codigo_postal, pais, telefono
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
              )`,
              [
                addressShopifyId,
                clienteId,
                address.default || false,
                address.firstName || "",
                address.lastName || "",
                address.company || null,
                address.address1 || "",
                address.address2 || null,
                address.city || "",
                address.province || "",
                address.zip || "",
                address.country || "",
                address.phone || null,
              ],
            )
          }
        }

        insertados++
        console.log(`✅ Cliente insertado: ${customer.firstName} ${customer.lastName} (${shopifyId})`)
      } catch (error) {
        console.error(`❌ Error insertando cliente:`, error)
        errores++
      }
    }

    // 3. Contar total en BD
    const countResult = await query("SELECT COUNT(*) as total FROM clientes")
    const totalEnBD = Number.parseInt(countResult.rows[0].total)

    console.log(`✅ Reemplazo completado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`)
    console.log(`👥 Total en BD: ${totalEnBD}`)

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
    console.error("❌ Error en reemplazo de clientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de clientes",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
