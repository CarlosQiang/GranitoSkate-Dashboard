import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando sincronización de promociones...")

    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener promociones de Shopify
    console.log("📡 Obteniendo promociones de Shopify...")

    const shopifyResponse = await fetch("/api/shopify/promotions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!shopifyResponse.ok) {
      throw new Error(`Error al obtener promociones de Shopify: ${shopifyResponse.status}`)
    }

    const shopifyData = await shopifyResponse.json()
    const promociones = shopifyData.promotions || []

    console.log(`📦 Obtenidas ${promociones.length} promociones de Shopify`)

    // Borrar todas las promociones existentes
    const deleteResult = await query("DELETE FROM promociones")
    const borrados = deleteResult.rowCount || 0

    console.log(`🗑️ Borradas ${borrados} promociones existentes`)

    let insertados = 0
    let errores = 0

    // Insertar nuevas promociones
    for (const promocion of promociones) {
      try {
        await query(
          `INSERT INTO promociones (
            shopify_id, titulo, descripcion, tipo, valor, codigo,
            objetivo, objetivo_id, condiciones, fecha_inicio, fecha_fin,
            activa, limite_uso, contador_uso, es_automatica
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
          )`,
          [
            promocion.shopify_id,
            promocion.titulo,
            promocion.descripcion,
            promocion.tipo,
            promocion.valor,
            promocion.codigo,
            promocion.objetivo,
            promocion.objetivo_id,
            promocion.condiciones ? JSON.stringify(promocion.condiciones) : null,
            promocion.fecha_inicio,
            promocion.fecha_fin,
            promocion.activa !== undefined ? promocion.activa : false,
            promocion.limite_uso,
            promocion.contador_uso || 0,
            promocion.es_automatica !== undefined ? promocion.es_automatica : false,
          ],
        )
        insertados++
      } catch (error) {
        console.error(`Error insertando promoción ${promocion.shopify_id}:`, error)
        errores++
      }
    }

    console.log(`✅ Sincronización completada: ${insertados} insertados, ${errores} errores`)

    return NextResponse.json({
      success: true,
      message: `Sincronización de promociones completada`,
      borrados,
      insertados,
      errores,
      total: promociones.length,
    })
  } catch (error) {
    console.error("❌ Error en sincronización de promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
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
