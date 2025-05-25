import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET(request: Request) {
  try {
    // Verificar configuración
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify no está configurado",
          message: "Configura las variables de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN",
        },
        { status: 400 },
      )
    }

    // Obtener parámetros de la URL
    const url = new URL(request.url)
    const limit = Math.min(Number.parseInt(url.searchParams.get("limit") || "50"), 250)
    const cursor = url.searchParams.get("cursor") || null

    // Consulta GraphQL para obtener productos
    const query = `
      query GetProducts($limit: Int!, $cursor: String) {
        products(first: $limit, after: $cursor, sortKey: UPDATED_AT, reverse: true) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
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
              tags
              featuredImage {
                id
                url
                altText
                width
                height
              }
              images(first: 5) {
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
              variants(first: 10) {
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
        }
      }
    `

    const variables = {
      limit,
      cursor,
    }

    const response = await shopifyFetch({ query, variables })

    if (response.errors) {
      console.error("Errores de GraphQL:", response.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener productos de Shopify",
          details: response.errors,
        },
        { status: 500 },
      )
    }

    if (!response.data || !response.data.products) {
      return NextResponse.json(
        {
          success: false,
          error: "Respuesta inválida de Shopify",
          details: response,
        },
        { status: 500 },
      )
    }

    // Transformar los datos para que sean más fáciles de usar
    const products = response.data.products.edges.map((edge: any) => {
      const product = edge.node
      return {
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
        images: product.images.edges.map((img: any) => img.node),
        variants: product.variants.edges.map((variant: any) => variant.node),
        priceRange: product.priceRange,
        // Campos adicionales para compatibilidad
        price: product.variants.edges[0]?.node?.price || "0",
        currencyCode: product.priceRange?.minVariantPrice?.currencyCode || "EUR",
      }
    })

    return NextResponse.json({
      success: true,
      data: products,
      pageInfo: response.data.products.pageInfo,
      count: products.length,
    })
  } catch (error) {
    console.error("Error al obtener productos:", error)
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
