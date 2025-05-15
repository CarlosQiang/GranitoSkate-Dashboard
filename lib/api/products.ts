import { shopifyFetch } from "@/lib/shopify-client"

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

    const response = await shopifyFetch({ query })

    if (!response.data) {
      throw new Error("No se pudieron obtener los productos recientes")
    }

    return response.data.products.edges.map(({ node }) => ({
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

    const response = await shopifyFetch({ query })

    if (!response.data) {
      throw new Error("No se pudieron obtener los productos")
    }

    const products = response.data.products.edges
      .map(({ node }) => {
        const variant = node.variants.edges[0]?.node
        if (!variant) return null

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          quantity: variant.inventoryQuantity || 0,
          inventoryPolicy: variant.inventoryPolicy,
        }
      })
      .filter((product) => product && product.quantity <= threshold)
      .sort((a, b) => a.quantity - b.quantity)

    return products.slice(0, 5) // Devolver solo los 5 productos con menor stock
  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error)
    return []
  }
}

// Función para obtener todos los productos
export async function fetchProducts(limit = 20) {
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

    const response = await shopifyFetch({ query })

    if (!response.data) {
      throw new Error("No se pudieron obtener los productos")
    }

    return response.data.products.edges.map(({ node }) => {
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

// Función para obtener un producto por ID
export async function fetchProductById(id) {
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
      images: product.images.edges.map(({ node }) => ({
        id: node.id.split("/").pop(),
        url: node.url,
        altText: node.altText,
      })),
      variants: product.variants.edges.map(({ node }) => ({
        id: node.id.split("/").pop(),
        title: node.title,
        price: node.price,
        compareAtPrice: node.compareAtPrice,
        inventoryQuantity: node.inventoryQuantity,
        inventoryPolicy: node.inventoryPolicy,
        sku: node.sku,
        barcode: node.barcode,
      })),
      collections: product.collections.edges.map(({ node }) => ({
        id: node.id.split("/").pop(),
        title: node.title,
      })),
      metafields: product.metafields.edges.map(({ node }) => ({
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

// Función para crear un nuevo producto
export async function createProduct(productData) {
  try {
    // Corregido: Eliminamos inventoryQuantity del input de la variante
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

    // Preparamos el input sin incluir inventoryQuantity directamente
    const input = {
      title: productData.title,
      descriptionHtml: productData.description,
      vendor: productData.vendor,
      productType: productData.productType,
      tags: productData.tags || [],
      variants: [
        {
          price: productData.variants?.[0]?.price || productData.price || "0",
          compareAtPrice: productData.variants?.[0]?.compareAtPrice || productData.compareAtPrice,
          sku: productData.variants?.[0]?.sku || productData.sku || "",
          barcode: productData.variants?.[0]?.barcode || productData.barcode,
          // Eliminamos inventoryQuantity de aquí
        },
      ],
    }

    // Si hay un handle, lo incluimos
    if (productData.handle) {
      input.handle = productData.handle
    }

    // Si hay una imagen, la incluimos
    if (productData.image) {
      input.images = [{ src: productData.image }]
    }

    console.log("Input para crear producto:", input)

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.productCreate?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.productCreate?.userErrors[0]?.message
      console.error("Error en la respuesta de creación de producto:", errorMessage)
      throw new Error(errorMessage)
    }

    const createdProduct = response.data?.productCreate?.product

    // Si necesitamos actualizar el inventario, lo hacemos en una operación separada
    if (productData.inventoryQuantity !== undefined && createdProduct) {
      await updateProductInventory(createdProduct.id.split("/").pop(), productData.inventoryQuantity)
    }

    return createdProduct
  } catch (error) {
    console.error("Error al crear el producto:", error)
    throw error
  }
}

// Nueva función para actualizar el inventario de un producto
async function updateProductInventory(productId, quantity) {
  try {
    // Primero obtenemos el ID de la variante
    const product = await fetchProductById(productId)
    if (!product || !product.variants || product.variants.length === 0) {
      throw new Error("No se pudo encontrar la variante del producto")
    }

    const variantId = product.variants[0].id

    // Ahora actualizamos el inventario usando la API REST
    const inventoryItemId = await getInventoryItemId(variantId)
    if (!inventoryItemId) {
      throw new Error("No se pudo obtener el ID del inventario")
    }

    // Actualizamos el inventario
    await adjustInventory(inventoryItemId, quantity)

    return true
  } catch (error) {
    console.error("Error al actualizar el inventario:", error)
    throw error
  }
}

// Función para obtener el ID del inventario de una variante
async function getInventoryItemId(variantId) {
  try {
    const query = `
      query getVariant($id: ID!) {
        productVariant(id: $id) {
          inventoryItem {
            id
          }
        }
      }
    `

    const response = await shopifyFetch({
      query,
      variables: { id: `gid://shopify/ProductVariant/${variantId}` },
    })

    if (response.errors || !response.data?.productVariant?.inventoryItem?.id) {
      throw new Error("No se pudo obtener el ID del inventario")
    }

    return response.data.productVariant.inventoryItem.id.split("/").pop()
  } catch (error) {
    console.error("Error al obtener el ID del inventario:", error)
    throw error
  }
}

// Función para ajustar el inventario
async function adjustInventory(inventoryItemId, quantity) {
  try {
    const mutation = `
      mutation adjustInventoryQuantity($input: InventoryAdjustQuantityInput!) {
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
          inventoryItemId: `gid://shopify/InventoryItem/${inventoryItemId}`,
          availableDelta: Number.parseInt(quantity, 10),
          locationId: await getLocationId(),
        },
      },
    })

    if (response.errors || response.data?.inventoryAdjustQuantity?.userErrors?.length > 0) {
      const errorMessage =
        response.errors?.[0]?.message || response.data?.inventoryAdjustQuantity?.userErrors[0]?.message
      throw new Error(errorMessage)
    }

    return true
  } catch (error) {
    console.error("Error al ajustar el inventario:", error)
    throw error
  }
}

// Función para obtener el ID de la ubicación
async function getLocationId() {
  try {
    const query = `
      query {
        locations(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors || !response.data?.locations?.edges?.[0]?.node?.id) {
      throw new Error("No se pudo obtener el ID de la ubicación")
    }

    return response.data.locations.edges[0].node.id
  } catch (error) {
    console.error("Error al obtener el ID de la ubicación:", error)
    throw error
  }
}

// Función para actualizar un producto
export async function updateProduct(id, productData) {
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

    const input = {
      id: `gid://shopify/Product/${id}`,
      title: productData.title,
      descriptionHtml: productData.description,
      vendor: productData.vendor,
      productType: productData.productType,
      tags: productData.tags,
    }

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.productUpdate?.userErrors[0]?.message)
    }

    return response.data?.productUpdate?.product
  } catch (error) {
    console.error(`Error al actualizar el producto con ID ${id}:`, error)
    throw error
  }
}

// Función para eliminar un producto
export async function deleteProduct(id) {
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

    if (response.errors || response.data?.productDelete?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.productDelete?.userErrors[0]?.message)
    }

    return response.data?.productDelete?.deletedProductId
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${id}:`, error)
    throw error
  }
}
