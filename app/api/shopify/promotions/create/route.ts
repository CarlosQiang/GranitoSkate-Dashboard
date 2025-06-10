import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log(`📝 [SHOPIFY CREATE] Datos recibidos:`, data)

    // Validar datos requeridos
    if (!data.titulo || !data.valor) {
      console.error("❌ [SHOPIFY CREATE] Datos faltantes:", { titulo: data.titulo, valor: data.valor })
      return NextResponse.json(
        {
          success: false,
          error: "Título y valor son requeridos",
        },
        { status: 400 },
      )
    }

    // Verificar credenciales
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ [SHOPIFY CREATE] Credenciales faltantes")
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales de Shopify no configuradas",
          details: {
            shop_domain: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
            access_token: !!process.env.SHOPIFY_ACCESS_TOKEN,
          },
        },
        { status: 500 },
      )
    }

    // Determinar si es un descuento automático o con código
    const isCodeDiscount = data.codigo && data.codigo.trim() !== ""
    console.log(`🔍 [SHOPIFY CREATE] Tipo de descuento:`, isCodeDiscount ? "Con código" : "Automático")

    let mutation: string
    let variables: any

    if (isCodeDiscount) {
      // Crear descuento con código
      mutation = `
        mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
                  status
                  codes(first: 1) {
                    nodes {
                      code
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      variables = {
        basicCodeDiscount: {
          title: data.titulo,
          code: data.codigo,
          startsAt: data.fechaInicio || new Date().toISOString(),
          endsAt: data.fechaFin || null,
          customerGets: {
            value: {
              percentage: Number.parseFloat(data.valor) / 100,
            },
            items: {
              all: true,
            },
          },
          customerSelection: {
            all: true,
          },
          usageLimit: data.limiteUsos ? Number.parseInt(data.limiteUsos) : null,
        },
      }
    } else {
      // Crear descuento automático
      mutation = `
        mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
          discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
            automaticDiscountNode {
              id
              automaticDiscount {
                ... on DiscountAutomaticBasic {
                  title
                  status
                  summary
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      variables = {
        automaticBasicDiscount: {
          title: data.titulo,
          startsAt: data.fechaInicio || new Date().toISOString(),
          endsAt: data.fechaFin || null,
          customerGets: {
            value: {
              percentage: Number.parseFloat(data.valor) / 100,
            },
            items: {
              all: true,
            },
          },
          customerSelection: {
            all: true,
          },
        },
      }
    }

    console.log(`🔄 [SHOPIFY CREATE] Variables preparadas:`, JSON.stringify(variables, null, 2))

    const shopifyUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`
    console.log(`🔗 [SHOPIFY CREATE] URL:`, shopifyUrl)

    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    })

    console.log(`📥 [SHOPIFY CREATE] Respuesta HTTP:`, response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [SHOPIFY CREATE] Error HTTP:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `HTTP Error: ${response.status} - ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const result = await response.json()
    console.log(`📊 [SHOPIFY CREATE] Resultado completo:`, JSON.stringify(result, null, 2))

    if (result.errors) {
      console.error("❌ [SHOPIFY CREATE] Errores GraphQL:", result.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Errores GraphQL",
          details: result.errors,
        },
        { status: 400 },
      )
    }

    const createResult = isCodeDiscount
      ? result.data?.discountCodeBasicCreate
      : result.data?.discountAutomaticBasicCreate

    if (!createResult) {
      console.error("❌ [SHOPIFY CREATE] No se recibió resultado de creación")
      return NextResponse.json(
        {
          success: false,
          error: "No se recibió resultado de la creación",
          details: result,
        },
        { status: 500 },
      )
    }

    if (createResult.userErrors && createResult.userErrors.length > 0) {
      console.error("❌ [SHOPIFY CREATE] Errores de usuario:", createResult.userErrors)
      return NextResponse.json(
        {
          success: false,
          error: "Errores de validación",
          details: createResult.userErrors,
        },
        { status: 400 },
      )
    }

    const createdNode = isCodeDiscount ? createResult.codeDiscountNode : createResult.automaticDiscountNode

    if (!createdNode) {
      console.error("❌ [SHOPIFY CREATE] No se creó el nodo de descuento")
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo crear el descuento",
          details: createResult,
        },
        { status: 500 },
      )
    }

    console.log(`✅ [SHOPIFY CREATE] Promoción creada exitosamente:`, createdNode.id)

    return NextResponse.json({
      success: true,
      promocion: {
        id: createdNode.id,
        shopify_id: createdNode.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        valor: Number.parseFloat(data.valor),
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        codigo: data.codigo,
        activa: true,
      },
      debug: {
        isCodeDiscount,
        variables,
        createResult,
      },
    })
  } catch (error) {
    console.error("❌ [SHOPIFY CREATE] Error completo:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
