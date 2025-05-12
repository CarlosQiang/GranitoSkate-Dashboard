import { shopifyFetch } from "@/lib/shopify"

// Función para obtener productos recientes
export async function fetchRecentProducts(limit = 5) {
  try {
    const query = `
      query {
        products(first: ${limit}, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              status
              featuredImage {
                url
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: {},
    })

    if (!response.data) {
      throw new Error("No se pudieron obtener los productos recientes")
    }

    return response.data.products.edges.map(({ node }: any) => ({
      id: node.id.split("/").pop(),
      title: node.title,
      status: node.status,
      image: node.featuredImage?.url || null,
    }))
  } catch (error) {
    console.error("Error al obtener productos recientes:", error)
    return []
  }
}

// Función para obtener productos con stock bajo
export async function fetchLowStockProducts(threshold = 10) {
  try {
    const query = `
      query {
        products(first: 20) {
          edges {
            node {
              id
              title
              variants(first: 1) {
                edges {
                  node {
                    id
                    inventoryQuantity
                    inventoryPolicy
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: {},
    })

    if (!response.data) {
      throw new Error("No se pudieron obtener los productos")
    }

    const products = response.data.products.edges
      .map(({ node }: any) => {
        const variant = node.variants.edges[0]?.node
        if (!variant) return null

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          quantity: variant.inventoryQuantity || 0,
          inventoryPolicy: variant.inventoryPolicy,
        }
      })
      .filter((product: any) => product && product.quantity <= threshold)
      .sort((a: any, b: any) => a.quantity - b.quantity)

    return products.slice(0, 5) // Devolver solo los 5 productos con menor stock
  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error)
    return []
  }
}

// Función para obtener un producto por ID
export async function fetchProductById(id: string) {
  try {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          status
          vendor
          productType
          tags
          featuredImage {
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
                inventoryQuantity
                inventoryPolicy
                sku
                barcode
              }
            }
          }
          collections(first: 10) {
            edges {
              node {
                id
                title
              }
            }
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
                type
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: { id: `gid://shopify/Product/${id}` },
    })

    if (!response.data || !response.data.product) {
      throw new Error(`No se pudo encontrar el producto con ID: ${id}`)
    }

    const product = response.data.product
    return {
      id: product.id.split("/").pop(),
      title: product.title,
      description: product.description,
      status: product.status,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      featuredImage: product.featuredImage
        ? {
            url: product.featuredImage.url,
            altText: product.featuredImage.altText,
          }
        : null,
      images: product.images.edges.map(({ node }: any) => ({
        id: node.id.split("/").pop(),
        url: node.url,
        altText: node.altText,
      })),
      variants: product.variants.edges.map(({ node }: any) => ({
        id: node.id.split("/").pop(),
        title: node.title,
        price: node.price,
        compareAtPrice: node.compareAtPrice,
        inventoryQuantity: node.inventoryQuantity,
        inventoryPolicy: node.inventoryPolicy,
        sku: node.sku,
        barcode: node.barcode,
      })),
      collections: product.collections.edges.map(({ node }: any) => ({
        id: node.id.split("/").pop(),
        title: node.title,
      })),
      metafields: product.metafields.edges.map(({ node }: any) => ({
        id: node.id.split("/").pop(),
        namespace: node.namespace,
        key: node.key,
        value: node.value,
        type: node.type,
      })),
    }
  } catch (error) {
    console.error(`Error al obtener el producto con ID ${id}:`, error)
    return null
  }
}

// Función para obtener todos los productos
export async function fetchAllProducts(limit = 20) {
  try {
    const query = `
      query {
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              status
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                    inventoryQuantity
                  }
                }
              }
              productType
              vendor
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: {},
    })

    if (!response.data) {
      throw new Error("No se pudieron obtener los productos")
    }

    return response.data.products.edges.map(({ node }: any) => {
      const variant = node.variants.edges[0]?.node
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        status: node.status,
        image: node.featuredImage?.url || null,
        price: variant?.price || "0",
        inventoryQuantity: variant?.inventoryQuantity || 0,
        productType: node.productType,
        vendor: node.vendor,
      }
    })
  } catch (error) {
    console.error("Error al obtener todos los productos:", error)
    return []
  }
}

// Función para crear un nuevo producto
export async function createProduct(productData: any) {
  try {
    const mutation = `
      mutation createProduct($input: ProductInput!) {
        productCreate(input: $input) {
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

    const response = await shopifyFetch({
      query: mutation,
      variables: {
        input: {
          title: productData.title,
          descriptionHtml: productData.description,
          vendor: productData.vendor,
          productType: productData.productType,
          tags: productData.tags,
          variants: [
            {
              price: productData.price,
              compareAtPrice: productData.compareAtPrice,
              inventoryQuantity: Number.parseInt(productData.inventoryQuantity),
              inventoryPolicy: productData.inventoryPolicy,
              sku: productData.sku,
              barcode: productData.barcode,
            },
          ],
        },
      },
    })

    if (response.data?.productCreate?.userErrors?.length > 0) {
      throw new Error(response.data.productCreate.userErrors[0].message)
    }

    return response.data?.productCreate?.product
  } catch (error) {
    console.error("Error al crear el producto:", error)
    throw error
  }
}

// Función para actualizar un producto
export async function updateProduct(id: string, productData: any) {
  try {
    const mutation = `
      mutation updateProduct($input: ProductInput!) {
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

    const response = await shopifyFetch({
      query: mutation,
      variables: {
        input: {
          id: `gid://shopify/Product/${id}`,
          title: productData.title,
          descriptionHtml: productData.description,
          vendor: productData.vendor,
          productType: productData.productType,
          tags: productData.tags,
        },
      },
    })

    if (response.data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(response.data.productUpdate.userErrors[0].message)
    }

    return response.data?.productUpdate?.product
  } catch (error) {
    console.error(`Error al actualizar el producto con ID ${id}:`, error)
    throw error
  }
}

// Función para eliminar un producto
export async function deleteProduct(id: string) {
  try {
    const mutation = `
      mutation deleteProduct($input: ProductDeleteInput!) {
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

    if (response.data?.productDelete?.userErrors?.length > 0) {
      throw new Error(response.data.productDelete.userErrors[0].message)
    }

    return response.data?.productDelete?.deletedProductId
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${id}:`, error)
    throw error
  }
}
