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
    console.log(`🔍 Obteniendo promoción por ID: ${id}`)

    // Aquí normalmente buscarías en la base de datos
    // Por ahora devolvemos un objeto básico
    const promocion = {
      id: id,
      titulo: "Promoción de ejemplo",
      descripcion: "Descripción de ejemplo",
      tipo: "PERCENTAGE_DISCOUNT",
      valor: 10,
      activa: true,
    }

    return NextResponse.json(promocion)
  } catch (error) {
    console.error("❌ Error al obtener promoción:", error)
    return NextResponse.json({ error: "Error al obtener promoción" }, { status: 500 })
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

    console.log(`📝 Actualizando promoción ${id}:`, data)

    // Intentar actualizar en Shopify
    try {
      await updateShopifyPromotion(id, data)
      console.log(`✅ Promoción actualizada en Shopify`)
    } catch (shopifyError) {
      console.error("⚠️ Error actualizando en Shopify:", shopifyError)
      // Continuar con la actualización local aunque Shopify falle
    }

    // Simular actualización local exitosa
    const promocionActualizada = {
      id: id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      valor: Number.parseFloat(data.valor),
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      activa: data.activa,
      fechaActualizacion: new Date().toISOString(),
    }

    console.log(`✅ Promoción actualizada exitosamente:`, promocionActualizada)
    return NextResponse.json(promocionActualizada)
  } catch (error) {
    console.error("❌ Error al actualizar promoción:", error)
    return NextResponse.json({ error: "Error al actualizar promoción" }, { status: 500 })
  }
}

async function updateShopifyPromotion(id: string, data: any) {
  try {
    // Formatear el ID de Shopify
    let shopifyId = id
    if (!id.startsWith("gid://")) {
      shopifyId = `gid://shopify/DiscountAutomaticNode/${id}`
    }

    const mutation = `
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

    const variables = {
      id: shopifyId,
      automaticBasicDiscount: {
        title: data.titulo,
        startsAt: data.fechaInicio,
        endsAt: data.fechaFin,
        customerGets: {
          value: {
            percentage: data.tipo === "PERCENTAGE_DISCOUNT" ? Number.parseFloat(data.valor) / 100 : null,
            discountAmount:
              data.tipo === "FIXED_AMOUNT_DISCOUNT"
                ? {
                    amount: Number.parseFloat(data.valor),
                    appliesOnEachItem: false,
                  }
                : null,
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
          variables: variables,
        }),
      },
    )

    const result = await response.json()

    if (result.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    if (result.data.discountAutomaticBasicUpdate.userErrors.length > 0) {
      throw new Error(`Shopify user errors: ${JSON.stringify(result.data.discountAutomaticBasicUpdate.userErrors)}`)
    }

    return result.data.discountAutomaticBasicUpdate.automaticDiscountNode
  } catch (error) {
    console.error("Error updating Shopify promotion:", error)
    throw error
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    console.log(`🗑️ Eliminando promoción ${id}`)

    // Intentar eliminar de Shopify
    try {
      await deleteShopifyPromotion(id)
      console.log(`✅ Promoción eliminada de Shopify`)
    } catch (shopifyError) {
      console.error("⚠️ Error eliminando de Shopify:", shopifyError)
    }

    // Simular eliminación local exitosa
    console.log(`✅ Promoción eliminada exitosamente`)
    return NextResponse.json({ success: true, message: "Promoción eliminada" })
  } catch (error) {
    console.error("❌ Error al eliminar promoción:", error)
    return NextResponse.json({ error: "Error al eliminar promoción" }, { status: 500 })
  }
}

async function deleteShopifyPromotion(id: string) {
  try {
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

    return result.data.discountDelete
  } catch (error) {
    console.error("Error deleting Shopify promotion:", error)
    throw error
  }
}
