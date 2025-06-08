import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando sincronización de promociones...")

    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener promociones de Shopify con URL completa
    console.log("📡 Obteniendo promociones de Shopify...")

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
    const shopifyUrl = `${baseUrl}/api/shopify/promotions`

    console.log("🔗 URL de promociones:", shopifyUrl)

    const shopifyResponse = await fetch(shopifyUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!shopifyResponse.ok) {
      console.error("❌ Error al obtener promociones de Shopify:", shopifyResponse.status)
      return NextResponse.json(
        {
          success: false,
          error: `Error al obtener promociones de Shopify: ${shopifyResponse.status}`,
          insertados: 0,
          errores: 1,
        },
        { status: 500 },
      )
    }

    const shopifyData = await shopifyResponse.json()
    const promociones = shopifyData.promociones || []

    console.log(`📦 Obtenidas ${promociones.length} promociones de Shopify`)

    // PASO 1: Verificar conexión a la base de datos
    try {
      await sql`SELECT 1`
      console.log("✅ Conexión a BD verificada")
    } catch (error) {
      console.error("❌ Error de conexión:", error)
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    // PASO 2: Crear tabla si no existe
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255),
          titulo VARCHAR(255),
          descripcion TEXT,
          tipo VARCHAR(50),
          valor DECIMAL(10,2),
          codigo VARCHAR(100),
          objetivo VARCHAR(255),
          objetivo_id VARCHAR(255),
          condiciones JSON,
          fecha_inicio TIMESTAMP,
          fecha_fin TIMESTAMP,
          activa BOOLEAN DEFAULT true,
          limite_uso INTEGER,
          contador_uso INTEGER DEFAULT 0,
          es_automatica BOOLEAN DEFAULT false,
          monto_minimo DECIMAL(10,2),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log("✅ Tabla promociones lista")
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla promociones" }, { status: 500 })
    }

    // PASO 3: Limpiar tabla existente
    let borrados = 0
    try {
      const deleteResult = await sql`DELETE FROM promociones`
      borrados = deleteResult.rowCount || 0
      console.log(`✅ Tabla limpiada: ${borrados} registros eliminados`)
    } catch (error) {
      console.error("❌ Error limpiando tabla:", error)
      // Continuar aunque falle la limpieza
    }

    // PASO 4: Insertar promociones
    let insertados = 0
    const errores = []

    for (const promocion of promociones) {
      try {
        // Extraer el ID numérico de Shopify del gid si es necesario
        let shopifyId = promocion.shopify_id || promocion.id
        if (typeof shopifyId === "string" && shopifyId.includes("/")) {
          shopifyId = shopifyId.split("/").pop()
        }

        // Preparar fechas
        const fechaInicio = promocion.fecha_inicio || promocion.fechaInicio || new Date().toISOString()
        const fechaFin = promocion.fecha_fin || promocion.fechaFin || null

        // Insertar en la base de datos
        await sql`
          INSERT INTO promociones (
            shopify_id, titulo, descripcion, tipo, valor, codigo,
            objetivo, objetivo_id, condiciones, fecha_inicio, fecha_fin,
            activa, limite_uso, contador_uso, es_automatica, monto_minimo
          ) VALUES (
            ${shopifyId},
            ${promocion.titulo || `Promoción ${shopifyId}`},
            ${promocion.descripcion || null},
            ${promocion.tipo || "PORCENTAJE_DESCUENTO"},
            ${promocion.valor || 0},
            ${promocion.codigo || null},
            ${promocion.objetivo || null},
            ${promocion.objetivo_id || null},
            ${promocion.condiciones ? JSON.stringify(promocion.condiciones) : null},
            ${fechaInicio},
            ${fechaFin},
            ${promocion.activa !== undefined ? promocion.activa : true},
            ${promocion.limite_uso || null},
            ${promocion.contador_uso || 0},
            ${promocion.es_automatica !== undefined ? promocion.es_automatica : false},
            ${promocion.monto_minimo || null}
          )
        `

        insertados++
        console.log(`✅ Promoción insertada: ${promocion.titulo || shopifyId}`)
      } catch (error) {
        console.error(`❌ Error al insertar promoción ${promocion.titulo || promocion.id}:`, error)
        errores.push(
          `Error al insertar ${promocion.titulo || promocion.id}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    // PASO 5: Verificar inserción
    try {
      const verificacion = await sql`SELECT COUNT(*) as count FROM promociones`
      const total = verificacion.rows[0]?.count || 0
      console.log(`📊 Total en BD: ${total}`)

      return NextResponse.json({
        success: true,
        message: `Reemplazo completado: ${borrados} borradas, ${insertados} insertadas, ${errores.length} errores`,
        borrados,
        insertados,
        errores: errores.length,
        totalEnBD: Number(total),
      })
    } catch (error) {
      console.error("❌ Error verificando resultado:", error)
      return NextResponse.json({
        success: true,
        message: `Sincronización completada con posibles errores: ${insertados} insertadas`,
        borrados,
        insertados,
        errores: errores.length,
      })
    }
  } catch (error) {
    console.error("❌ Error general en sincronización de promociones:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
        details: "Error en la sincronización de promociones",
        borrados: 0,
        insertados: 0,
        errores: 1,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  return POST(request)
}
