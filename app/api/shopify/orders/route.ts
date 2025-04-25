import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyClient } from "@/lib/shopify-client"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const searchParams = req.nextUrl.searchParams
    const cursor = searchParams.get("cursor") || null
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const query = `
      query getOrders($first: Int!, $after: String) {
        orders(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              customer {
                id
                firstName
                lastName
                email
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
              processedAt
              fulfillmentStatus
              financialStatus
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      first: limit,
      after: cursor,
    }

    const response = await shopifyClient.request(query, variables)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
  }
}
