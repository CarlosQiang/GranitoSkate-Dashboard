import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyClient } from "@/lib/shopify-client"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const id = params.id

    const query = `
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          customer {
            id
            firstName
            lastName
            email
            phone
          }
          shippingAddress {
            address1
            address2
            city
            province
            country
            zip
            name
            phone
          }
          billingAddress {
            address1
            address2
            city
            province
            country
            zip
            name
            phone
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                originalUnitPrice {
                  amount
                  currencyCode
                }
                discountedUnitPrice {
                  amount
                  currencyCode
                }
                variant {
                  id
                  title
                  sku
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
          totalPrice {
            amount
            currencyCode
          }
          subtotalPrice {
            amount
            currencyCode
          }
          totalShippingPrice {
            amount
            currencyCode
          }
          totalTax {
            amount
            currencyCode
          }
          processedAt
          fulfillmentStatus
          financialStatus
          note
          tags
          shippingLine {
            title
            price {
              amount
              currencyCode
            }
          }
        }
      }
    `

    const variables = {
      id: `gid://shopify/Order/${id}`,
    }

    const response = await shopifyClient.request(query, variables)

    return NextResponse.json(response.order)
  } catch (error) {
    console.error("Error al obtener pedido:", error)
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const id = params.id
    const data = await req.json()

    const mutation = `
      mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: `gid://shopify/Order/${id}`,
        tags: data.tags,
        note: data.note,
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.orderUpdate.userErrors.length > 0) {
      return NextResponse.json({ errors: response.orderUpdate.userErrors }, { status: 400 })
    }

    return NextResponse.json(response.orderUpdate.order)
  } catch (error) {
    console.error("Error al actualizar pedido:", error)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  }
}
