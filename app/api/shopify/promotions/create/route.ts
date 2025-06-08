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
    console.log(`🆕 Creando promoción en Shopify:`, data)

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
                  customerGets {
                    value {
                      ... on DiscountPercentage {
                        percentage
                      }
                      ... on DiscountAmount {
                        amount {
                          amount
                          currencyCode
                        }
                      }
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
          startsAt: data.fechaInicio,
          endsAt: data.fechaFin,
          customerGets: {
            value:
              data.tipo === "PERCENTAGE_DISCOUNT"
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
                  startsAt
                  endsAt
                  customerGets {
                    value {
                      ... on DiscountPercentage {
                        percentage
                      }
                      ... on DiscountAmount {
                        amount {
                          amount
                          currencyCode
                        }
                      }
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
        automaticBasicDiscount: {
          title: data.titulo,
          startsAt: data.fechaInicio,
          endsAt: data.fechaFin,
          customerGets: {
            value:
              data.tipo === "PERCENTAGE_DISCOUNT"
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
          minimumRequirement: data.compraMinima
            ? {
                greaterThanOrEqualToSubtotal: {
                  amount: Number.parseFloat(data.compraMinima).toString(),
                  currencyCode: "EUR",
                },
              }
            : null,
        },
      }
    }

    console.log(`🔄 Enviando mutación de creación a Shopify:`, {
      mutation: mutation.substring(0, 100) + "...",
      variables,
    })

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
    const discount = createdNode.codeDiscount || createdNode.automaticDiscount

    console.log(`✅ Promoción creada en Shopify exitosamente:`, createdNode)

    const promocion = {
      id: createdNode.id,
      shopify_id: createdNode.id,
      titulo: discount.title,
      descripcion: data.descripcion || "",
      tipo: data.tipo,
      valor: Number.parseFloat(data.valor),
      codigo: discount.codes?.nodes?.[0]?.code || null,
      fechaInicio: discount.startsAt,
      fechaFin: discount.endsAt,
      activa: discount.status === "ACTIVE",
      estado: discount.status,
    }

    return NextResponse.json({
      success: true,
      promocion,
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
