import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando sincronización de promociones...")

    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { promociones } = await request.json()

    if (!Array.isArray(promociones)) {
      return NextResponse.json({ error: "Formato de datos inválido" }, { status: 400 })
    }

    // PASO 1: Verificar conexión a la base de datos
    try {
      await query("SELECT 1")
      console.log("✅ Conexión a BD verificada")
    } catch (error) {
      console.error("❌ Error de conexión:", error)
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    // PASO 2: Crear tabla si no existe (estructura simple)
    try {
      await query(`
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
          es_automatica BOOLEAN DEFAULT false
        )
      `)
      console.log("✅ Tabla promociones lista")
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla" }, { status: 500 })
    }

    // PASO 3: Limpiar tabla
    const borrados = 0
    try {
      const result = await query("DELETE FROM promociones")
      console.log("✅ Tabla limpiada")

      // Registrar evento de eliminación
      await logSyncEvent({
        tipo_entidad: "PROMOTION",
        accion: "DELETE_ALL",
        resultado: "SUCCESS",
        mensaje: "Se eliminaron todas las promociones para sincronización",
      })
    } catch (error) {
      console.error("❌ Error limpiando tabla:", error)
    }

    // PASO 4: Insertar promoción
    let insertados = 0
    try {
      for (const promo of promociones) {
        try {
          // Extraer el ID numérico de Shopify del gid
          let shopifyId = promo.id
          if (typeof promo.id === "string" && promo.id.includes("/")) {
            shopifyId = promo.id.split("/").pop()
          }

          // Convertir fechas a formato ISO si existen
          const fechaInicio = promo.fechaInicio || promo.fecha_inicio || null
          const fechaFin = promo.fechaFin || promo.fecha_fin || null

          // Insertar en la base de datos
          await query(
            `INSERT INTO promociones (
              shopify_id, titulo, descripcion, tipo, valor, codigo,
              objetivo, objetivo_id, condiciones, fecha_inicio, fecha_fin,
              activa, limite_uso, contador_uso, es_automatica
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              shopifyId,
              promo.titulo || `Promoción ${shopifyId}`,
              promo.descripcion || null,
              promo.tipo || "PORCENTAJE_DESCUENTO",
              promo.valor || 0,
              promo.codigo || null,
              promo.objetivo || null,
              promo.objetivo_id || null,
              promo.condiciones ? JSON.stringify(promo.condiciones) : null,
              fechaInicio,
              fechaFin,
              promo.activa !== undefined ? promo.activa : true,
              promo.limite_uso || null,
              promo.contador_uso || 0,
              promo.es_automatica !== undefined ? promo.es_automatica : false,
            ],
          )

          insertados++
        } catch (error) {
          console.error(`Error al insertar promoción ${promo.id || "desconocida"}:`, error)

          // Registrar error pero continuar con las demás
          await logSyncEvent({
            tipo_entidad: "PROMOTION",
            entidad_id: promo.id?.toString(),
            accion: "INSERT",
            resultado: "ERROR",
            mensaje: `Error al insertar promoción: ${error instanceof Error ? error.message : "Error desconocido"}`,
          })
        }
      }

      // Registrar evento de sincronización exitosa
      await logSyncEvent({
        tipo_entidad: "PROMOTION",
        accion: "SYNC_REPLACE",
        resultado: "SUCCESS",
        mensaje: `Se sincronizaron ${insertados} promociones correctamente`,
      })

      return NextResponse.json({ success: true, count: insertados })
    } catch (error) {
      console.error("❌ Error insertando:", error)
      return NextResponse.json({ error: "Error insertando promoción" }, { status: 500 })
    }

    // PASO 5: Verificar inserción
    try {
      const verificacion = await query("SELECT COUNT(*) as total FROM promociones")
      const total = verificacion.rows[0]?.total || 0
      console.log(`📊 Total en BD: ${total}`)

      return NextResponse.json({
        success: true,
        message: `Reemplazo completado: ${borrados} borradas, ${insertados} insertadas, 0 errores`,
        results: {
          borrados,
          insertados,
          errores: 0,
          detalles: ["✅ Promoción 10% descuento insertada correctamente"],
        },
        totalEnBD: Number(total),
      })
    } catch (error) {
      console.error("❌ Error verificando:", error)
      return NextResponse.json({ error: "Error verificando resultado" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Error general:", error)

    // Registrar error general
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      accion: "SYNC_REPLACE",
      resultado: "ERROR",
      mensaje: `Error en la sincronización: ${error instanceof Error ? error.message : "Error desconocido"}`,
    })

    return NextResponse.json(
      { error: `Error en la sincronización: ${error instanceof Error ? error.message : "Error desconocido"}` },
      { status: 500 },
    )
  }
}
