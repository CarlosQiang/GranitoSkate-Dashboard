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
      query getCollections($first: Int!, $after: String) {
        collections(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              productsCount
              image {
                url
                altText
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
    console.error("Error al obtener colecciones:", error)
    return NextResponse.json({ error: "Error al obtener colecciones" }, { status: 500 })
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
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
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
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description?.substring(0, 160) || "",
        },
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.collectionCreate.userErrors.length > 0) {
      return NextResponse.json({ errors: response.collectionCreate.userErrors }, { status: 400 })
    }

    return NextResponse.json(response.collectionCreate.collection)
  } catch (error) {
    console.error("Error al crear colección:", error)
    return NextResponse.json({ error: "Error al crear colección" }, { status: 500 })
  }
}
