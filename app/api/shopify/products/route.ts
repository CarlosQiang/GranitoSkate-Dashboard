import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "10"
    const cursor = searchParams.get("cursor") || null
    const query = searchParams.get("query") || ""

    // Construir la consulta GraphQL
    const graphqlQuery = `
      query GetProducts($limit: Int!, $cursor: String, $query: String) {
        products(first: $limit, after: $cursor, query: $query, sortKey: CREATED_AT, reverse: true) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              createdAt
              updatedAt
              status
              totalInventory
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      limit: Number.parseInt(limit),
      cursor: cursor,
      query: query,
    }

    const { data, errors } = await shopifyFetch({
      query: graphqlQuery,
      variables,
    })

    if (errors) {
      console.error("Error al obtener productos de Shopify:", errors)
      return NextResponse.json(
        {
          success: false,
          message: "Error al obtener productos",
          errors,
        },
        { status: 200 }, // Usamos 200 incluso para errores para evitar problemas en cascada
      )
    }

    // Transformar la respuesta para que sea más fácil de usar
    const products = data.products.edges.map((edge) => {
      const product = edge.node
      const image = product.images.edges.length > 0 ? product.images.edges[0].node.url : null

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        status: product.status,
        totalInventory: product.totalInventory,
        price: product.priceRangeV2.minVariantPrice.amount,
        currency: product.priceRangeV2.minVariantPrice.currencyCode,
        image: image,
      }
    })

    return NextResponse.json({
      success: true,
      products,
      pageInfo: data.products.pageInfo,
    })
  } catch (error) {
    console.error("Error en la API de productos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar la solicitud de productos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 200 }, // Usamos 200 incluso para errores para evitar problemas en cascada
    )
  }
}
