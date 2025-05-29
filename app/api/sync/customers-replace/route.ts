import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.POSTGRES_URL!)

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Iniciando reemplazo completo de clientes...")

    // Obtener datos del dashboard
    const dashboardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/dashboard/summary`,
      {
        cache: "no-store",
      },
    )

    if (!dashboardResponse.ok) {
      throw new Error("Error al obtener datos del dashboard")
    }

    const dashboardData = await dashboardResponse.json()
    const clientes = dashboardData.allCustomers || []

    console.log(`📊 Clientes obtenidos del dashboard: ${clientes.length}`)

    // Verificar/crear tabla
    await sql`
      CREATE TABLE IF NOT EXISTS clientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        nombre VARCHAR(255),
        apellido VARCHAR(255),
        telefono VARCHAR(50),
        estado VARCHAR(50) DEFAULT 'enabled',
        total_gastado DECIMAL(10,2) DEFAULT 0.00,
        numero_pedidos INTEGER DEFAULT 0,
        pais VARCHAR(100),
        provincia VARCHAR(100),
        fecha_creacion TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Borrar todos los clientes existentes
    const deleteResult = await sql`DELETE FROM clientes`
    const borrados = deleteResult.length || 0
    console.log(`🗑️ Clientes borrados: ${borrados}`)

    let insertados = 0
    const errores: string[] = []
    const detalles: string[] = []

    if (borrados > 0) {
      detalles.push(`Borrados: ${borrados} clientes existentes`)
    } else {
      detalles.push(`Borrados: 0 clientes existentes`)
    }

    // Insertar nuevos clientes
    for (const cliente of clientes) {
      try {
        const shopifyId = cliente.id?.toString() || `temp_${Date.now()}_${Math.random()}`
        const email = cliente.email || `cliente_${shopifyId}@ejemplo.com`
        const nombre = cliente.first_name || "Sin nombre"
        const apellido = cliente.last_name || "Sin apellido"
        const telefono = cliente.phone || null
        const estado = cliente.state || "enabled"
        const totalGastado = Number.parseFloat(cliente.total_spent || "0.00")
        const numeroPedidos = Number.parseInt(cliente.orders_count || "0")
        const pais = cliente.default_address?.country || null
        const provincia = cliente.default_address?.province || null
        const fechaCreacion = cliente.created_at ? new Date(cliente.created_at) : new Date()

        await sql`
          INSERT INTO clientes (
            shopify_id, email, nombre, apellido, telefono, estado,
            total_gastado, numero_pedidos, pais, provincia, fecha_creacion
          ) VALUES (
            ${shopifyId}, ${email}, ${nombre}, ${apellido}, ${telefono}, ${estado},
            ${totalGastado}, ${numeroPedidos}, ${pais}, ${provincia}, ${fechaCreacion}
          )
        `

        insertados++
        detalles.push(`Insertado: ${nombre} ${apellido} (${email})`)
        console.log(`✅ Cliente insertado: ${nombre} ${apellido}`)
      } catch (error) {
        const errorMsg = `Error en cliente ${cliente.email || cliente.id}: ${error instanceof Error ? error.message : "Error desconocido"}`
        errores.push(errorMsg)
        detalles.push(`❌ ${errorMsg}`)
        console.error(`❌ ${errorMsg}`)
      }
    }

    console.log(`✅ Reemplazo completado: ${borrados} borrados, ${insertados} insertados, ${errores.length} errores`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${borrados} borrados, ${insertados} insertados, ${errores.length} errores`,
      borrados,
      insertados,
      errores,
      detalles,
      totalClientes: clientes.length,
    })
  } catch (error) {
    console.error("❌ Error en reemplazo de clientes:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido en reemplazo de clientes",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
