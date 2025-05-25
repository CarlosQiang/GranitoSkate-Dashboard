const SHOPIFY_GRAPHQL_ENDPOINT = "/api/shopify"

// Consulta GraphQL para obtener productos
const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          status
          vendor
          productType
          tags
          createdAt
          updatedAt
          featuredImage {
            url
            altText
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                barcode
                inventoryQuantity
                weight
                weightUnit
                requiresShipping
                inventoryPolicy
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

// Función principal para obtener productos (compatible con el código existente)
export async function fetchProducts(limit = 20) {
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_PRODUCTS_QUERY,
        variables: {
          first: limit,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`)
    }

    // Transformar datos para compatibilidad
    const products = data.data.products.edges.map((edge: any) => {
      const node = edge.node
      const variant = node.variants.edges[0]?.node

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description,
        status: node.status,
        vendor: node.vendor,
        productType: node.productType,
        tags: node.tags,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        price: variant?.price || "0",
        compareAtPrice: variant?.compareAtPrice,
        currencyCode: "EUR", // Por defecto
        featuredImage: node.featuredImage,
        images: node.images.edges.map((img: any) => img.node),
        variants: node.variants.edges.map((v: any) => v.node),
      }
    })

    return products
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Función para obtener productos por estado
export async function fetchProductsByStatus(status: string, limit = 50) {
  return fetchProducts(limit) // Simplificado por ahora
}

// Función para obtener productos recientes (compatible con dashboard)
export async function fetchRecentProducts(limit = 5) {
  try {
    const products = await fetchProducts(limit)
    return products.slice(0, limit).map((product) => ({
      id: product.id.split("/").pop(),
      title: product.title,
      status: product.status,
      image: product.featuredImage?.url || null,
    }))
  } catch (error) {
    console.error("Error al obtener productos recientes:", error)
    return []
  }
}

// Función para obtener productos con stock bajo
export async function fetchLowStockProducts(threshold = 10) {
  try {
    const products = await fetchProducts(50)
    return products
      .filter((product) => {
        const variant = product.variants?.[0]
        return variant && variant.inventoryQuantity <= threshold
      })
      .slice(0, 5)
      .map((product) => ({
        id: product.id.split("/").pop(),
        title: product.title,
        quantity: product.variants[0]?.inventoryQuantity || 0,
      }))
  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error)
    return []
  }
}
