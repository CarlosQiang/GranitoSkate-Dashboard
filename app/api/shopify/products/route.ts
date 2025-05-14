import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "20"
    const cursor = searchParams.get("cursor") || null
    const query = searchParams.get("query") || null

    // Consulta GraphQL para obtener productos
    const graphqlQuery = `
      query GetProducts($limit: Int!, $cursor: String, $query: String) {
        products(first: $limit, after: $cursor, query: $query) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              productType
              vendor
              tags
              status
              createdAt
              updatedAt
              publishedAt
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                    altText
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
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `

    const variables = {
      limit: Number.parseInt(limit),
      cursor: cursor,
      query: query,
    }

    const response = await shopifyFetch({ query: graphqlQuery, variables })

    if (response.errors) {
      console.error("Error al obtener productos de Shopify:", response.errors)
      return NextResponse.json(
        {
          error: "Error al obtener productos",
          details: response.errors,
        },
        { status: 500 },
      )
    }

    // Transformar la respuesta para un formato más sencillo
    const products = response.data.products.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      descriptionHtml: edge.node.descriptionHtml,
      productType: edge.node.productType,
      vendor: edge.node.vendor,
      tags: edge.node.tags,
      status: edge.node.status,
      createdAt: edge.node.createdAt,
      updatedAt: edge.node.updatedAt,
      publishedAt: edge.node.publishedAt,
      image: edge.node.images.edges.length > 0 ? edge.node.images.edges[0].node : null,
      variants: edge.node.variants.edges.map((variantEdge) => variantEdge.node),
      cursor: edge.cursor,
    }))

    return NextResponse.json({
      products,
      pageInfo: response.data.products.pageInfo,
      success: true,
    })
  } catch (error) {
    console.error("Error al procesar la solicitud de productos:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
