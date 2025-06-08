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

    console.log("🔍 Obteniendo promociones via REST API...")

    // Obtener variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("❌ Faltan credenciales de Shopify")
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales de Shopify no configuradas",
          promociones: [],
        },
        { status: 500 },
      )
    }

    // Obtener descuentos por código (price rules)
    const priceRulesUrl = `https://${shopDomain}/admin/api/2023-10/price_rules.json?limit=50`

    console.log("📡 Consultando price rules:", priceRulesUrl)

    const priceRulesResponse = await fetch(priceRulesUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!priceRulesResponse.ok) {
      const errorText = await priceRulesResponse.text()
      console.error("❌ Error en price rules:", priceRulesResponse.status, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Error al obtener price rules: ${priceRulesResponse.status}`,
          promociones: [],
        },
        { status: 500 },
      )
    }

    const priceRulesData = await priceRulesResponse.json()
    console.log(`✅ Price rules obtenidas: ${priceRulesData.price_rules?.length || 0}`)

    const promociones = []

    // Procesar price rules
    if (priceRulesData.price_rules && priceRulesData.price_rules.length > 0) {
      for (const priceRule of priceRulesData.price_rules) {
        try {
          // Obtener códigos de descuento para esta price rule
          const discountCodesUrl = `https://${shopDomain}/admin/api/2023-10/price_rules/${priceRule.id}/discount_codes.json`

          const discountCodesResponse = await fetch(discountCodesUrl, {
            method: "GET",
            headers: {
              "X-Shopify-Access-Token": accessToken,
              "Content-Type": "application/json",
            },
          })

          let codigo = null
          if (discountCodesResponse.ok) {
            const discountCodesData = await discountCodesResponse.json()
            if (discountCodesData.discount_codes && discountCodesData.discount_codes.length > 0) {
              codigo = discountCodesData.discount_codes[0].code
            }
          }

          // Determinar tipo y valor del descuento
          let tipo = "PORCENTAJE_DESCUENTO"
          let valor = 0

          if (priceRule.value_type === "percentage") {
            tipo = "PORCENTAJE_DESCUENTO"
            valor = Math.abs(Number.parseFloat(priceRule.value))
          } else if (priceRule.value_type === "fixed_amount") {
            tipo = "CANTIDAD_FIJA_DESCUENTO"
            valor = Math.abs(Number.parseFloat(priceRule.value))
          }

          // Determinar estado
          const now = new Date()
          const startDate = priceRule.starts_at ? new Date(priceRule.starts_at) : null
          const endDate = priceRule.ends_at ? new Date(priceRule.ends_at) : null

          let activa = true
          if (startDate && startDate > now) activa = false
          if (endDate && endDate < now) activa = false

          const promocion = {
            id: priceRule.id.toString(),
            shopify_id: priceRule.id.toString(),
            titulo: priceRule.title || `Promoción ${priceRule.id}`,
            descripcion: `Descuento ${valor}${tipo === "PORCENTAJE_DESCUENTO" ? "%" : "$"}`,
            tipo,
            valor,
            codigo,
            fecha_inicio: priceRule.starts_at,
            fecha_fin: priceRule.ends_at,
            activa,
            limite_uso: priceRule.usage_limit || null,
            es_automatica: false,
          }

          promociones.push(promocion)
        } catch (error) {
          console.error(`❌ Error procesando price rule ${priceRule.id}:`, error)
          // Continuar con la siguiente price rule
        }
      }
    }

    console.log(`✅ Promociones procesadas: ${promociones.length}`)

    return NextResponse.json({
      success: true,
      promociones,
      total: promociones.length,
    })
  } catch (error) {
    console.error("❌ Error general en promociones REST:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        promociones: [],
      },
      { status: 500 },
    )
  }
}
