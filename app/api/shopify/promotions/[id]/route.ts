import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    console.log(`🔍 Obteniendo promoción de Shopify: ${id}`)

    // Formatear el ID de Shopify
    let shopifyId = id
    if (!id.startsWith("gid://")) {
      shopifyId = `gid://shopify/DiscountAutomaticNode/${id}`
    }

    const query = `
      query getDiscount($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            ... on DiscountAutomaticBasic {
              title
              status
              startsAt
              endsAt
              summary
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
              minimumRequirement {
                ... on DiscountMinimumSubtotal {
                  greaterThanOrEqualToSubtotal {
                    amount
                    currencyCode
                  }
                }
              }
            }
            ... on DiscountCodeBasic {
              title
              status
              startsAt
              endsAt
              summary
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
      }
    `

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
          query,
          variables: { id: shopifyId },
        }),
      },
    )

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
    }

    if (!data.data.discountNode) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    const discount = data.data.discountNode.discount
    const promocion = {
      id: data.data.discountNode.id,
      shopify_id: data.data.discountNode.id,
      titulo: discount.title,
      descripcion: discount.summary || "",
      tipo: discount.customerGets?.value?.percentage ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT",
      valor:
        discount.customerGets?.value?.percentage ||
        Number.parseFloat(discount.customerGets?.value?.amount?.amount || "0"),
      codigo: discount.codes?.nodes?.[0]?.code || null,
      fechaInicio: discount.startsAt,
      fechaFin: discount.endsAt,
      activa: discount.status === "ACTIVE",
      estado: discount.status,
    }

    console.log(`✅ Promoción encontrada en Shopify:`, promocion)

    return NextResponse.json({
      success: true,
      promocion,
    })
  } catch (error) {
    console.error("❌ Error obteniendo promoción de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promoción",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    console.log(`📝 Actualizando promoción en Shopify ${id}:`, data)

    // Formatear el ID de Shopify
    let shopifyId = id
    if (!id.startsWith("gid://")) {
      shopifyId = `gid://shopify/DiscountAutomaticNode/${id}`
    }

    // Determinar si es un descuento automático o con código
    const isCodeDiscount = data.codigo && data.codigo.trim() !== ""

    let mutation: string
    let variables: any

    if (isCodeDiscount) {
      // Actualizar descuento con código
      mutation = `
        mutation discountCodeBasicUpdate($basicCodeDiscount: DiscountCodeBasicInput!, $id: ID!) {
          discountCodeBasicUpdate(basicCodeDiscount: $basicCodeDiscount, id: $id) {
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
        id: shopifyId.replace("DiscountAutomaticNode", "DiscountCodeNode"),
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
    } else {
      // Actualizar descuento automático
      mutation = `
        mutation discountAutomaticBasicUpdate($automaticBasicDiscount: DiscountAutomaticBasicInput!, $id: ID!) {
          discountAutomaticBasicUpdate(automaticBasicDiscount: $automaticBasicDiscount, id: $id) {
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
        id: shopifyId,
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

    console.log(`🔄 Enviando mutación a Shopify:`, { mutation, variables })

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

    console.log(`📥 Respuesta de Shopify:`, result)

    if (result.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    const updateResult = isCodeDiscount ? result.data.discountCodeBasicUpdate : result.data.discountAutomaticBasicUpdate

    if (updateResult.userErrors && updateResult.userErrors.length > 0) {
      throw new Error(`Shopify user errors: ${JSON.stringify(updateResult.userErrors)}`)
    }

    const updatedNode = isCodeDiscount ? updateResult.codeDiscountNode : updateResult.automaticDiscountNode

    console.log(`✅ Promoción actualizada en Shopify exitosamente:`, updatedNode)

    return NextResponse.json({
      success: true,
      promocion: {
        id: updatedNode.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        valor: Number.parseFloat(data.valor),
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        activa: true,
      },
    })
  } catch (error) {
    console.error("❌ Error actualizando promoción en Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar promoción en Shopify",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    console.log(`🗑️ Eliminando promoción de Shopify: ${id}`)

    // Formatear el ID de Shopify
    let shopifyId = id
    if (!id.startsWith("gid://")) {
      shopifyId = `gid://shopify/DiscountNode/${id}`
    }

    const mutation = `
      mutation discountDelete($id: ID!) {
        discountDelete(id: $id) {
          deletedDiscountId
          userErrors {
            field
            message
          }
        }
      }
    `

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
          variables: { id: shopifyId },
        }),
      },
    )

    const result = await response.json()

    if (result.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    if (result.data.discountDelete.userErrors.length > 0) {
      throw new Error(`Shopify user errors: ${JSON.stringify(result.data.discountDelete.userErrors)}`)
    }

    console.log(`✅ Promoción eliminada de Shopify exitosamente`)

    return NextResponse.json({
      success: true,
      deletedId: result.data.discountDelete.deletedDiscountId,
    })
  } catch (error) {
    console.error("❌ Error eliminando promoción de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar promoción de Shopify",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
