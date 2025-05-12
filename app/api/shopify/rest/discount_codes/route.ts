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
      console.error("Faltan variables de entorno de Shopify")
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener parámetros de consulta
    const url = new URL(request.url)
    const limit = url.searchParams.get("limit") || "50"

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules.json?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de Shopify (${response.status}): ${errorText}`)
      return NextResponse.json(
        {
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Obtener los datos de la respuesta
    const data = await response.json()

    // Transformar los datos para que sean compatibles con nuestra API
    const discountCodes = data.price_rules.map((rule) => {
      return {
        id: rule.id,
        title: rule.title,
        code: rule.title, // Usamos el título como código por defecto
        value_type: rule.value_type.toLowerCase() === "percentage" ? "percentage" : "fixed_amount",
        value: Math.abs(Number.parseFloat(rule.value)),
        starts_at: rule.starts_at,
        ends_at: rule.ends_at,
        status: rule.status.toLowerCase() === "active" ? "enabled" : "disabled",
        usage_limit: rule.usage_limit,
      }
    })

    return NextResponse.json({ discount_codes: discountCodes })
  } catch (error) {
    console.error("Error en el endpoint de discount_codes:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message,
      },
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
      console.error("Faltan variables de entorno de Shopify")
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json()
    const { discount_code } = body

    if (!discount_code) {
      return NextResponse.json({ error: "Faltan datos de la promoción" }, { status: 400 })
    }

    // Crear la regla de precio (price rule)
    const priceRuleData = {
      price_rule: {
        title: discount_code.title || discount_code.code,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: discount_code.value_type.toUpperCase(),
        value:
          discount_code.value_type.toLowerCase() === "percentage"
            ? `-${discount_code.value}`
            : `-${discount_code.value}`,
        customer_selection: "all",
        starts_at: discount_code.starts_at || new Date().toISOString(),
        ends_at: discount_code.ends_at || null,
        usage_limit: discount_code.usage_limit || null,
      },
    }

    // Hacer la solicitud a la API de Shopify para crear la regla de precio
    const priceRuleResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify(priceRuleData),
    })

    if (!priceRuleResponse.ok) {
      const errorText = await priceRuleResponse.text()
      console.error(`Error al crear regla de precio (${priceRuleResponse.status}): ${errorText}`)
      return NextResponse.json(
        {
          error: `Error al crear regla de precio: ${priceRuleResponse.status} ${priceRuleResponse.statusText}`,
          details: errorText,
        },
        { status: priceRuleResponse.status },
      )
    }

    const priceRuleData2 = await priceRuleResponse.json()
    const priceRuleId = priceRuleData2.price_rule.id

    // Crear el código de descuento asociado a la regla de precio
    const discountCodeData = {
      discount_code: {
        code: discount_code.code,
      },
    }

    const discountCodeResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-10/price_rules/${priceRuleId}/discount_codes.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify(discountCodeData),
      },
    )

    if (!discountCodeResponse.ok) {
      const errorText = await discountCodeResponse.text()
      console.error(`Error al crear código de descuento (${discountCodeResponse.status}): ${errorText}`)
      return NextResponse.json(
        {
          error: `Error al crear código de descuento: ${discountCodeResponse.status} ${discountCodeResponse.statusText}`,
          details: errorText,
        },
        { status: discountCodeResponse.status },
      )
    }

    const discountCodeResponseData = await discountCodeResponse.json()

    return NextResponse.json({
      discount_code: {
        id: priceRuleId,
        title: discount_code.title || discount_code.code,
        code: discountCodeResponseData.discount_code.code,
        value_type: discount_code.value_type,
        value: discount_code.value,
        starts_at: priceRuleData2.price_rule.starts_at,
        ends_at: priceRuleData2.price_rule.ends_at,
        status: priceRuleData2.price_rule.status.toLowerCase() === "active" ? "enabled" : "disabled",
        usage_limit: priceRuleData2.price_rule.usage_limit,
      },
    })
  } catch (error) {
    console.error("Error al crear promoción:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
