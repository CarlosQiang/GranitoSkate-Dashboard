import { type NextRequest, NextResponse } from "next/server"
import { createShopifyGid } from "@/lib/utils/shopify-id"

const SHOPIFY_SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Configuración de Shopify no encontrada" }, { status: 500 })
    }

    const { id } = params
    console.log(`🔍 Obteniendo promoción individual: ${id}`)

    // Crear el GID completo si es necesario
    const shopifyGid = id.startsWith("gid://") ? id : createShopifyGid(id, "DiscountAutomaticNode")
    console.log(`📋 GID a buscar: ${shopifyGid}`)

    const query = `
      query getDiscount($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            ... on DiscountAutomaticApp {
              title
              status
              startsAt
              endsAt
              appDiscountType {
                appKey
                functionId
              }
            }
            ... on DiscountAutomaticBasic {
              title
              status
              startsAt
              endsAt
              minimumRequirement {
                ... on DiscountMinimumQuantity {
                  greaterThanOrEqualToQuantity
                }
                ... on DiscountMinimumSubtotal {
                  greaterThanOrEqualToSubtotal {
                    amount
                    currencyCode
                  }
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
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                  ... on DiscountProducts {
                    products(first: 10) {
                      nodes {
                        id
                        title
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      nodes {
                        id
                        title
                      }
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
              codes(first: 1) {
                nodes {
                  code
                }
              }
              minimumRequirement {
                ... on DiscountMinimumQuantity {
                  greaterThanOrEqualToQuantity
                }
                ... on DiscountMinimumSubtotal {
                  greaterThanOrEqualToSubtotal {
                    amount
                    currencyCode
                  }
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
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                  ... on DiscountProducts {
                    products(first: 10) {
                      nodes {
                        id
                        title
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      nodes {
                        id
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch(`https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { id: shopifyGid },
      }),
    })

    if (!response.ok) {
      throw new Error(`Error de Shopify: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.errors) {
      console.error("❌ Errores de GraphQL:", data.errors)
      return NextResponse.json({ error: "Error en la consulta GraphQL", details: data.errors }, { status: 400 })
    }

    const discountNode = data.data?.discountNode
    if (!discountNode) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    // Procesar la promoción
    const discount = discountNode.discount
    const promocion = {
      id: discountNode.id,
      titulo: discount.title || "Sin título",
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
      montoMinimo: discount.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount || null,
      cantidadMinima: discount.minimumRequirement?.greaterThanOrEqualToQuantity || null,
    }

    console.log(`✅ Promoción encontrada: ${promocion.titulo}`)

    return NextResponse.json({
      success: true,
      promocion,
    })
  } catch (error) {
    console.error("❌ Error obteniendo promoción:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: (error as Error).message },
      { status: 500 },
    )
  }
}
