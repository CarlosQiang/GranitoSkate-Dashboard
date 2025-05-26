import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET(request: Request) {
  try {
    // Obtener los parámetros de la solicitud
    const url = new URL(request.url)
    const limit = url.searchParams.get("limit") || "10"
    const cursor = url.searchParams.get("cursor") || null

    // Construir la consulta GraphQL
    const query = `
      query GetProducts($limit: Int!, $cursor: String) {
        products(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              title
              handle
              description
              descriptionHtml
              productType
              vendor
              status
              totalInventory
              createdAt
              updatedAt
              publishedAt
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    inventoryQuantity
                    sku
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
      query,
      variables: {
        limit: Number.parseInt(limit),
        cursor,
      },
    })

    // Verificar si hay errores
    if (response.errors) {
      console.error("Error al obtener productos de Shopify:", response.errors)
      return NextResponse.json(
        {
          success: false,
          errors: response.errors,
        },
        { status: 500 },
      )
    }

    // Devolver los productos
    return NextResponse.json({
      success: true,
      data: response.data,
    })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al obtener productos",
      },
      { status: 500 },
    )
  }
}
