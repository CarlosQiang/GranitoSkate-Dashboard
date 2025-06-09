import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Obteniendo promociones de Shopify...")

    // Usar la API REST de Shopify para obtener descuentos
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/discounts.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("📊 Datos de Shopify:", data)

    // También obtener price rules que es donde están los descuentos
    const priceRulesResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/price_rules.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
      },
    )

    let promociones = []

    if (priceRulesResponse.ok) {
      const priceRulesData = await priceRulesResponse.json()
      console.log("💰 Price Rules de Shopify:", priceRulesData)

      promociones =
        priceRulesData.price_rules?.map((rule: any) => {
          // Determinar el tipo de descuento
          let tipo = "CANTIDAD_FIJA_DESCUENTO"
          let valor = 0

          if (rule.value_type === "percentage") {
            tipo = "PORCENTAJE_DESCUENTO"
            valor = Math.abs(Number.parseFloat(rule.value))
          } else if (rule.value_type === "fixed_amount") {
            tipo = "CANTIDAD_FIJA_DESCUENTO"
            valor = Math.abs(Number.parseFloat(rule.value))
          }

          // Determinar el estado
          let estado = "INACTIVE"
          const now = new Date()
          const startDate = rule.starts_at ? new Date(rule.starts_at) : null
          const endDate = rule.ends_at ? new Date(rule.ends_at) : null

          if (startDate && startDate > now) {
            estado = "SCHEDULED"
          } else if (endDate && endDate < now) {
            estado = "EXPIRED"
          } else if (startDate && startDate <= now && (!endDate || endDate >= now)) {
            estado = "ACTIVE"
          }

          return {
            id: `gid://shopify/PriceRule/${rule.id}`,
            shopify_id: rule.id.toString(),
            titulo: rule.title || "Promoción sin título",
            descripcion: `Descuento ${tipo === "PORCENTAJE_DESCUENTO" ? "del " + valor + "%" : "de €" + valor}${
              rule.prerequisite_subtotal_range?.greater_than_or_equal_to
                ? ` con compra mínima de €${rule.prerequisite_subtotal_range.greater_than_or_equal_to}`
                : ""
            }`,
            tipo: tipo,
            valor: valor,
            codigo: null, // Los códigos están en discount_codes
            fechaInicio: rule.starts_at,
            fechaFin: rule.ends_at,
            activa: estado === "ACTIVE",
            estado: estado,
            compraMinima: rule.prerequisite_subtotal_range?.greater_than_or_equal_to || null,
            limite_uso: rule.usage_limit || null,
            contador_uso: rule.usage_count || 0,
            esShopify: true,
          }
        }) || []
    }

    console.log(`✅ Promociones procesadas: ${promociones.length}`)

    return NextResponse.json({
      success: true,
      promociones: promociones,
      count: promociones.length,
    })
  } catch (error) {
    console.error("❌ Error obteniendo promociones de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promociones de Shopify",
        details: (error as Error).message,
        promociones: [],
      },
      { status: 500 },
    )
  }
}
