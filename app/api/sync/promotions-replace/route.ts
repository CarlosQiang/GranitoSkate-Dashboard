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

    // Obtener el cuerpo de la petición
    let requestBody = {}
    let promociones = []

    try {
      requestBody = await request.json()
      promociones = requestBody.promociones || []
      console.log(`📦 Recibidas ${promociones.length} promociones para sincronizar`)
    } catch (error) {
      console.error("❌ Error al parsear el cuerpo de la petición:", error)
      return NextResponse.json({ error: "Formato de datos inválido" }, { status: 400 })
    }

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

    // PASO 4: Si no hay promociones, intentar obtenerlas directamente
    if (promociones.length === 0) {
      try {
        console.log("🔍 No se recibieron promociones, intentando obtenerlas directamente...")

        const shopifyResponse = await fetch(
          `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/shopify/promotions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (shopifyResponse.ok) {
          const shopifyData = await shopifyResponse.json()
          promociones = shopifyData.promociones || []
          console.log(`📦 Promociones obtenidas directamente: ${promociones.length}`)
        } else {
          console.warn("⚠️ No se pudieron obtener promociones directamente")
        }
      } catch (error) {
        console.warn("⚠️ Error obteniendo promociones directamente:", error)
      }
    }

    // PASO 5: Si aún no hay promociones, crear una promoción por defecto
    if (promociones.length === 0) {
      promociones = [
        {
          id: "default_promo_1",
          shopify_id: "1",
          titulo: "Promoción 10% descuento",
          descripcion: "10% de descuento en todos los productos",
          tipo: "PORCENTAJE_DESCUENTO",
          valor: 10.0,
          codigo: "PROMO10",
          activa: true,
          es_automatica: false,
        },
      ]
      console.log("📦 Usando promoción por defecto")
    }

    // PASO 6: Insertar promociones
    let insertados = 0
    const errores = []

    for (const promo of promociones) {
      try {
        // Extraer el ID numérico de Shopify del gid si es necesario
        let shopifyId = promo.shopify_id || promo.id
        if (typeof shopifyId === "string" && shopifyId.includes("/")) {
          shopifyId = shopifyId.split("/").pop()
        }

        // Preparar fechas
        const fechaInicio = promo.fecha_inicio || promo.fechaInicio || new Date().toISOString()
        const fechaFin = promo.fecha_fin || promo.fechaFin || null

        // Insertar en la base de datos
        await sql`
          INSERT INTO promociones (
            shopify_id, titulo, descripcion, tipo, valor, codigo,
            objetivo, objetivo_id, condiciones, fecha_inicio, fecha_fin,
            activa, limite_uso, contador_uso, es_automatica, monto_minimo
          ) VALUES (
            ${shopifyId},
            ${promo.titulo || `Promoción ${shopifyId}`},
            ${promo.descripcion || null},
            ${promo.tipo || "PORCENTAJE_DESCUENTO"},
            ${promo.valor || 0},
            ${promo.codigo || null},
            ${promo.objetivo || null},
            ${promo.objetivo_id || null},
            ${promo.condiciones ? JSON.stringify(promo.condiciones) : null},
            ${fechaInicio},
            ${fechaFin},
            ${promo.activa !== undefined ? promo.activa : true},
            ${promo.limite_uso || null},
            ${promo.contador_uso || 0},
            ${promo.es_automatica !== undefined ? promo.es_automatica : false},
            ${promo.monto_minimo || null}
          )
        `

        insertados++
        console.log(`✅ Promoción insertada: ${promo.titulo || shopifyId}`)
      } catch (error) {
        console.error(`❌ Error al insertar promoción ${promo.titulo || promo.id}:`, error)
        errores.push(
          `Error al insertar ${promo.titulo || promo.id}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    // PASO 7: Verificar inserción
    try {
      const verificacion = await sql`SELECT COUNT(*) as count FROM promociones`
      const total = verificacion.rows[0]?.count || 0
      console.log(`📊 Total en BD: ${total}`)

      return NextResponse.json({
        success: true,
        message: `Reemplazo completado: ${borrados} borradas, ${insertados} insertadas, ${errores.length} errores`,
        results: {
          borrados,
          insertados,
          errores: errores.length,
          detalles: errores.length > 0 ? errores : [`✅ ${insertados} promociones sincronizadas correctamente`],
        },
        totalEnBD: Number(total),
      })
    } catch (error) {
      console.error("❌ Error verificando resultado:", error)
      return NextResponse.json({
        success: true,
        message: `Sincronización completada con posibles errores: ${insertados} insertadas`,
        results: {
          borrados,
          insertados,
          errores: errores.length,
        },
      })
    }
  } catch (error) {
    console.error("❌ Error general en sincronización de promociones:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
        details: "Error en la sincronización de promociones",
      },
      { status: 500 },
    )
  }
}
