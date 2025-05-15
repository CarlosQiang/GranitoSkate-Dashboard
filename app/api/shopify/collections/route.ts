import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todas las colecciones directamente
async function getShopifyCollections() {
  try {
    const query = gql`
      query {
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              productsCount
              image {
                url
                altText
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.collections.edges.map((edge) => ({
      ...edge.node,
      productsCount: edge.node.productsCount || 0,
    }))
  } catch (error) {
    console.error("Error fetching collections from Shopify:", error)
    throw error
  }
}

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const collections = await getShopifyCollections()
    return NextResponse.json(collections)
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    return NextResponse.json(
      { error: `Error al obtener colecciones: ${error.message || "Error desconocido"}` },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    const mutation = gql`
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
            title
            handle
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
        title: data.title,
        descriptionHtml: data.description,
        image: data.image ? { src: data.image } : null,
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description,
        },
      },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.collectionCreate.userErrors.length > 0) {
      return NextResponse.json({ error: result.collectionCreate.userErrors[0].message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      collection: result.collectionCreate.collection,
    })
  } catch (error) {
    console.error("Error al crear colección:", error)
    return NextResponse.json(
      { error: `Error al crear colección: ${error.message || "Error desconocido"}` },
      { status: 500 },
    )
  }
}
