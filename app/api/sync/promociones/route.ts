import { NextResponse } from "next/server"
import { fetchPromociones } from "@/lib/api/promociones"
import { createPromocion, updatePromocion, getPromocionByShopifyId } from "@/lib/db/repositories/promociones-repository"
import { logSyncEvent } from "@/lib/db"

export async function POST() {
  try {
    console.log(`🔄 Iniciando sincronización de promociones`)

    // Obtener promociones de Shopify
    const promocionesShopify = await fetchPromociones("todas")
    console.log(`📊 Promociones obtenidas de Shopify: ${promocionesShopify.length}`)

    // Filtrar solo las promociones que vienen de Shopify
    const promocionesShopifyPuras = promocionesShopify.filter((p) => p.shopify_id)
    console.log(`📊 Promociones filtradas con shopify_id: ${promocionesShopifyPuras.length}`)

    let sincronizadas = 0
    let creadas = 0
    let actualizadas = 0
    let errores = 0

    for (const promocionShopify of promocionesShopifyPuras) {
      try {
        if (!promocionShopify.shopify_id) {
          console.warn(`⚠️ Promoción sin shopify_id, saltando:`, promocionShopify)
          continue
        }

        // Buscar si existe en BD local
        const promocionLocal = await getPromocionByShopifyId(promocionShopify.shopify_id)

        if (promocionLocal) {
          // Actualizar existente
          console.log(
            `🔄 Actualizando promoción existente: ${promocionShopify.titulo} (ID: ${promocionShopify.shopify_id})`,
          )
          await updatePromocion(promocionLocal.id, {
            titulo: promocionShopify.titulo,
            descripcion: promocionShopify.descripcion,
            tipo: promocionShopify.tipo,
            valor: promocionShopify.valor,
            codigo: promocionShopify.codigo,
            fecha_inicio: promocionShopify.fechaInicio ? new Date(promocionShopify.fechaInicio) : null,
            fecha_fin: promocionShopify.fechaFin ? new Date(promocionShopify.fechaFin) : null,
            activa: promocionShopify.activa,
          })
          actualizadas++
        } else {
          // Crear nueva
          console.log(`🆕 Creando nueva promoción: ${promocionShopify.titulo} (ID: ${promocionShopify.shopify_id})`)
          await createPromocion({
            shopify_id: promocionShopify.shopify_id,
            titulo: promocionShopify.titulo,
            descripcion: promocionShopify.descripcion,
            tipo: promocionShopify.tipo,
            valor: promocionShopify.valor,
            codigo: promocionShopify.codigo,
            fecha_inicio: promocionShopify.fechaInicio ? new Date(promocionShopify.fechaInicio) : null,
            fecha_fin: promocionShopify.fechaFin ? new Date(promocionShopify.fechaFin) : null,
            activa: promocionShopify.activa,
          })
          creadas++
        }
        sincronizadas++

        // Registrar evento de sincronización exitosa
        await logSyncEvent(
          "promociones",
          promocionShopify.shopify_id,
          promocionLocal ? "actualizar" : "crear",
          "completado",
          `Promoción ${promocionLocal ? "actualizada" : "creada"}: ${promocionShopify.titulo}`,
        )
      } catch (error) {
        console.error(
          `❌ Error sincronizando promoción ${promocionShopify.shopify_id || promocionShopify.titulo}:`,
          error,
        )
        errores++

        // Registrar evento de error
        await logSyncEvent(
          "promociones",
          promocionShopify.shopify_id || null,
          "sincronizar",
          "error",
          `Error sincronizando promoción: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    console.log(
      `✅ Sincronización completada: ${sincronizadas} promociones (${creadas} creadas, ${actualizadas} actualizadas, ${errores} errores)`,
    )

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${sincronizadas} promociones`,
      stats: {
        total: sincronizadas,
        creadas,
        actualizadas,
        errores,
      },
    })
  } catch (error) {
    console.error("❌ Error en sincronización de promociones:", error)
    return NextResponse.json({ error: "Error en la sincronización", details: error.message }, { status: 500 })
  }
}
