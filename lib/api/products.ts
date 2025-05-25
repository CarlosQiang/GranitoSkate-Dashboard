import { shopifyFetch } from "@/lib/shopify"

export interface Product {
  id: string
  title: string
  description: string
  descriptionHtml: string
  status: string
  vendor: string
  productType: string
  handle: string
  tags: string[]
  featuredImage?: {
    id: string
    url: string
    altText: string
  }
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
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export async function fetchProducts(limit = 50): Promise<Product[]> {
  try {
    const query = `
      query {
        products(first: ${limit}, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              status
              vendor
              productType
              handle
              tags
              createdAt
              updatedAt
              publishedAt
              featuredImage {
                id
                url
                altText
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
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      console.error("Error fetching products:", response.errors)
      return []
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
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Product/${id}`

    const query = `
      query {
        product(id: "${formattedId}") {
          id
          title
          description
          descriptionHtml
          status
          vendor
          productType
          handle
          tags
          createdAt
          updatedAt
          publishedAt
          featuredImage {
            id
            url
            altText
          }
          images(first: 20) {
            edges {
              node {
                id
                url
                altText
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
            vendor
            productType
            handle
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const input = {
      title: productData.title,
      descriptionHtml: productData.description,
      vendor: productData.vendor,
      productType: productData.productType,
      status: productData.status || "ACTIVE",
      handle: productData.handle,
      variants: productData.variants || [
        {
          price: productData.price || "0.00",
          compareAtPrice: productData.compareAtPrice,
          sku: productData.sku,
          inventoryQuantity: Number.parseInt(productData.inventoryQuantity) || 0,
          inventoryPolicy: "DENY",
          requiresShipping: true,
        },
      ],
    }

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.productCreate?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.productCreate?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return response.data?.productCreate?.product || null
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: any): Promise<Product | null> {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Product/${id}`

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
      id: formattedId,
      title: productData.title,
      descriptionHtml: productData.description,
      vendor: productData.vendor,
      productType: productData.productType,
      status: productData.status,
    }

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.productUpdate?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.productUpdate?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return response.data?.productUpdate?.product || null
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Product/${id}`

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
        input: { id: formattedId },
      },
    })

    if (response.errors || response.data?.productDelete?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.productDelete?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return !!response.data?.productDelete?.deletedProductId
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
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
