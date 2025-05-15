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
      query GetCollectionProducts($collectionId: ID!) {
        collection(id: $collectionId) {
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
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
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { collectionId: formattedId })
    return NextResponse.json(data.collection.products)
  } catch (error) {
    console.error(`Error fetching products for collection ${params.id}:`, error)
    return NextResponse.json(
      { error: `Error al cargar los productos de la colección: ${error.message || "Error desconocido"}` },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`
    const data = await request.json()
    const productIds = Array.isArray(data.productIds) ? data.productIds : [data.productId]

    // Formateamos los IDs de los productos correctamente
    const formattedProductIds = productIds.map((id) => {
      if (typeof id === "string" && id.includes("gid://shopify/Product/")) {
        return id
      }
      return `gid://shopify/Product/${id.toString().replace(/\D/g, "")}`
    })

    const mutation = gql`
      mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: formattedId,
      productIds: formattedProductIds,
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.collectionAddProducts.userErrors && result.collectionAddProducts.userErrors.length > 0) {
      return NextResponse.json({ error: result.collectionAddProducts.userErrors[0].message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      collection: result.collectionAddProducts.collection,
    })
  } catch (error) {
    console.error(`Error adding products to collection ${params.id}:`, error)
    return NextResponse.json(
      { error: `Error al añadir productos a la colección: ${error.message || "Error desconocido"}` },
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
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    let productIds = []

    // Si hay un productId en la URL, lo usamos
    if (productId) {
      const formattedProductId = productId.includes("gid://shopify/Product/")
        ? productId
        : `gid://shopify/Product/${productId.replace(/\D/g, "")}`
      productIds = [formattedProductId]
    } else {
      // Si no, intentamos obtener los productIds del cuerpo de la solicitud
      try {
        const data = await request.json()
        productIds = Array.isArray(data.productIds) ? data.productIds : [data.productId]

        // Formateamos los IDs de los productos correctamente
        productIds = productIds.map((id) => {
          if (typeof id === "string" && id.includes("gid://shopify/Product/")) {
            return id
          }
          return `gid://shopify/Product/${id.toString().replace(/\D/g, "")}`
        })
      } catch (e) {
        return NextResponse.json({ error: "Se requiere productId o productIds" }, { status: 400 })
      }
    }

    const mutation = gql`
      mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
          job {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: formattedId,
      productIds: productIds,
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.collectionRemoveProducts.userErrors && result.collectionRemoveProducts.userErrors.length > 0) {
      return NextResponse.json({ error: result.collectionRemoveProducts.userErrors[0].message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Productos eliminados de la colección correctamente",
    })
  } catch (error) {
    console.error(`Error removing products from collection ${params.id}:`, error)
    return NextResponse.json(
      { error: `Error al eliminar productos de la colección: ${error.message || "Error desconocido"}` },
      { status: 500 },
    )
  }
}
