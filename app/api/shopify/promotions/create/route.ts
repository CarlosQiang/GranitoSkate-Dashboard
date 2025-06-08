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
    console.log(`📝 Creando nueva promoción en Shopify:`, data)

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
        basicCodeDiscount: {
          title: data.titulo,
          code: data.codigo,
          startsAt: data.fechaInicio,
          endsAt: data.fechaFin,
          customerGets: {
            value:
              data.tipo === "PORCENTAJE_DESCUENTO"
                ? { percentage: Number.parseFloat(data.valor) / 100 }
                : {
                    discountAmount: {
                      amount: Number.parseFloat(data.valor),
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
          usageLimit: data.limitarUsos ? Number.parseInt(data.limiteUsos) : null,
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
          startsAt: data.fechaInicio,
          endsAt: data.fechaFin,
          customerGets: {
            value:
              data.tipo === "PORCENTAJE_DESCUENTO"
                ? { percentage: Number.parseFloat(data.valor) / 100 }
                : {
                    discountAmount: {
                      amount: Number.parseFloat(data.valor),
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

    // Agregar compra mínima si se especifica
    if (data.compraMinima && Number.parseFloat(data.compraMinima) > 0) {
      const minimumRequirement = {
        greaterThanOrEqualToSubtotal: {
          amount: Number.parseFloat(data.compraMinima),
          currencyCode: "EUR",
        },
      }

      if (isCodeDiscount) {
        variables.basicCodeDiscount.minimumRequirement = minimumRequirement
      } else {
        variables.automaticBasicDiscount.minimumRequirement = minimumRequirement
      }
    }

    console.log(`🔄 Enviando mutación de creación a Shopify:`, { mutation, variables })

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`,
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

    const result = await response.json()

    console.log(`📥 Respuesta de creación de Shopify:`, result)

    if (result.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    const createResult = isCodeDiscount ? result.data.discountCodeBasicCreate : result.data.discountAutomaticBasicCreate

    if (createResult.userErrors && createResult.userErrors.length > 0) {
      throw new Error(`Shopify user errors: ${JSON.stringify(createResult.userErrors)}`)
    }

    const createdNode = isCodeDiscount ? createResult.codeDiscountNode : createResult.automaticDiscountNode

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
        codigo: data.codigo,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
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
