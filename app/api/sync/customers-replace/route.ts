import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { shopifyFetch } from "@/lib/shopify"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de clientes...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [] as string[],
    }

    // 1. BORRAR todos los clientes existentes primero
    try {
      const deleteResult = await sql`DELETE FROM clientes`
      results.borrados = deleteResult.rowCount || 0
      console.log(`🗑️ Clientes borrados: ${results.borrados}`)
      results.detalles.push(`Clientes borrados: ${results.borrados}`)
    } catch (error) {
      console.error("❌ Error borrando clientes:", error)
      results.errores++
      results.detalles.push(`Error borrando clientes: ${error}`)
    }

    // 2. OBTENER clientes REALES de Shopify
    let clientesReales = []
    try {
      console.log("📡 Obteniendo clientes REALES de Shopify...")

      const query = `
        query {
          customers(first: 100, sortKey: UPDATED_AT, reverse: true) {
            edges {
              node {
                id
                email
                firstName
                lastName
                phone
                createdAt
                updatedAt
                state
                totalSpent
                ordersCount
                addresses {
                  address1
                  city
                  country
                  province
                  zip
                }
              }
            }
          }
        }
      `

      const response = await shopifyFetch({ query })

      if (response.errors) {
        throw new Error(`Error en GraphQL: ${response.errors.map((e: any) => e.message).join(", ")}`)
      }

      if (response.data?.customers?.edges) {
        clientesReales = response.data.customers.edges.map((edge: any) => edge.node)
        console.log(`📡 Clientes REALES obtenidos de Shopify: ${clientesReales.length}`)
        results.detalles.push(`Clientes REALES obtenidos de Shopify: ${clientesReales.length}`)
      } else {
        console.log("⚠️ No se encontraron clientes en Shopify")
        results.detalles.push("No se encontraron clientes en Shopify")
      }
    } catch (error) {
      console.error("❌ Error obteniendo clientes de Shopify:", error)
      results.errores++
      results.detalles.push(`Error obteniendo clientes de Shopify: ${error}`)
    }

    // 3. INSERTAR clientes REALES en la base de datos
    for (const cliente of clientesReales) {
      try {
        // Extraer ID numérico de Shopify
        const shopifyId = cliente.id.replace("gid://shopify/Customer/", "")

        // Preparar datos del cliente
        const email = cliente.email || ""
        const nombre = cliente.firstName || ""
        const apellidos = cliente.lastName || ""
        const telefono = cliente.phone || null
        const estado = cliente.state || "ENABLED"
        const totalGastado = Number.parseFloat(cliente.totalSpent || "0")
        const numeroPedidos = cliente.ordersCount || 0

        // Dirección principal (primera dirección si existe)
        const direccionPrincipal = cliente.addresses?.[0]
        const direccion = direccionPrincipal?.address1 || null
        const ciudad = direccionPrincipal?.city || null
        const provincia = direccionPrincipal?.province || null
        const codigoPostal = direccionPrincipal?.zip || null
        const pais = direccionPrincipal?.country || null

        await sql`
          INSERT INTO clientes (
            shopify_id, email, nombre, apellidos, telefono, estado,
            total_gastado, numero_pedidos, direccion, ciudad, provincia,
            codigo_postal, pais, fecha_creacion, fecha_actualizacion
          ) 
          VALUES (
            ${shopifyId}, ${email}, ${nombre}, ${apellidos}, ${telefono}, ${estado},
            ${totalGastado}, ${numeroPedidos}, ${direccion}, ${ciudad}, ${provincia},
            ${codigoPostal}, ${pais}, ${cliente.createdAt}, ${cliente.updatedAt}
          )
        `

        results.insertados++
        console.log(`✅ Cliente REAL insertado: ${nombre} ${apellidos} (${email})`)
        results.detalles.push(`Cliente REAL insertado: ${nombre} ${apellidos} (${email})`)
      } catch (error) {
        console.error(`❌ Error insertando cliente ${cliente.email}:`, error)
        results.errores++
        results.detalles.push(`Error insertando cliente ${cliente.email}: ${error}`)
      }
    }

    // 4. Contar total final
    const countResult = await sql`SELECT COUNT(*) as count FROM clientes`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completo de clientes finalizado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )
    console.log(`👥 Total de clientes REALES en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD,
      detalles: results.detalles,
    })
  } catch (error) {
    console.error("❌ Error general en reemplazo de clientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo completo de clientes",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
