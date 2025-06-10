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

    // 2. OBTENER clientes REALES de Shopify usando GraphQL (como los otros endpoints)
    let clientesReales = []
    try {
      console.log("📡 Obteniendo clientes REALES de Shopify con GraphQL...")

      // Usar la misma estructura que funciona en productos/pedidos/promociones
      const query = `
        query getCustomers {
          customers(first: 100) {
            edges {
              node {
                id
                email
                firstName
                lastName
                phone
                state
                totalSpent
                ordersCount
                createdAt
                updatedAt
              }
            }
          }
        }
      `

      console.log("🔍 Ejecutando consulta GraphQL para clientes...")
      const response = await shopifyFetch({ query })

      console.log("📡 Respuesta de Shopify recibida:", {
        hasData: !!response.data,
        hasErrors: !!response.errors,
        hasCustomers: !!response.data?.customers,
      })

      if (response.errors) {
        console.error("❌ Errores en GraphQL:", response.errors)
        throw new Error(`Error en GraphQL: ${response.errors.map((e: any) => e.message).join(", ")}`)
      }

      if (response.data?.customers?.edges) {
        clientesReales = response.data.customers.edges.map((edge: any) => edge.node)
        console.log(`📡 Clientes REALES obtenidos de Shopify: ${clientesReales.length}`)
        results.detalles.push(`Clientes REALES obtenidos de Shopify: ${clientesReales.length}`)

        // Log de los clientes obtenidos para debug
        clientesReales.forEach((cliente: any, index: number) => {
          console.log(`👤 Cliente ${index + 1}: ${cliente.firstName} ${cliente.lastName} (${cliente.email})`)
        })
      } else {
        console.log("⚠️ No se encontraron clientes en la respuesta de Shopify")
        console.log("📋 Estructura de respuesta:", JSON.stringify(response.data, null, 2))
        results.detalles.push("No se encontraron clientes en Shopify")
      }
    } catch (error) {
      console.error("❌ Error obteniendo clientes de Shopify:", error)
      results.errores++
      results.detalles.push(`Error obteniendo clientes de Shopify: ${error}`)
    }

    // 3. Verificar estructura de la tabla clientes
    try {
      console.log("🔍 Verificando estructura de tabla clientes...")

      await sql`
        CREATE TABLE IF NOT EXISTS clientes (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255),
          email VARCHAR(255),
          nombre VARCHAR(255),
          apellidos VARCHAR(255),
          telefono VARCHAR(255),
          estado VARCHAR(50) DEFAULT 'ENABLED',
          total_gastado DECIMAL(10,2) DEFAULT 0,
          numero_pedidos INTEGER DEFAULT 0,
          fecha_creacion TIMESTAMP DEFAULT NOW(),
          fecha_actualizacion TIMESTAMP DEFAULT NOW()
        )
      `
      console.log("✅ Tabla clientes verificada/creada")
    } catch (error) {
      console.error("❌ Error verificando tabla clientes:", error)
      results.errores++
      results.detalles.push(`Error verificando tabla: ${error}`)
    }

    // 4. INSERTAR clientes REALES en la base de datos
    console.log(`🔄 Iniciando inserción de ${clientesReales.length} clientes...`)

    for (let i = 0; i < clientesReales.length; i++) {
      const cliente = clientesReales[i]
      try {
        console.log(`🔄 Procesando cliente ${i + 1}/${clientesReales.length}: ${cliente.firstName} ${cliente.lastName}`)

        // Extraer ID numérico de Shopify
        const shopifyId = cliente.id.replace("gid://shopify/Customer/", "")

        // Preparar datos del cliente con valores seguros
        const email = cliente.email || ""
        const nombre = cliente.firstName || ""
        const apellidos = cliente.lastName || ""
        const telefono = cliente.phone || null
        const estado = cliente.state || "ENABLED"
        const totalGastado = Number.parseFloat(cliente.totalSpent || "0")
        const numeroPedidos = cliente.ordersCount || 0

        console.log(`📝 Insertando cliente con datos:`, {
          shopifyId,
          email,
          nombre,
          apellidos,
          totalGastado,
          numeroPedidos,
        })

        await sql`
          INSERT INTO clientes (
            shopify_id, email, nombre, apellidos, telefono, estado,
            total_gastado, numero_pedidos
          ) 
          VALUES (
            ${shopifyId}, ${email}, ${nombre}, ${apellidos}, ${telefono}, ${estado},
            ${totalGastado}, ${numeroPedidos}
          )
        `

        results.insertados++
        console.log(`✅ Cliente ${i + 1} insertado: ${nombre} ${apellidos} (${email})`)
        results.detalles.push(`Cliente insertado: ${nombre} ${apellidos} (${email})`)
      } catch (error) {
        console.error(`❌ Error insertando cliente ${i + 1} (${cliente.email}):`, error)
        results.errores++
        results.detalles.push(
          `Error insertando cliente ${cliente.email}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    // 5. Contar total final
    const countResult = await sql`SELECT COUNT(*) as count FROM clientes`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completo de clientes finalizado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )
    console.log(`👥 Total de clientes REALES en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: results.errores === 0,
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
