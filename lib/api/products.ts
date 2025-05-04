import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener productos recientes
export async function fetchRecentProducts(limit = 5) {
  // Implementación de la función para obtener productos recientes
  // Utilizamos la función fetchProducts existente con un límite
  const products = await fetchProducts({ limit })
  return products
}

// Función para obtener todos los productos
export async function fetchProducts(limit = 20) {
  try {
    const query = gql`
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              vendor
              productType
              status
              totalInventory
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
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
                    sku
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { first: limit })

    // Transformar los datos para un formato más fácil de usar
    const products = data.products.edges.map((edge) => {
      const node = edge.node
      const variant = node.variants.edges[0]?.node || {}

      return {
        id: node.id.split("/").pop(), // Extraer el ID numérico
        title: node.title,
        handle: node.handle,
        description: node.description,
        descriptionHtml: node.descriptionHtml,
        vendor: node.vendor,
        productType: node.productType,
        status: node.status,
        totalInventory: node.totalInventory,
        featuredImage: node.featuredImage,
        price: variant.price?.amount || "0.00",
        compareAtPrice: variant.compareAtPrice?.amount || null,
        currencyCode: variant.price?.currencyCode || "EUR",
        sku: variant.sku || "",
        inventoryQuantity: variant.inventoryQuantity || 0,
      }
    })

    return products
  } catch (error) {
    console.error("Error al cargar productos:", error)
    throw new Error(`Error al cargar productos: ${error.message}`)
  }
}

// Función para obtener un producto por ID
export async function fetchProductById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`

    const query = gql`
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          productType
          status
          totalInventory
          featuredImage {
            url
            altText
          }
          variants(first: 5) {
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
                sku
                inventoryQuantity
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data.product) {
      throw new Error(`No se encontró el producto con ID: ${id}`)
    }

    // Transformar los datos para un formato más fácil de usar
    const product = data.product

    return {
      id: product.id.split("/").pop(),
      title: product.title,
      handle: product.handle,
      description: product.description,
      descriptionHtml: product.descriptionHtml,
      vendor: product.vendor,
      productType: product.productType,
      status: product.status,
      totalInventory: product.totalInventory,
      featuredImage: product.featuredImage,
      variants: product.variants.edges.map((edge) => ({
        id: edge.node.id.split("/").pop(),
        title: edge.node.title,
        price: edge.node.price,
        compareAtPrice: edge.node.compareAtPrice,
        sku: edge.node.sku,
        inventoryQuantity: edge.node.inventoryQuantity,
      })),
    }
  } catch (error) {
    console.error(`Error al cargar el producto ${id}:`, error)
    throw new Error(`Error al cargar el producto: ${error.message}`)
  }
}

// Función para crear un nuevo producto
export async function createProduct(productData) {
  try {
    const mutation = gql`
      mutation CreateProduct($input: ProductInput!) {
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
        vendor: productData.vendor || "",
        productType: productData.productType || "",
        status: productData.status || "ACTIVE",
        images: productData.image ? [{ src: productData.image }] : [],
        variants: [
          {
            price: productData.price || "0.00",
            compareAtPrice: productData.compareAtPrice || null,
            sku: productData.sku || "",
            inventoryQuantities: {
              availableQuantity: productData.inventoryQuantity || 0,
              locationId: "gid://shopify/Location/1", // Ubicación por defecto
            },
          },
        ],
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.productCreate.userErrors && data.productCreate.userErrors.length > 0) {
      throw new Error(data.productCreate.userErrors[0].message)
    }

    return {
      id: data.productCreate.product.id.split("/").pop(),
      title: data.productCreate.product.title,
      handle: data.productCreate.product.handle,
    }
  } catch (error) {
    console.error("Error al crear el producto:", error)
    throw new Error(`Error al crear el producto: ${error.message}`)
  }
}

// Función para actualizar un producto
export async function updateProduct(id, productData) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`

    const mutation = gql`
      mutation UpdateProduct($input: ProductInput!) {
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

    const input = {
      id: formattedId,
      title: productData.title,
      descriptionHtml: productData.descriptionHtml || "",
      vendor: productData.vendor || "",
      productType: productData.productType || "",
      status: productData.status || "ACTIVE",
    }

    // Añadir imagen solo si se proporciona
    if (productData.image) {
      input.images = [{ src: productData.image }]
    }

    const variables = { input }

    const data = await shopifyClient.request(mutation, variables)

    if (data.productUpdate.userErrors && data.productUpdate.userErrors.length > 0) {
      throw new Error(data.productUpdate.userErrors[0].message)
    }

    return {
      id: data.productUpdate.product.id.split("/").pop(),
      title: data.productUpdate.product.title,
      handle: data.productUpdate.product.handle,
    }
  } catch (error) {
    console.error(`Error al actualizar el producto ${id}:`, error)
    throw new Error(`Error al actualizar el producto: ${error.message}`)
  }
}

// Función para eliminar un producto
export async function deleteProduct(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`

    const mutation = gql`
      mutation DeleteProduct($input: ProductDeleteInput!) {
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

    const data = await shopifyClient.request(mutation, variables)

    if (data.productDelete.userErrors && data.productDelete.userErrors.length > 0) {
      throw new Error(data.productDelete.userErrors[0].message)
    }

    return {
      id: data.productDelete.deletedProductId,
    }
  } catch (error) {
    console.error(`Error al eliminar el producto ${id}:`, error)
    throw new Error(`Error al eliminar el producto: ${error.message}`)
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
