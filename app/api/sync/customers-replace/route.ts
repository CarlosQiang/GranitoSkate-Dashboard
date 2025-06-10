import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

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

    // 2. OBTENER clientes REALES usando la misma lógica que funciona en el dashboard
    let clientesReales = []
    try {
      console.log("📡 Obteniendo clientes REALES usando la API del dashboard...")

      // Usar la misma API que funciona en el dashboard
      const dashboardResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/dashboard/summary`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!dashboardResponse.ok) {
        throw new Error(`Error en API dashboard: ${dashboardResponse.status}`)
      }

      const dashboardData = await dashboardResponse.json()

      if (dashboardData.success && dashboardData.customers) {
        clientesReales = dashboardData.customers
        console.log(`📡 Clientes REALES obtenidos del dashboard: ${clientesReales.length}`)
        results.detalles.push(`Clientes REALES obtenidos del dashboard: ${clientesReales.length}`)

        // Log de los clientes obtenidos para debug
        clientesReales.forEach((cliente: any) => {
          console.log(
            `👤 Cliente encontrado: ${cliente.firstName || cliente.nombre} ${cliente.lastName || cliente.apellidos} (${cliente.email})`,
          )
        })
      } else {
        console.log("⚠️ No se encontraron clientes en el dashboard")
        results.detalles.push("No se encontraron clientes en el dashboard")
      }
    } catch (error) {
      console.error("❌ Error obteniendo clientes del dashboard:", error)
      results.errores++
      results.detalles.push(`Error obteniendo clientes del dashboard: ${error}`)
    }

    // 3. Verificar estructura de la tabla clientes
    try {
      console.log("🔍 Verificando estructura de tabla clientes...")

      // Crear tabla si no existe con estructura simplificada
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
    for (const cliente of clientesReales) {
      try {
        console.log(
          `🔄 Procesando cliente: ${cliente.firstName || cliente.nombre} ${cliente.lastName || cliente.apellidos}`,
        )

        // Extraer ID de Shopify (puede venir en diferentes formatos)
        let shopifyId = ""
        if (cliente.id) {
          shopifyId =
            typeof cliente.id === "string" ? cliente.id.replace("gid://shopify/Customer/", "") : cliente.id.toString()
        } else if (cliente.shopify_id) {
          shopifyId = cliente.shopify_id.toString()
        }

        // Preparar datos del cliente con valores seguros
        const email = cliente.email || ""
        const nombre = cliente.firstName || cliente.nombre || ""
        const apellidos = cliente.lastName || cliente.apellidos || ""
        const telefono = cliente.phone || cliente.telefono || null
        const estado = cliente.state || cliente.estado || "ENABLED"
        const totalGastado = Number.parseFloat(cliente.totalSpent || cliente.total_gastado || "0")
        const numeroPedidos = cliente.ordersCount || cliente.numero_pedidos || 0

        console.log(`📝 Datos a insertar:`, {
          shopifyId,
          email,
          nombre,
          apellidos,
          telefono,
          estado,
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
        console.log(`✅ Cliente REAL insertado: ${nombre} ${apellidos} (${email})`)
        results.detalles.push(`Cliente REAL insertado: ${nombre} ${apellidos} (${email})`)
      } catch (error) {
        console.error(`❌ Error insertando cliente ${cliente.email}:`, error)
        console.error(`❌ Detalles del error:`, {
          message: error instanceof Error ? error.message : "Error desconocido",
          cliente: {
            id: cliente.id,
            email: cliente.email,
            firstName: cliente.firstName || cliente.nombre,
            lastName: cliente.lastName || cliente.apellidos,
          },
        })
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
