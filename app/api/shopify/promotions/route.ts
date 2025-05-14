import { type NextRequest, NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/api/shopify"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = url.searchParams.get("limit") || "50"
    const page = url.searchParams.get("page") || "1"

    // Obtener price rules
    const priceRulesResponse = await shopifyFetch({
      endpoint: `price_rules.json?limit=${limit}&page=${page}`,
      method: "GET",
    })

    if (!priceRulesResponse.ok) {
      return NextResponse.json(
        { error: `Error al obtener promociones: ${priceRulesResponse.statusText}` },
        { status: priceRulesResponse.status },
      )
    }

    const priceRulesData = await priceRulesResponse.json()
    const priceRules = priceRulesData.price_rules || []

    // Para cada price rule, obtener sus discount codes
    const promotions = []
    for (const rule of priceRules) {
      const discountCodesResponse = await shopifyFetch({
        endpoint: `price_rules/${rule.id}/discount_codes.json`,
        method: "GET",
      })

      if (discountCodesResponse.ok) {
        const discountCodesData = await discountCodesResponse.json()
        const discountCodes = discountCodesData.discount_codes || []

        // Combinar price rule con sus discount codes
        for (const code of discountCodes) {
          promotions.push({
            id: code.id,
            price_rule_id: rule.id,
            code: code.code,
            title: rule.title,
            value_type: rule.value_type,
            value: rule.value,
            target_type: rule.target_type,
            target_selection: rule.target_selection,
            allocation_method: rule.allocation_method,
            starts_at: rule.starts_at,
            ends_at: rule.ends_at,
            status: code.status || rule.status,
            usage_limit: rule.usage_limit,
          })
        }
      }
    }

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error("Error en API de promociones:", error)
    return NextResponse.json(
      {
        error: "Error al obtener promociones",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
