import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    console.log("🔍 Obteniendo promociones via REST API...")

    // Obtener descuentos por código (price rules)
    const priceRulesResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules.json?limit=250`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!priceRulesResponse.ok) {
      console.error(`Error al obtener price rules: ${priceRulesResponse.status}`)
      throw new Error(`Error al obtener promociones: ${priceRulesResponse.status}`)
    }

    const priceRulesData = await priceRulesResponse.json()
    const priceRules = priceRulesData.price_rules || []

    console.log(`✅ Obtenidas ${priceRules.length} price rules`)

    // Para cada price rule, obtener sus códigos de descuento
    const promociones = []

    for (const priceRule of priceRules) {
      try {
        // Obtener códigos de descuento para esta price rule
        const discountCodesResponse = await fetch(
          `https://${shopDomain}/admin/api/2023-10/price_rules/${priceRule.id}/discount_codes.json`,
          {
            headers: {
              "X-Shopify-Access-Token": accessToken,
              "Content-Type": "application/json",
            },
          },
        )

        let discountCodes = []
        if (discountCodesResponse.ok) {
          const discountCodesData = await discountCodesResponse.json()
          discountCodes = discountCodesData.discount_codes || []
        }

        // Determinar el tipo de descuento
        let tipo = "PORCENTAJE_DESCUENTO"
        let valor = 0

        if (priceRule.value_type === "percentage") {
          tipo = "PORCENTAJE_DESCUENTO"
          valor = Number.parseFloat(priceRule.value) || 0
        } else if (priceRule.value_type === "fixed_amount") {
          tipo = "CANTIDAD_FIJA_DESCUENTO"
          valor = Number.parseFloat(priceRule.value) || 0
        }

        // Crear objeto de promoción
        const promocion = {
          id: `gid://shopify/PriceRule/${priceRule.id}`,
          shopify_id: priceRule.id.toString(),
          titulo: priceRule.title || `Promoción ${priceRule.id}`,
          descripcion: priceRule.title || "",
          tipo,
          valor,
          codigo: discountCodes.length > 0 ? discountCodes[0].code : null,
          objetivo: priceRule.target_type || null,
          objetivo_id: null,
          condiciones: {
            prerequisite_quantity_range: priceRule.prerequisite_quantity_range,
            prerequisite_shipping_price_range: priceRule.prerequisite_shipping_price_range,
            prerequisite_subtotal_range: priceRule.prerequisite_subtotal_range,
            customer_selection: priceRule.customer_selection,
            entitled_product_ids: priceRule.entitled_product_ids,
            entitled_variant_ids: priceRule.entitled_variant_ids,
            entitled_collection_ids: priceRule.entitled_collection_ids,
            entitled_country_ids: priceRule.entitled_country_ids,
          },
          fecha_inicio: priceRule.starts_at,
          fecha_fin: priceRule.ends_at,
          activa:
            new Date() >= new Date(priceRule.starts_at) &&
            (!priceRule.ends_at || new Date() <= new Date(priceRule.ends_at)),
          limite_uso: priceRule.usage_limit,
          contador_uso: priceRule.usage_count || 0,
          es_automatica: false, // Price rules con códigos no son automáticas
        }

        promociones.push(promocion)
      } catch (error) {
        console.error(`Error procesando price rule ${priceRule.id}:`, error)
        // Continuar con la siguiente price rule
      }
    }

    console.log(`✅ Procesadas ${promociones.length} promociones`)

    return NextResponse.json({
      success: true,
      promociones,
      total: promociones.length,
      source: "REST API",
    })
  } catch (error) {
    console.error("❌ Error al obtener promociones via REST:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promociones",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
