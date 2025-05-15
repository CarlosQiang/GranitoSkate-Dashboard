import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    const query = gql`
      query GetCollection($id: ID!) {
        collection(id: $id) {
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
          products(first: 10) {
            edges {
              node {
                id
                title
                handle
                status
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { id: formattedId })

    return NextResponse.json({
      ...data.collection,
      productsCount: data.collection.productsCount || 0,
    })
  } catch (error) {
    console.error(`Error fetching collection with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: `Error al cargar la colección: ${error.message || "Error desconocido"}` },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`
    const data = await request.json()

    const mutation = gql`
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
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
        id: formattedId,
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

    if (result.collectionUpdate.userErrors.length > 0) {
      return NextResponse.json({ error: result.collectionUpdate.userErrors[0].message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      collection: result.collectionUpdate.collection,
    })
  } catch (error) {
    console.error(`Error updating collection with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: `Error al actualizar la colección: ${error.message || "Error desconocido"}` },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    const mutation = gql`
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
        id: formattedId,
      },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.collectionDelete.userErrors.length > 0) {
      return NextResponse.json({ error: result.collectionDelete.userErrors[0].message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      deletedId: result.collectionDelete.deletedCollectionId,
    })
  } catch (error) {
    console.error(`Error deleting collection with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: `Error al eliminar la colección: ${error.message || "Error desconocido"}` },
      { status: 500 },
    )
  }
}
