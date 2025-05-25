import { shopifyFetch } from "@/lib/shopify"

export interface Product {
  id: string
  title: string
  description: string
  status: string
  vendor: string
  productType: string
  handle: string
  tags: string[]
  images: Array<{
    id: string
    url: string
    altText: string
  }>
  variants: Array<{
    id: string
    title: string
    price: string
    compareAtPrice: string
    sku: string
    barcode: string
    inventoryQuantity: number
    weight: number
    weightUnit: string
  }>
}

export async function fetchProducts(limit = 10): Promise<Product[]> {
  try {
    const query = `
      query {
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              status
              vendor
              productType
              handle
              tags
              images(first: 5) {
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
                    sku
                    barcode
                    inventoryQuantity
                    weight
                    weightUnit
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(response.errors.map((e: any) => e.message).join(", "))
    }

    return (
      response.data?.products?.edges?.map((edge: any) => ({
        ...edge.node,
        images: edge.node.images?.edges?.map((imgEdge: any) => imgEdge.node) || [],
        variants: edge.node.variants?.edges?.map((varEdge: any) => varEdge.node) || [],
      })) || []
    )
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const query = `
      query {
        product(id: "gid://shopify/Product/${id}") {
          id
          title
          description
          status
          vendor
          productType
          handle
          tags
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
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
                sku
                barcode
                inventoryQuantity
                weight
                weightUnit
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors || !response.data?.product) {
      return null
    }

    const product = response.data.product
    return {
      ...product,
      images: product.images?.edges?.map((edge: any) => edge.node) || [],
      variants: product.variants?.edges?.map((edge: any) => edge.node) || [],
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    return null
  }
}

export async function fetchRecentProducts(limit = 5): Promise<Product[]> {
  return fetchProducts(limit)
}

export async function fetchLowStockProducts(threshold = 10): Promise<Product[]> {
  try {
    const products = await fetchProducts(50)
    return products.filter((product) => product.variants.some((variant) => variant.inventoryQuantity <= threshold))
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return []
  }
}

export async function createProduct(productData: any): Promise<Product | null> {
  try {
    const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            description
            status
          }
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
        input: productData,
      },
    })

    if (response.errors || response.data?.productCreate?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.productCreate?.userErrors?.[0]?.message)
    }

    return response.data?.productCreate?.product || null
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: any): Promise<Product | null> {
  try {
    const mutation = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            description
            status
          }
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
        input: {
          id: `gid://shopify/Product/${id}`,
          ...productData,
        },
      },
    })

    if (response.errors || response.data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.productUpdate?.userErrors?.[0]?.message)
    }

    return response.data?.productUpdate?.product || null
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
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
        input: {
          id: `gid://shopify/Product/${id}`,
        },
      },
    })

    if (response.errors || response.data?.productDelete?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.productDelete?.userErrors?.[0]?.message)
    }

    return !!response.data?.productDelete?.deletedProductId
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function getInventoryLevel(variantId: string): Promise<number> {
  try {
    const query = `
      query {
        productVariant(id: "gid://shopify/ProductVariant/${variantId}") {
          inventoryQuantity
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors || !response.data?.productVariant) {
      return 0
    }

    return response.data.productVariant.inventoryQuantity || 0
  } catch (error) {
    console.error("Error getting inventory level:", error)
    return 0
  }
}

export async function updateInventoryLevel(variantId: string, quantity: number): Promise<boolean> {
  try {
    const mutation = `
      mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
        inventoryAdjustQuantity(input: $input) {
          inventoryLevel {
            available
          }
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
        input: {
          inventoryLevelId: `gid://shopify/InventoryLevel/${variantId}`,
          availableDelta: quantity,
        },
      },
    })

    if (response.errors || response.data?.inventoryAdjustQuantity?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.inventoryAdjustQuantity?.userErrors?.[0]?.message)
    }

    return true
  } catch (error) {
    console.error("Error updating inventory level:", error)
    throw error
  }
}
