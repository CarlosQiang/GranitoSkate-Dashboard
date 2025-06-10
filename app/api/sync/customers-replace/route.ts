import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
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
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query: customersQuery }),
      },
    )

    if (!customersResponse.ok) {
      throw new Error(`Error de Shopify API: ${customersResponse.status}`)
    }

    const customersData = await customersResponse.json()

    if (customersData.errors) {
      console.error("❌ Errores de GraphQL:", customersData.errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(customersData.errors)}`)
    }

    const customers = customersData.data?.customers?.edges || []
    console.log(`👥 Clientes obtenidos de Shopify: ${customers.length}`)

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [] as string[],
    }

    // 1. Crear tabla si no existe
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS clientes (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255),
          nombre VARCHAR(255),
          apellidos VARCHAR(255),
          telefono VARCHAR(50),
          acepta_marketing BOOLEAN DEFAULT FALSE,
          notas TEXT,
          etiquetas TEXT,
          total_pedidos INTEGER DEFAULT 0,
          total_gastado DECIMAL(10,2) DEFAULT 0,
          estado VARCHAR(50) DEFAULT 'enabled',
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla clientes:", error)
    }

    // 2. Borrar todos los clientes existentes
    try {
      const deleteResult = await sql`DELETE FROM clientes`
      results.borrados = deleteResult.rowCount || 0
      results.detalles.push(`🗑️ Borrados: ${results.borrados} clientes existentes`)
      console.log(`🗑️ ${results.borrados} clientes borrados`)
    } catch (error) {
      console.error("❌ Error borrando clientes:", error)
      results.errores++
      results.detalles.push(`❌ Error borrando: ${error}`)
    }

    // 3. Insertar los nuevos clientes
    for (const edge of customers) {
      try {
        const customer = edge.node
        const shopifyId = customer.id.split("/").pop()

        await sql`
          INSERT INTO clientes (
            shopify_id, email, nombre, apellidos, telefono,
            acepta_marketing, notas, etiquetas, total_pedidos,
            total_gastado, estado
          ) VALUES (
            ${shopifyId},
            ${customer.email || null},
            ${customer.firstName || ""},
            ${customer.lastName || ""},
            ${customer.phone || null},
            ${customer.acceptsMarketing || false},
            ${customer.note || null},
            ${customer.tags ? customer.tags.join(",") : null},
            ${customer.ordersCount || 0},
            ${Number.parseFloat(customer.totalSpent || "0")},
            ${customer.state || "enabled"}
          )
        `

        results.insertados++
        results.detalles.push(`✅ Cliente insertado: ${customer.firstName} ${customer.lastName} (${shopifyId})`)
        console.log(`✅ Cliente insertado: ${customer.firstName} ${customer.lastName} (${shopifyId})`)
      } catch (error) {
        console.error(`❌ Error insertando cliente:`, error)
        results.errores++
        results.detalles.push(`❌ Error insertando cliente: ${error}`)
      }
    }

    // 4. Contar total en BD
    const countResult = await sql`SELECT COUNT(*) as count FROM clientes`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )
    console.log(`👥 Total en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
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
