import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID de la colección" }, { status: 400 })
    }

    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    // Consulta GraphQL para obtener los productos de la colección
    const query = gql`
      query GetCollectionProducts($id: ID!) {
        collection(id: $id) {
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                }
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                status
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { id: formattedId })

    return NextResponse.json({
      success: true,
      products: data.collection.products.edges.map((edge: any) => edge.node),
    })
  } catch (error) {
    console.error("Error al obtener productos de la colección:", error)
    return NextResponse.json({ error: `Error al obtener productos: ${(error as Error).message}` }, { status: 500 })
  }
}
