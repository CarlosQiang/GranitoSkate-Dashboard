import { shopifyFetch } from "@/lib/shopify"

// Función para obtener todos los productos
export async function fetchProducts(limit = 50) {
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
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    compareAtPrice
                    inventoryQuantity
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
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    return response.data?.products?.edges?.map((edge) => edge.node) || []
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Función para obtener un producto por ID
export async function fetchProductById(id: string) {
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
                inventoryQuantity
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    const product = response.data?.product
    if (!product) {
      throw new Error("Producto no encontrado")
    }

    // Formatear las variantes
    product.variants = product.variants?.edges?.map((edge) => edge.node) || []

    return product
  } catch (error) {
    console.error("Error al obtener producto:", error)
    throw error
  }
}

// Función para crear un producto
export async function createProduct(productData: any) {
  try {
    const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
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
        title: productData.title,
        descriptionHtml: productData.description || "",
        status: productData.status || "ACTIVE",
        vendor: productData.vendor || "",
        productType: productData.productType || "",
        handle: productData.handle || "",
        variants: [
          {
            price: productData.price || "0.00",
            compareAtPrice: productData.compareAtPrice || null,
            sku: productData.sku || "",
            inventoryQuantities: [
              {
                availableQuantity: Number.parseInt(productData.inventoryQuantity) || 0,
                locationId: "gid://shopify/Location/1", // ID de ubicación por defecto
              },
            ],
          },
        ],
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (response.data?.productCreate?.userErrors?.length > 0) {
      throw new Error(response.data.productCreate.userErrors.map((e) => e.message).join(", "))
    }

    return response.data?.productCreate?.product
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw error
  }
}

// Función para actualizar un producto
export async function updateProduct(id: string, productData: any) {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Product/${id}`

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
        id: formattedId,
        title: productData.title,
        descriptionHtml: productData.description || "",
        status: productData.status || "ACTIVE",
        vendor: productData.vendor || "",
        productType: productData.productType || "",
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (response.data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(response.data.productUpdate.userErrors.map((e) => e.message).join(", "))
    }

    return response.data?.productUpdate?.product
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    throw error
  }
}

// Función para eliminar un producto
export async function deleteProduct(id: string) {
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

    const variables = {
      input: {
        id: formattedId,
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (response.data?.productDelete?.userErrors?.length > 0) {
      throw new Error(response.data.productDelete.userErrors.map((e) => e.message).join(", "))
    }

    return response.data?.productDelete?.deletedProductId
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    throw error
  }
}

// Función para obtener el nivel de inventario
export async function getInventoryLevel(variantId: string) {
  try {
    const formattedId = variantId.includes("gid://") ? variantId : `gid://shopify/ProductVariant/${variantId}`

    const query = `
      query {
        productVariant(id: "${formattedId}") {
          inventoryQuantity
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    return response.data?.productVariant?.inventoryQuantity || 0
  } catch (error) {
    console.error("Error al obtener nivel de inventario:", error)
    throw error
  }
}

// Función para actualizar el nivel de inventario
export async function updateInventoryLevel(variantId: string, quantity: number) {
  try {
    const formattedId = variantId.includes("gid://") ? variantId : `gid://shopify/ProductVariant/${variantId}`

    const mutation = `
      mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
        inventoryAdjustQuantities(input: $input) {
          inventoryAdjustmentGroup {
            reason
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
        reason: "correction",
        name: "available",
        changes: [
          {
            inventoryItemId: formattedId,
            delta: quantity,
          },
        ],
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (response.data?.inventoryAdjustQuantities?.userErrors?.length > 0) {
      throw new Error(response.data.inventoryAdjustQuantities.userErrors.map((e) => e.message).join(", "))
    }

    return true
  } catch (error) {
    console.error("Error al actualizar inventario:", error)
    throw error
  }
}

// Función para obtener productos recientes
export async function fetchRecentProducts(limit = 5) {
  try {
    return await fetchProducts(limit)
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
      .map((product) => ({
        ...product,
        quantity: product.variants?.[0]?.inventoryQuantity || 0,
      }))
  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error)
    return []
  }
}
