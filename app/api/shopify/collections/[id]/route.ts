import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyClient } from "@/lib/shopify-client"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const id = params.id

    const query = `
      query getCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          descriptionHtml
          productsCount
          image {
            id
            url
            altText
          }
          products(first: 20) {
            edges {
              node {
                id
                title
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
          seo {
            title
            description
          }
        }
      }
    `

    const variables = {
      id: `gid://shopify/Collection/${id}`,
    }

    const response = await shopifyClient.request(query, variables)

    return NextResponse.json(response.collection)
  } catch (error) {
    console.error("Error al obtener colección:", error)
    return NextResponse.json({ error: "Error al obtener colección" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const id = params.id
    const data = await req.json()

    const mutation = `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
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
        id: `gid://shopify/Collection/${id}`,
        title: data.title,
        descriptionHtml: data.description,
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description?.substring(0, 160) || "",
        },
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.collectionUpdate.userErrors.length > 0) {
      return NextResponse.json({ errors: response.collectionUpdate.userErrors }, { status: 400 })
    }

    return NextResponse.json(response.collectionUpdate.collection)
  } catch (error) {
    console.error("Error al actualizar colección:", error)
    return NextResponse.json({ error: "Error al actualizar colección" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const id = params.id

    const mutation = `
      mutation collectionDelete($input: CollectionDeleteInput!) {
        collectionDelete(input: $input) {
          deletedCollectionId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: `gid://shopify/Collection/${id}`,
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.collectionDelete.userErrors.length > 0) {
      return NextResponse.json({ errors: response.collectionDelete.userErrors }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: response.collectionDelete.deletedCollectionId })
  } catch (error) {
    console.error("Error al eliminar colección:", error)
    return NextResponse.json({ error: "Error al eliminar colección" }, { status: 500 })
  }
}
