import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { fetchPromociones } from "@/lib/api/promociones"
import { createPromocion } from "@/lib/db/repositories/promociones-repository"
import { logSyncEvent } from "@/lib/db"

export async function POST() {
  try {
    console.log(`🔄 Iniciando reemplazo completo de promociones`)

    // 1. Obtener todas las promociones de Shopify
    const promocionesShopify = await fetchPromociones("todas")
    console.log(`📊 Promociones obtenidas de Shopify: ${promocionesShopify.length}`)

    // Filtrar solo las promociones que vienen de Shopify
    const promocionesShopifyPuras = promocionesShopify.filter((p) => p.shopify_id)
    console.log(`📊 Promociones filtradas con shopify_id: ${promocionesShopifyPuras.length}`)

    // 2. Borrar todas las promociones existentes en la base de datos
    console.log(`🗑️ Borrando todas las promociones existentes...`)
    const deleteResult = await query(`DELETE FROM promociones RETURNING id`)
    const borrados = deleteResult.rowCount || 0
    console.log(`🗑️ ${borrados} promociones borradas`)

    // Registrar evento de borrado masivo
    await logSyncEvent(
      "promociones",
      null,
      "borrar_todo",
      "completado",
      `Se borraron ${borrados} promociones para reemplazo completo`,
    )

    // 3. Insertar todas las promociones de Shopify
    let insertados = 0
    let errores = 0
    const detalles = []

    for (const promocion of promocionesShopifyPuras) {
      try {
        if (!promocion.shopify_id) {
          console.warn(`⚠️ Promoción sin shopify_id, saltando:`, promocion)
          continue
        }

        console.log(`📝 Insertando promoción: ${promocion.titulo} (ID: ${promocion.shopify_id})`)

        await createPromocion({
          shopify_id: promocion.shopify_id,
          titulo: promocion.titulo,
          descripcion: promocion.descripcion,
          tipo: promocion.tipo,
          valor: promocion.valor,
          codigo: promocion.codigo,
          fecha_inicio: promocion.fechaInicio ? new Date(promocion.fechaInicio) : null,
          fecha_fin: promocion.fechaFin ? new Date(promocion.fechaFin) : null,
          activa: promocion.activa,
        })

        insertados++
        detalles.push(`✅ Promoción insertada: ${promocion.titulo}`)

        // Registrar evento de inserción
        await logSyncEvent(
          "promociones",
          promocion.shopify_id,
          "crear",
          "completado",
          `Promoción creada en reemplazo completo: ${promocion.titulo}`,
        )
      } catch (error) {
        console.error(`❌ Error insertando promoción ${promocion.titulo}:`, error)
        errores++
        detalles.push(
          `❌ Error insertando promoción ${promocion.titulo}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )

        // Registrar evento de error
        await logSyncEvent(
          "promociones",
          promocion.shopify_id || null,
          "crear",
          "error",
          `Error creando promoción en reemplazo completo: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    console.log(`✅ Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`,
      results: {
        borrados,
        insertados,
        errores,
        detalles,
      },
    })
  } catch (error) {
    console.error("❌ Error en reemplazo completo de promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en reemplazo completo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
