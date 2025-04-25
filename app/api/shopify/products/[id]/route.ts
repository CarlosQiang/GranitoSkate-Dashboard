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
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          descriptionHtml
          status
          productType
          vendor
          tags
          options {
            id
            name
            values
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                price
                compareAtPrice
                inventoryQuantity
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          seo {
            title
            description
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
    `

    const variables = {
      id: `gid://shopify/Product/${id}`,
    }

    const response = await shopifyClient.request(query, variables)

    return NextResponse.json(response.product)
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
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
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
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
        id: `gid://shopify/Product/${id}`,
        title: data.title,
        descriptionHtml: data.description,
        status: data.status,
        productType: data.productType,
        vendor: data.vendor,
        tags: data.tags,
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description?.substring(0, 160) || "",
        },
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.productUpdate.userErrors.length > 0) {
      return NextResponse.json({ errors: response.productUpdate.userErrors }, { status: 400 })
    }

    return NextResponse.json(response.productUpdate.product)
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
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
      mutation productDelete($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: `gid://shopify/Product/${id}`,
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.productDelete.userErrors.length > 0) {
      return NextResponse.json({ errors: response.productDelete.userErrors }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: response.productDelete.deletedProductId })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
