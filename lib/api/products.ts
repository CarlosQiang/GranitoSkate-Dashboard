import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchRecentProducts(limit = 5) {
  try {
    console.log(`Fetching ${limit} recent products from Shopify...`)

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
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.products || !data.products.edges) {
      console.error("Respuesta de productos incompleta:", data)
      return []
    }

    const products = data.products.edges.map((edge) => ({
      id: edge.node.id.split("/").pop(),
      title: edge.node.title,
      handle: edge.node.handle,
      status: edge.node.status,
      totalInventory: edge.node.totalInventory || 0,
      image: edge.node.featuredImage?.url || null,
      price: edge.node.priceRange?.minVariantPrice?.amount || "0.00",
      currencyCode: edge.node.priceRange?.minVariantPrice?.currencyCode || "EUR",
    }))

    console.log(`Successfully fetched ${products.length} products`)
    return products
  } catch (error) {
    console.error("Error fetching recent products:", error)
    throw new Error(`Error al cargar productos recientes: ${error.message}`)
  }
}

export async function fetchProducts(limit = 20) {
  return fetchRecentProducts(limit)
}

export async function fetchProductById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Product/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Product/${id}`

    console.log(`Fetching product with ID: ${formattedId}`)

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
          vendor
          productType
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

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.product) {
      console.error(`Producto no encontrado: ${id}`)
      throw new Error(`Producto no encontrado: ${id}`)
    }

    console.log(`Successfully fetched product: ${data.product.title}`)
    return data.product
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw new Error(`Error al cargar el producto: ${error.message}`)
  }
}

export async function createProduct(productData) {
  try {
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

    // Asegurarse de que los datos tienen el formato correcto
    const input = {
      title: productData.title,
      descriptionHtml: productData.descriptionHtml || "",
      handle: productData.handle || undefined,
      status: productData.status || "ACTIVE",
      vendor: productData.vendor || "GranitoSkate",
      productType: productData.productType || "SKATEBOARD",
    }

    // Si hay una imagen, añadirla
    if (productData.image) {
      input.images = [
        {
          altText: productData.title,
          src: productData.image,
        },
      ]
    }

    // Si hay variantes, añadirlas
    if (productData.variants && productData.variants.length > 0) {
      input.variants = productData.variants.map((variant) => ({
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

    console.log("Creating product with data:", JSON.stringify(input, null, 2))

    const data = await shopifyClient.request(mutation, { input })

    if (data.productCreate.userErrors && data.productCreate.userErrors.length > 0) {
      console.error("Errores al crear producto:", data.productCreate.userErrors)
      throw new Error(`Error al crear producto: ${data.productCreate.userErrors[0].message}`)
    }

    // Extraer correctamente el ID del producto
    const productId = data.productCreate.product.id.split("/").pop()

    console.log(`Successfully created product: ${data.productCreate.product.title} (ID: ${productId})`)

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

export async function updateProduct(id, productData) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Product/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Product/${id}`

    console.log(`Updating product with ID: ${formattedId}`)

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

    // Preparar los datos para la actualización
    const input = {
      id: formattedId,
      title: productData.title,
      descriptionHtml: productData.descriptionHtml || productData.description || "",
      status: productData.status || "ACTIVE",
      vendor: productData.vendor || undefined,
      productType: productData.productType || undefined,
    }

    // Si hay una imagen nueva, añadirla
    if (productData.image) {
      input.images = [
        {
          altText: productData.title,
          src: productData.image,
        },
      ]
    }

    // Si hay metafields, añadirlos
    if (productData.metafields && productData.metafields.length > 0) {
      input.metafields = productData.metafields
    }

    console.log("Updating product with data:", JSON.stringify(input, null, 2))

    const data = await shopifyClient.request(mutation, { input })

    if (data.productUpdate.userErrors && data.productUpdate.userErrors.length > 0) {
      console.error("Errores al actualizar producto:", data.productUpdate.userErrors)
      throw new Error(`Error al actualizar producto: ${data.productUpdate.userErrors[0].message}`)
    }

    console.log(`Successfully updated product: ${data.productUpdate.product.title}`)
    return data.productUpdate.product
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

export async function deleteProduct(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/Product/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/Product/${id}`

    console.log(`Deleting product with ID: ${formattedId}`)

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

    const data = await shopifyClient.request(mutation, {
      input: {
        id: formattedId,
      },
    })

    if (data.productDelete.userErrors && data.productDelete.userErrors.length > 0) {
      throw new Error(data.productDelete.userErrors[0].message)
    }

    console.log(`Successfully deleted product with ID: ${formattedId}`)
    return data.productDelete.deletedProductId
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}

// Añadir funciones para gestionar productos en colecciones
export async function addProductsToCollection(collectionId, productIds) {
  try {
    // Asegurarse de que el ID de la colección tenga el formato correcto
    const isFullCollectionId = collectionId.includes("gid://shopify/Collection/")
    const formattedCollectionId = isFullCollectionId ? collectionId : `gid://shopify/Collection/${collectionId}`

    // Formatear los IDs de los productos
    const formattedProductIds = productIds.map((id) => {
      const isFullProductId = id.includes("gid://shopify/Product/")
      return isFullProductId ? id : `gid://shopify/Product/${id}`
    })

    console.log(`Adding ${formattedProductIds.length} products to collection ${formattedCollectionId}`)

    const mutation = gql`
      mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
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

    const data = await shopifyClient.request(mutation, {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    })

    if (data.collectionAddProducts.userErrors && data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(data.collectionAddProducts.userErrors[0].message)
    }

    console.log(
      `Successfully added products to collection: ${data.collectionAddProducts.collection.title} (${data.collectionAddProducts.collection.productsCount} products)`,
    )
    return data.collectionAddProducts.collection
  } catch (error) {
    console.error(`Error adding products to collection ${collectionId}:`, error)
    throw new Error(`Error al añadir productos a la colección: ${error.message}`)
  }
}

export async function removeProductsFromCollection(collectionId, productIds) {
  try {
    // Asegurarse de que el ID de la colección tenga el formato correcto
    const isFullCollectionId = collectionId.includes("gid://shopify/Collection/")
    const formattedCollectionId = isFullCollectionId ? collectionId : `gid://shopify/Collection/${collectionId}`

    // Formatear los IDs de los productos
    const formattedProductIds = productIds.map((id) => {
      const isFullProductId = id.includes("gid://shopify/Product/")
      return isFullProductId ? id : `gid://shopify/Product/${id}`
    })

    console.log(`Removing ${formattedProductIds.length} products from collection ${formattedCollectionId}`)

    const mutation = gql`
      mutation CollectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
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

    const data = await shopifyClient.request(mutation, {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    })

    if (data.collectionRemoveProducts.userErrors && data.collectionRemoveProducts.userErrors.length > 0) {
      throw new Error(data.collectionRemoveProducts.userErrors[0].message)
    }

    console.log(
      `Successfully removed products from collection: ${data.collectionRemoveProducts.collection.title} (${data.collectionRemoveProducts.collection.productsCount} products)`,
    )
    return data.collectionRemoveProducts.collection
  } catch (error) {
    console.error(`Error removing products from collection ${collectionId}:`, error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}
