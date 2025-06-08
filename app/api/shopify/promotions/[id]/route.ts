import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log(`🔍 GET Promoción: ${id}`)

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Variables de entorno faltantes")
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Formatear el ID de Shopify correctamente
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
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: { id: shopifyId },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      console.error("❌ GraphQL errors:", data.errors)
      return NextResponse.json({ error: "Error en GraphQL", details: data.errors }, { status: 400 })
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

    console.log(`✅ Promoción encontrada:`, promocion.titulo)

    return NextResponse.json({
      success: true,
      promocion,
    })
  } catch (error) {
    console.error("❌ Error en GET promoción:", error)
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
    const { id } = params
    console.log(`📝 PUT Promoción: ${id}`)

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Variables de entorno faltantes")
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    let data
    try {
      data = await request.json()
      console.log(`📊 Datos recibidos:`, data)
    } catch (parseError) {
      console.error("❌ Error parseando JSON:", parseError)
      return NextResponse.json({ error: "Datos JSON inválidos" }, { status: 400 })
    }

    // Formatear el ID de Shopify correctamente
    let shopifyId = id
    if (!id.startsWith("gid://")) {
      shopifyId = `gid://shopify/DiscountAutomaticNode/${id}`
    }

    console.log(`🔍 Shopify ID: ${shopifyId}`)

    // Paso 1: Obtener la promoción actual
    const getQuery = `
      query getDiscount($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            __typename
          }
        }
      }
    `

    console.log(`🔍 Obteniendo tipo de promoción...`)

    const getResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: getQuery,
          variables: { id: shopifyId },
        }),
      },
    )

    if (!getResponse.ok) {
      throw new Error(`HTTP error en GET! status: ${getResponse.status}`)
    }

    const getCurrentData = await getResponse.json()

    if (getCurrentData.errors) {
      console.error("❌ Errores obteniendo promoción actual:", getCurrentData.errors)
      return NextResponse.json({ error: "Error obteniendo promoción actual" }, { status: 400 })
    }

    const currentDiscount = getCurrentData.data?.discountNode?.discount
    if (!currentDiscount) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    const isAutomaticDiscount = currentDiscount.__typename === "DiscountAutomaticBasic"
    console.log(`🔍 Tipo detectado: ${currentDiscount.__typename}`)

    // Paso 2: Preparar la mutación
    if (!isAutomaticDiscount) {
      console.log("⚠️ Solo soportamos descuentos automáticos por ahora")
      return NextResponse.json({ error: "Tipo de descuento no soportado" }, { status: 400 })
    }

    // Paso 3: Ejecutar la mutación
    const mutation = `
      mutation discountAutomaticBasicUpdate($automaticBasicDiscount: DiscountAutomaticBasicInput!, $id: ID!) {
        discountAutomaticBasicUpdate(automaticBasicDiscount: $automaticBasicDiscount, id: $id) {
          automaticDiscountNode {
            id
            automaticDiscount {
              ... on DiscountAutomaticBasic {
                title
                status
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

    const percentage = data.tipo === "PERCENTAGE_DISCOUNT" ? Number.parseFloat(data.valor) / 100 : null
    const amount = data.tipo === "FIXED_AMOUNT_DISCOUNT" ? Number.parseFloat(data.valor) : null

    const variables = {
      id: shopifyId,
      automaticBasicDiscount: {
        title: data.titulo,
        startsAt: data.fechaInicio,
        endsAt: data.fechaFin,
        customerGets: {
          value: percentage
            ? { percentage }
            : {
                discountAmount: {
                  amount: amount?.toString() || "0",
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

    console.log(`🔄 Enviando mutación...`)
    console.log(`📊 Variables:`, JSON.stringify(variables, null, 2))

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error en mutación! status: ${response.status}`)
    }

    const result = await response.json()
    console.log(`📥 Respuesta de mutación:`, JSON.stringify(result, null, 2))

    if (result.errors) {
      console.error("❌ Errores de GraphQL:", result.errors)
      return NextResponse.json({ error: "Error en mutación GraphQL", details: result.errors }, { status: 400 })
    }

    const updateResult = result.data.discountAutomaticBasicUpdate

    if (updateResult.userErrors && updateResult.userErrors.length > 0) {
      console.error("❌ User errors:", updateResult.userErrors)
      return NextResponse.json({ error: "Errores de usuario", details: updateResult.userErrors }, { status: 400 })
    }

    const updatedNode = updateResult.automaticDiscountNode

    console.log(`✅ Promoción actualizada exitosamente: ${updatedNode.automaticDiscount.title}`)

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
        shopify_updated: true,
      },
    })
  } catch (error) {
    console.error("❌ Error completo en PUT:", error)
    console.error("❌ Stack trace:", (error as Error).stack)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log(`🗑️ DELETE Promoción: ${id}`)

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Variables de entorno faltantes")
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

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
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { id: shopifyId },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("❌ GraphQL errors:", result.errors)
      return NextResponse.json({ error: "Error en GraphQL", details: result.errors }, { status: 400 })
    }

    if (result.data.discountDelete.userErrors.length > 0) {
      console.error("❌ User errors:", result.data.discountDelete.userErrors)
      return NextResponse.json(
        { error: "Errores de usuario", details: result.data.discountDelete.userErrors },
        { status: 400 },
      )
    }

    console.log(`✅ Promoción eliminada exitosamente`)

    return NextResponse.json({
      success: true,
      deletedId: result.data.discountDelete.deletedDiscountId,
    })
  } catch (error) {
    console.error("❌ Error en DELETE:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar promoción",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
