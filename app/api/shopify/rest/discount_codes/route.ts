import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const maxDuration = 60 // 60 segundos

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "50"

    // Hacer la solicitud a la API REST de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules.json?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de Shopify (${response.status}): ${errorText}`)
      return NextResponse.json(
        { error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Procesar los datos para obtener los códigos de descuento asociados a cada regla de precio
    const priceRules = data.price_rules || []

    // Para cada regla de precio, obtener sus códigos de descuento
    const priceRulesWithCodes = await Promise.all(
      priceRules.map(async (rule) => {
        try {
          const discountResponse = await fetch(
            `https://${shopDomain}/admin/api/2023-10/price_rules/${rule.id}/discount_codes.json`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
              },
            },
          )

          if (discountResponse.ok) {
            const discountData = await discountResponse.json()
            return {
              ...rule,
              discount_codes: discountData.discount_codes || [],
            }
          }
          return rule
        } catch (error) {
          console.error(`Error al obtener códigos de descuento para la regla ${rule.id}:`, error)
          return rule
        }
      }),
    )

    return NextResponse.json({ price_rules: priceRulesWithCodes })
  } catch (error) {
    console.error("Error al obtener códigos de descuento:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()

    // Validar datos mínimos
    if (!body.discount_code) {
      return NextResponse.json({ error: "Se requiere un objeto discount_code" }, { status: 400 })
    }

    // Crear primero la regla de precio
    const priceRuleResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        price_rule: {
          title: body.discount_code.title || "Promoción",
          target_type: "line_item",
          target_selection: "all",
          allocation_method: "across",
          value_type: body.discount_code.value_type || "percentage",
          value: body.discount_code.value || "-10.0",
          customer_selection: "all",
          starts_at: body.discount_code.starts_at || new Date().toISOString(),
          ends_at: body.discount_code.ends_at || null,
        },
      }),
    })

    if (!priceRuleResponse.ok) {
      const errorText = await priceRuleResponse.text()
      console.error(`Error al crear regla de precio (${priceRuleResponse.status}): ${errorText}`)
      return NextResponse.json(
        { error: `Error al crear regla de precio: ${priceRuleResponse.status} ${priceRuleResponse.statusText}` },
        { status: priceRuleResponse.status },
      )
    }

    const priceRuleData = await priceRuleResponse.json()
    const priceRuleId = priceRuleData.price_rule.id

    // Crear el código de descuento asociado a la regla de precio
    const discountCodeResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-10/price_rules/${priceRuleId}/discount_codes.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          discount_code: {
            code: body.discount_code.code || `PROMO${Math.floor(Math.random() * 10000)}`,
          },
        }),
      },
    )

    if (!discountCodeResponse.ok) {
      const errorText = await discountCodeResponse.text()
      console.error(`Error al crear código de descuento (${discountCodeResponse.status}): ${errorText}`)
      return NextResponse.json(
        {
          error: `Error al crear código de descuento: ${discountCodeResponse.status} ${discountCodeResponse.statusText}`,
        },
        { status: discountCodeResponse.status },
      )
    }

    const discountCodeData = await discountCodeResponse.json()

    return NextResponse.json({
      price_rule: priceRuleData.price_rule,
      discount_code: discountCodeData.discount_code,
    })
  } catch (error) {
    console.error("Error al crear código de descuento:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
      { status: 500 },
    )
  }
}
