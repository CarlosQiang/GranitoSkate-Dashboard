import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Verificar configuración
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify no está configurado",
        },
        { status: 400 },
      )
    }

    // Construir el ID completo de Shopify
    const shopifyId = productId.startsWith("gid://") ? productId : `gid://shopify/Product/${productId}`

    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
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
          tags
          featuredImage {
            id
            url
            altText
            width
            height
          }
          images(first: 20) {
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
          variants(first: 20) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                inventoryQuantity
                sku
                barcode
                weight
                weightUnit
                availableForSale
                requiresShipping
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: { id: shopifyId },
    })

    if (response.errors) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener producto de Shopify",
          details: response.errors,
        },
        { status: 500 },
      )
    }

    if (!response.data || !response.data.product) {
      return NextResponse.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 },
      )
    }

    const product = response.data.product

    // Transformar los datos
    const transformedProduct = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      descriptionHtml: product.descriptionHtml,
      productType: product.productType,
      vendor: product.vendor,
      status: product.status,
      totalInventory: product.totalInventory,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      publishedAt: product.publishedAt,
      tags: product.tags,
      featuredImage: product.featuredImage,
      images: product.images.edges.map((edge: any) => edge.node),
      variants: product.variants.edges.map((edge: any) => edge.node),
      priceRange: product.priceRange,
    }

    return NextResponse.json({
      success: true,
      data: transformedProduct,
    })
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const body = await request.json()

    // Verificar configuración
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify no está configurado",
        },
        { status: 400 },
      )
    }

    // Construir el ID completo de Shopify
    const shopifyId = productId.startsWith("gid://") ? productId : `gid://shopify/Product/${productId}`

    const mutation = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            description
            status
            vendor
            productType
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const input = {
      id: shopifyId,
      title: body.title,
      descriptionHtml: body.description,
      vendor: body.vendor,
      productType: body.productType,
      status: body.status,
    }

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.productUpdate?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.productUpdate?.userErrors?.[0]?.message
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data?.productUpdate?.product,
    })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Verificar configuración
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify no está configurado",
        },
        { status: 400 },
      )
    }

    // Construir el ID completo de Shopify
    const shopifyId = productId.startsWith("gid://") ? productId : `gid://shopify/Product/${productId}`

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

    const response = await shopifyFetch({
      query: mutation,
      variables: {
        input: { id: shopifyId },
      },
    })

    if (response.errors || response.data?.productDelete?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.productDelete?.userErrors?.[0]?.message
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: { deletedProductId: response.data?.productDelete?.deletedProductId },
    })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
