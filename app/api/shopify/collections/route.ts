import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { shopifyFetch } from "@/lib/shopify-client"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "10")
    const cursor = searchParams.get("cursor")
    const query = searchParams.get("query")

    // Construir la consulta GraphQL
    const graphqlQuery = `
      query getCollections($limit: Int!, $cursor: String, $query: String) {
        collections(first: $limit, after: $cursor, query: $query) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              description
              handle
              productsCount
              image {
                url
                altText
              }
              ruleSet {
                rules {
                  column
                  relation
                  condition
                }
              }
              products(first: 5) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: {
        limit,
        cursor,
        query,
      },
    })

    // Extraer las colecciones de la respuesta
    const collections = response.data.collections.edges.map((edge) => edge.node)
    const pageInfo = response.data.collections.pageInfo

    return NextResponse.json({
      success: true,
      collections,
      pageInfo,
    })
  } catch (error) {
    console.error("Error al obtener colecciones de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al obtener colecciones",
      },
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

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json()

    // Construir la consulta GraphQL para crear una colección
    const graphqlQuery = `
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

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({
      query: graphqlQuery,
      variables: {
        input: body,
      },
    })

    // Verificar si hay errores
    if (response.data.collectionCreate.userErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors: response.data.collectionCreate.userErrors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      collection: response.data.collectionCreate.collection,
    })
  } catch (error) {
    console.error("Error al crear colección en Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al crear colección",
      },
      { status: 500 },
    )
  }
}
