import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    console.log(`📝 Creando promoción en Shopify:`, data)

    // Validar datos requeridos
    if (!data.titulo || !data.valor) {
      return NextResponse.json(
        {
          success: false,
          error: "Título y valor son requeridos",
        },
        { status: 400 },
      )
    }

    // Determinar si es un descuento automático o con código
    const isCodeDiscount = data.codigo && data.codigo.trim() !== ""

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
          endsAt: data.fechaFin,
          customerGets: {
            value:
              data.tipo === "PERCENTAGE_DISCOUNT" || data.tipo === "PORCENTAJE_DESCUENTO"
                ? { percentage: Number.parseFloat(data.valor) / 100 }
                : {
                    discountAmount: {
                      amount: Number.parseFloat(data.valor).toString(),
                      appliesOnEachItem: false,
                    },
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
          endsAt: data.fechaFin,
          customerGets: {
            value:
              data.tipo === "PERCENTAGE_DISCOUNT" || data.tipo === "PORCENTAJE_DESCUENTO"
                ? { percentage: Number.parseFloat(data.valor) / 100 }
                : {
                    discountAmount: {
                      amount: Number.parseFloat(data.valor).toString(),
                      appliesOnEachItem: false,
                    },
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

    console.log(`🔄 Enviando mutación a Shopify:`, {
      mutation: mutation.substring(0, 100) + "...",
      variables,
    })

    // Verificar que tenemos las credenciales de Shopify
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error("Credenciales de Shopify no configuradas")
    }

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`)
    }

    const result = await response.json()
    console.log(`📥 Respuesta de Shopify:`, result)

    if (result.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    const createResult = isCodeDiscount ? result.data.discountCodeBasicCreate : result.data.discountAutomaticBasicCreate

    if (createResult.userErrors && createResult.userErrors.length > 0) {
      throw new Error(`Shopify user errors: ${JSON.stringify(createResult.userErrors)}`)
    }

    const createdNode = isCodeDiscount ? createResult.codeDiscountNode : createResult.automaticDiscountNode

    if (!createdNode) {
      throw new Error("No se pudo crear el descuento en Shopify")
    }

    console.log(`✅ Promoción creada en Shopify exitosamente:`, createdNode)

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
    })
  } catch (error) {
    console.error("❌ Error creando promoción en Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear promoción en Shopify",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
