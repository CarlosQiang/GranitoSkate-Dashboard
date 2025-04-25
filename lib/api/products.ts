import shopifyClient, { formatShopifyId } from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentProducts(limit = 5) {
  const query = gql`
    query GetRecentProducts($limit: Int!) {
      products(first: $limit, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            featuredImage {
              url
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.products || !data.products.edges) {
      console.error("Respuesta de productos incompleta:", data)
      return []
    }

    return data.products.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      title: edge.node.title,
      handle: edge.node.handle,
      status: edge.node.status,
      totalInventory: edge.node.totalInventory || 0,
      featuredImage: edge.node.featuredImage,
    }))
  } catch (error) {
    console.error("Error fetching recent products:", error)
    return []
  }
}

export async function fetchProductById(id: string) {
  const query = gql`
    query GetProductById($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        description
        descriptionHtml
        status
        totalInventory
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
        variants(first: 50) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              inventoryQuantity
              sku
              selectedOptions {
                name
                value
              }
            }
          }
        }
        metafields(first: 20) {
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
        collections(first: 10) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  `

  try {
    // Asegurarse de que el ID tenga el formato correcto
    // Si el ID ya tiene el formato gid://, usarlo directamente
    // De lo contrario, formatearlo como gid://shopify/Product/ID
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Product/${id}`

    console.log(`Fetching product with ID: ${formattedId}`)

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.product) {
      console.error(`Producto no encontrado: ${id}`)
      throw new Error(`Producto no encontrado: ${id}`)
    }

    return data.product
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw new Error(`Error al cargar el producto: ${(error as Error).message}`)
  }
}

export async function createProduct(productData: any) {
  // Versión simplificada de la mutación para crear productos
  const mutation = gql`
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

  try {
    // Asegurarse de que los datos tienen el formato correcto
    const input = {
      title: productData.title,
      descriptionHtml: productData.descriptionHtml || "",
      status: productData.status || "ACTIVE",
      vendor: productData.vendor || "GranitoSkate",
      productType: productData.productType || "SKATEBOARD",
    }

    // Si hay variantes, añadirlas pero SIN inventoryQuantities
    if (productData.variants && productData.variants.length > 0) {
      input.variants = productData.variants.map((variant: any) => ({
        price: variant.price || "0.00",
        compareAtPrice: variant.compareAtPrice || null,
        sku: variant.sku || "",
        options: [variant.title || "Default Title"],
      }))
    }

    // Si hay metafields, añadirlos
    if (productData.metafields && productData.metafields.length > 0) {
      input.metafields = productData.metafields
    }

    console.log("Enviando datos para crear producto:", JSON.stringify(input, null, 2))

    const data = await shopifyClient.request(mutation, { input })

    if (data.productCreate.userErrors && data.productCreate.userErrors.length > 0) {
      console.error("Errores al crear producto:", data.productCreate.userErrors)
      throw new Error(`Error al crear producto: ${data.productCreate.userErrors[0].message}`)
    }

    // Extraer correctamente el ID del producto
    const productId = data.productCreate.product.id.split("/").pop()

    // Devolver el producto con el ID en formato simple
    return {
      ...data.productCreate.product,
      id: productId,
    }
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: any) {
  const mutation = gql`
    mutation ProductUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
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

  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = formatShopifyId(id, "Product")

    const data = await shopifyClient.request(mutation, {
      input: {
        id: formattedId,
        ...productData,
      },
    })

    if (data.productUpdate.userErrors && data.productUpdate.userErrors.length > 0) {
      throw new Error(data.productUpdate.userErrors[0].message)
    }

    return data.productUpdate.product
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  const mutation = gql`
    mutation ProductDelete($input: ProductDeleteInput!) {
      productDelete(input: $input) {
        deletedProductId
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = formatShopifyId(id, "Product")

    const data = await shopifyClient.request(mutation, {
      input: {
        id: formattedId,
      },
    })

    if (data.productDelete.userErrors && data.productDelete.userErrors.length > 0) {
      throw new Error(data.productDelete.userErrors[0].message)
    }

    return data.productDelete.deletedProductId
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}

// Función para añadir productos a una colección
export async function addProductsToCollection(collectionId: string, productIds: string[]) {
  const mutation = gql`
    mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(collectionId: $id, productIds: $productIds) {
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

  try {
    // Convertir IDs a formato Shopify GID
    const formattedProductIds = productIds.map((id) => formatShopifyId(id, "Product"))
    const formattedCollectionId = formatShopifyId(collectionId, "Collection")

    const data = await shopifyClient.request(mutation, {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    })

    if (data.collectionAddProducts.userErrors && data.collectionAddProducts.userErrors.length > 0) {
      console.error("Errores al añadir productos a la colección:", data.collectionAddProducts.userErrors)
      throw new Error(`Error al añadir productos: ${data.collectionAddProducts.userErrors[0].message}`)
    }

    return data.collectionAddProducts.collection
  } catch (error) {
    console.error(`Error adding products to collection ${collectionId}:`, error)
    throw error
  }
}

// Función para eliminar productos de una colección
export async function removeProductsFromCollection(collectionId: string, productIds: string[]) {
  const mutation = gql`
    mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
      collectionRemoveProducts(collectionId: $id, productIds: $productIds) {
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

  try {
    // Convertir IDs a formato Shopify GID
    const formattedProductIds = productIds.map((id) => formatShopifyId(id, "Product"))
    const formattedCollectionId = formatShopifyId(collectionId, "Collection")

    const data = await shopifyClient.request(mutation, {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    })

    if (data.collectionRemoveProducts.userErrors && data.collectionRemoveProducts.userErrors.length > 0) {
      console.error("Errores al eliminar productos de la colección:", data.collectionRemoveProducts.userErrors)
      throw new Error(`Error al eliminar productos: ${data.collectionRemoveProducts.userErrors[0].message}`)
    }

    return data.collectionRemoveProducts.collection
  } catch (error) {
    console.error(`Error removing products from collection ${collectionId}:`, error)
    throw error
  }
}
