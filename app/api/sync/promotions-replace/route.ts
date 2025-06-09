import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { logSyncEvent } from "@/lib/db"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de promociones...")

    // 1. Obtener promociones de Shopify usando la API interna
    console.log("📡 Obteniendo promociones de Shopify...")
    const shopifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/shopify/promotions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!shopifyResponse.ok) {
      throw new Error(`Error al obtener promociones de Shopify: ${shopifyResponse.status}`)
    }

    const shopifyData = await shopifyResponse.json()
    const promociones = shopifyData.promotions || []

    console.log(`📊 Promociones obtenidas de Shopify: ${promociones.length}`)

    // 2. Borrar todas las promociones existentes
    console.log("🗑️ Borrando promociones existentes...")
    const deleteResult = await query("DELETE FROM promociones")
    const borrados = deleteResult.rowCount || 0
    console.log(`✅ ${borrados} promociones borradas`)

    let insertados = 0
    let errores = 0
    const detalles = []

    // 3. Insertar las nuevas promociones
    for (const promocion of promociones) {
      try {
        console.log(`💾 Insertando promoción: ${promocion.title}`)

        // Extraer el ID numérico de Shopify
        const shopifyId = promocion.id.includes("/") ? promocion.id.split("/").pop() : promocion.id

        // Preparar los datos para insertar
        const insertData = {
          shopify_id: shopifyId,
          titulo: promocion.title || "Sin título",
          descripcion: promocion.summary || promocion.title || "Sin descripción",
          tipo: promocion.discountClass === "PERCENTAGE" ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT",
          valor: Number.parseFloat(promocion.value || "0"),
          codigo: promocion.codes?.[0]?.code || `PROMO_${shopifyId}`,
          fecha_inicio: promocion.startsAt ? new Date(promocion.startsAt) : null,
          fecha_fin: promocion.endsAt ? new Date(promocion.endsAt) : null,
          activa: promocion.status === "ACTIVE",
          limite_uso: promocion.usageLimit || null,
          contador_uso: promocion.asyncUsageCount || 0,
          es_automatica: false,
        }

        const result = await query(
          `INSERT INTO promociones (
            shopify_id, titulo, descripcion, tipo, valor, codigo,
            fecha_inicio, fecha_fin, activa, limite_uso, contador_uso, es_automatica
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
          RETURNING id`,
          [
            insertData.shopify_id,
            insertData.titulo,
            insertData.descripcion,
            insertData.tipo,
            insertData.valor,
            insertData.codigo,
            insertData.fecha_inicio,
            insertData.fecha_fin,
            insertData.activa,
            insertData.limite_uso,
            insertData.contador_uso,
            insertData.es_automatica,
          ],
        )

        if (result.rows.length > 0) {
          insertados++
          console.log(`✅ Promoción insertada: ${insertData.titulo} (ID: ${result.rows[0].id})`)

          detalles.push({
            shopify_id: insertData.shopify_id,
            titulo: insertData.titulo,
            resultado: "insertado",
          })

          // Registrar evento exitoso
          await logSyncEvent(
            "promociones",
            insertData.shopify_id,
            "crear",
            "completado",
            `Promoción insertada: ${insertData.titulo}`,
          )
        }
      } catch (error) {
        errores++
        console.error(`❌ Error insertando promoción ${promocion.title}:`, error)

        detalles.push({
          shopify_id: promocion.id,
          titulo: promocion.title,
          resultado: "error",
          error: error.message,
        })

        // Registrar evento de error
        await logSyncEvent(
          "promociones",
          promocion.id,
          "crear",
          "error",
          `Error insertando promoción: ${error.message}`,
        )
      }
    }

    // 4. Verificar el resultado final
    const finalCountResult = await query("SELECT COUNT(*) as total FROM promociones")
    const totalEnBD = Number.parseInt(finalCountResult.rows[0].total)

    console.log(`✅ Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`)
    console.log(`📊 Total de promociones en BD: ${totalEnBD}`)

    // Registrar evento de finalización
    await logSyncEvent(
      "promociones",
      null,
      "reemplazar",
      "completado",
      `Reemplazo completo: ${borrados} borrados, ${insertados} insertados, ${errores} errores`,
    )

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`,
      results: {
        borrados,
        insertados,
        errores,
        detalles,
      },
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error en reemplazo de promociones:", error)

    // Registrar evento de error general
    await logSyncEvent("promociones", null, "reemplazar", "error", `Error general en reemplazo: ${error.message}`)

    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de promociones",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
