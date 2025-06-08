import { type NextRequest, NextResponse } from "next/server"
import { gql } from "graphql-request"
import shopifyClient from "@/lib/shopify"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Obteniendo colecciones de Shopify")

    const query = gql`
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              productsCount
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { first: 50 })

    const collections = data.collections.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      productsCount: edge.node.productsCount,
    }))

    console.log(`✅ Colecciones obtenidas: ${collections.length}`)

    return NextResponse.json({
      success: true,
      collections,
    })
  } catch (error) {
    console.error("❌ Error obteniendo colecciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener colecciones",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
