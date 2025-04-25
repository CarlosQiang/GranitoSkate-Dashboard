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
    const query = `
      query getShopStats {
        products(first: 1) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
          }
        }
        productsCount
        collections(first: 1) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
          }
        }
        collectionsCount
        customers(first: 1) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
          }
        }
        customersCount
        orders(first: 1) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
          }
        }
        ordersCount
      }
    `

    const response = await shopifyClient.request(query)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
