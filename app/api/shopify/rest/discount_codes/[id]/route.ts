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
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    const id = params.id

    // Obtener la regla de precio
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules/${id}.json`, {
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

    // Obtener los códigos de descuento asociados
    const discountResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-10/price_rules/${id}/discount_codes.json`,
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
      data.price_rule.discount_codes = discountData.discount_codes || []
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error al obtener regla de precio ${params.id}:`, error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
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
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    const id = params.id
    const body = await request.json()

    // Validar datos mínimos
    if (!body.discount_code && !body.price_rule) {
      return NextResponse.json({ error: "Se requiere un objeto discount_code o price_rule" }, { status: 400 })
    }

    // Actualizar la regla de precio si se proporciona
    let priceRuleData = null
    if (body.price_rule) {
      const priceRuleResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules/${id}.json`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ price_rule: body.price_rule }),
      })

      if (!priceRuleResponse.ok) {
        const errorText = await priceRuleResponse.text()
        console.error(`Error al actualizar regla de precio (${priceRuleResponse.status}): ${errorText}`)
        return NextResponse.json(
          { error: `Error al actualizar regla de precio: ${priceRuleResponse.status} ${priceRuleResponse.statusText}` },
          { status: priceRuleResponse.status },
        )
      }

      priceRuleData = await priceRuleResponse.json()
    }

    // Actualizar el código de descuento si se proporciona
    let discountCodeData = null
    if (body.discount_code && body.discount_code.id) {
      const discountCodeResponse = await fetch(
        `https://${shopDomain}/admin/api/2023-10/price_rules/${id}/discount_codes/${body.discount_code.id}.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ discount_code: body.discount_code }),
        },
      )

      if (!discountCodeResponse.ok) {
        const errorText = await discountCodeResponse.text()
        console.error(`Error al actualizar código de descuento (${discountCodeResponse.status}): ${errorText}`)
        return NextResponse.json(
          {
            error: `Error al actualizar código de descuento: ${discountCodeResponse.status} ${discountCodeResponse.statusText}`,
          },
          { status: discountCodeResponse.status },
        )
      }

      discountCodeData = await discountCodeResponse.json()
    }

    return NextResponse.json({
      price_rule: priceRuleData?.price_rule || null,
      discount_code: discountCodeData?.discount_code || null,
    })
  } catch (error) {
    console.error(`Error al actualizar regla de precio ${params.id}:`, error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
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
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    const id = params.id

    // Eliminar la regla de precio (esto también eliminará los códigos de descuento asociados)
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/price_rules/${id}.json`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error al eliminar regla de precio (${response.status}): ${errorText}`)
      return NextResponse.json(
        { error: `Error al eliminar regla de precio: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error(`Error al eliminar regla de precio ${params.id}:`, error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
      { status: 500 },
    )
  }
}
