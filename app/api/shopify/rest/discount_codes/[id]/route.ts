import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const maxDuration = 60 // 60 segundos

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const id = params.id

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules/${id}.json`, {
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
    const priceRule = data.price_rule

    // Obtener los códigos de descuento asociados a esta regla de precio
    const discountCodesResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-10/price_rules/${id}/discount_codes.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      },
    )

    let discountCode = null
    if (discountCodesResponse.ok) {
      const discountCodesData = await discountCodesResponse.json()
      if (discountCodesData.discount_codes && discountCodesData.discount_codes.length > 0) {
        discountCode = discountCodesData.discount_codes[0]
      }
    }

    // Transformar los datos para que sean compatibles con nuestra API
    const transformedData = {
      discount_code: {
        id: priceRule.id,
        title: priceRule.title,
        code: discountCode ? discountCode.code : priceRule.title,
        value_type: priceRule.value_type.toLowerCase() === "percentage" ? "percentage" : "fixed_amount",
        value: Math.abs(Number.parseFloat(priceRule.value)),
        starts_at: priceRule.starts_at,
        ends_at: priceRule.ends_at,
        status: priceRule.status.toLowerCase() === "active" ? "enabled" : "disabled",
        usage_limit: priceRule.usage_limit,
      },
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error(`Error al obtener promoción ${params.id}:`, error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const id = params.id

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json()
    const { discount_code } = body

    if (!discount_code) {
      return NextResponse.json({ error: "Faltan datos de la promoción" }, { status: 400 })
    }

    // Preparar los datos para actualizar la regla de precio
    const priceRuleData = {
      price_rule: {},
    }

    if (discount_code.title) priceRuleData.price_rule.title = discount_code.title
    if (discount_code.value_type) priceRuleData.price_rule.value_type = discount_code.value_type.toUpperCase()
    if (discount_code.value) {
      priceRuleData.price_rule.value =
        discount_code.value_type && discount_code.value_type.toLowerCase() === "percentage"
          ? `-${discount_code.value}`
          : `-${discount_code.value}`
    }
    if (discount_code.starts_at) priceRuleData.price_rule.starts_at = discount_code.starts_at
    if (discount_code.ends_at) priceRuleData.price_rule.ends_at = discount_code.ends_at
    if (discount_code.usage_limit) priceRuleData.price_rule.usage_limit = discount_code.usage_limit

    // Hacer la solicitud a la API de Shopify para actualizar la regla de precio
    const priceRuleResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules/${id}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify(priceRuleData),
    })

    if (!priceRuleResponse.ok) {
      const errorText = await priceRuleResponse.text()
      console.error(`Error al actualizar regla de precio (${priceRuleResponse.status}): ${errorText}`)
      return NextResponse.json(
        {
          error: `Error al actualizar regla de precio: ${priceRuleResponse.status} ${priceRuleResponse.statusText}`,
          details: errorText,
        },
        { status: priceRuleResponse.status },
      )
    }

    const updatedPriceRuleData = await priceRuleResponse.json()
    const updatedPriceRule = updatedPriceRuleData.price_rule

    // Si se proporciona un nuevo código, actualizar el código de descuento
    if (discount_code.code) {
      // Primero, obtener los códigos de descuento existentes
      const discountCodesResponse = await fetch(
        `https://${shopDomain}/admin/api/2023-10/price_rules/${id}/discount_codes.json`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
        },
      )

      if (discountCodesResponse.ok) {
        const discountCodesData = await discountCodesResponse.json()
        if (discountCodesData.discount_codes && discountCodesData.discount_codes.length > 0) {
          const existingDiscountCode = discountCodesData.discount_codes[0]

          // Actualizar el código de descuento existente
          const updateDiscountCodeResponse = await fetch(
            `https://${shopDomain}/admin/api/2023-10/price_rules/${id}/discount_codes/${existingDiscountCode.id}.json`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
              },
              body: JSON.stringify({
                discount_code: {
                  code: discount_code.code,
                },
              }),
            },
          )

          if (!updateDiscountCodeResponse.ok) {
            console.error(`Error al actualizar código de descuento: ${updateDiscountCodeResponse.statusText}`)
          }
        }
      }
    }

    // Transformar los datos para la respuesta
    return NextResponse.json({
      discount_code: {
        id: updatedPriceRule.id,
        title: updatedPriceRule.title,
        code: discount_code.code || updatedPriceRule.title,
        value_type: updatedPriceRule.value_type.toLowerCase() === "percentage" ? "percentage" : "fixed_amount",
        value: Math.abs(Number.parseFloat(updatedPriceRule.value)),
        starts_at: updatedPriceRule.starts_at,
        ends_at: updatedPriceRule.ends_at,
        status: updatedPriceRule.status.toLowerCase() === "active" ? "enabled" : "disabled",
        usage_limit: updatedPriceRule.usage_limit,
      },
    })
  } catch (error) {
    console.error(`Error al actualizar promoción ${params.id}:`, error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const id = params.id

    // Hacer la solicitud a la API de Shopify para eliminar la regla de precio
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules/${id}.json`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error al eliminar regla de precio (${response.status}): ${errorText}`)
      return NextResponse.json(
        {
          error: `Error al eliminar regla de precio: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error(`Error al eliminar promoción ${params.id}:`, error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
