import { NextResponse } from "next/server"
import { fetchPromociones } from "@/lib/api/promociones"
import { createPromocion, updatePromocion, getPromocionByShopifyId } from "@/lib/db/repositories/promociones-repository"

export async function POST() {
  try {
    console.log(`🔄 Iniciando sincronización de promociones`)

    // Obtener promociones de Shopify
    const promocionesShopify = await fetchPromociones("todas")
    const promocionesShopifyPuras = promocionesShopify.filter((p) => p.esShopify)

    let sincronizadas = 0
    let creadas = 0
    let actualizadas = 0

    for (const promocionShopify of promocionesShopifyPuras) {
      try {
        // Buscar si existe en BD local
        const promocionLocal = await getPromocionByShopifyId(promocionShopify.shopify_id)

        if (promocionLocal) {
          // Actualizar existente
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
      } catch (error) {
        console.error(`❌ Error sincronizando promoción ${promocionShopify.id}:`, error)
      }
    }

    console.log(
      `✅ Sincronización completada: ${sincronizadas} promociones (${creadas} creadas, ${actualizadas} actualizadas)`,
    )

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${sincronizadas} promociones`,
      stats: {
        total: sincronizadas,
        creadas,
        actualizadas,
      },
    })
  } catch (error) {
    console.error("❌ Error en sincronización de promociones:", error)
    return NextResponse.json({ error: "Error en la sincronización", details: error.message }, { status: 500 })
  }
}
