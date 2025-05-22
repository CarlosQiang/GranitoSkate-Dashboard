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
      query getProducts($limit: Int!, $cursor: String, $query: String) {
        products(first: $limit, after: $cursor, query: $query) {
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
              productType
              vendor
              status
              publishedAt
              tags
              featuredImage {
                url
                altText
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    weight
                    weightUnit
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

    // Extraer los productos de la respuesta
    const products = response.data.products.edges.map((edge) => edge.node)
    const pageInfo = response.data.products.pageInfo

    return NextResponse.json({
      success: true,
      products,
      pageInfo,
    })
  } catch (error) {
    console.error("Error al obtener productos de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al obtener productos",
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

    // Construir la consulta GraphQL para crear un producto
    const graphqlQuery = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
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
    if (response.data.productCreate.userErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors: response.data.productCreate.userErrors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      product: response.data.productCreate.product,
    })
  } catch (error) {
    console.error("Error al crear producto en Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al crear producto",
      },
      { status: 500 },
    )
  }
}
