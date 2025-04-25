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
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
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
              status
              totalInventory
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
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
              updatedAt
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
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const data = await req.json()

    const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
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
        status: data.status || "ACTIVE",
        productType: data.productType || "",
        vendor: data.vendor || "",
        tags: data.tags || [],
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description?.substring(0, 160) || "",
        },
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.productCreate.userErrors.length > 0) {
      return NextResponse.json({ errors: response.productCreate.userErrors }, { status: 400 })
    }

    return NextResponse.json(response.productCreate.product)
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
