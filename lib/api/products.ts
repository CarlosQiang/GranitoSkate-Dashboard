import { shopifyFetch } from "@/lib/shopify"
import { fetchShopifyProducts } from "@/lib/services/shopify-service"
import { transformShopifyProduct } from "@/lib/services/data-transformer"

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

// Mejorar la función fetchProducts para obtener datos reales de Shopify
export async function fetchProducts(limit = 20, status = null) {
  try {
    // Construir la consulta GraphQL
    let queryParams = `first: ${limit}, sortKey: UPDATED_AT, reverse: true`

    // Si se especifica un estado, añadirlo a la consulta
    if (status) {
      queryParams += `, query: "status:${status}"`
    }

    const query = `
      query {
        products(${queryParams}) {
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
                    compareAtPrice
                  }
                }
              }
              productType
              vendor
              createdAt
              updatedAt
            }
          }
        }
      }
    `

    console.log("Consulta GraphQL:", query)

    const response = await shopifyFetch({ query })

    if (!response.data) {
      console.error("Respuesta de Shopify sin datos:", response)
      throw new Error("No se pudieron obtener los productos")
    }

    const products = response.data.products.edges.map(({ node }) => {
      const variant = node.variants.edges[0]?.node
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        status: node.status,
        image: node.featuredImage?.url || null,
        price: variant?.price || "0",
        compareAtPrice: variant?.compareAtPrice || null,
        inventoryQuantity: variant?.inventoryQuantity || 0,
        productType: node.productType || "",
        vendor: node.vendor || "",
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      }
    })

    console.log(`Productos obtenidos (${status || "todos"}):`, products.length)
    return products
  } catch (error) {
    console.error("Error al obtener todos los productos:", error)
    throw error
  }
}

// Función para obtener productos filtrados por estado
export async function fetchProductsByStatus(status, limit = 100) {
  try {
    return await fetchProducts(limit, status)
  } catch (error) {
    console.error(`Error al obtener productos con estado ${status}:`, error)
    throw error
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
                sku
                barcode
                inventoryQuantity
                inventoryPolicy
                inventoryManagement
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
        inventoryManagement: node.inventoryManagement,
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
    // Primero creamos el producto básico
    const mutation = `
      mutation createProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  inventoryManagement
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Preparamos el input sin incluir inventoryQuantity
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
          inventoryManagement: "SHOPIFY", // Habilitar el seguimiento de inventario
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

    // Si se especificó una cantidad de inventario, actualizamos el inventario
    if (productData.inventoryQuantity !== undefined && createdProduct) {
      const variantId = createdProduct.variants.edges[0]?.node?.id
      if (variantId) {
        try {
          await updateInventoryLevel(variantId.split("/").pop(), Number.parseInt(productData.inventoryQuantity, 10))
        } catch (error) {
          console.error("Error al actualizar el inventario inicial:", error)
          // No bloqueamos la creación del producto si falla la actualización del inventario
        }
      }
    }

    return createdProduct
  } catch (error) {
    console.error("Error al crear el producto:", error)
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
            variants(first: 1) {
              edges {
                node {
                  id
                  inventoryManagement
                }
              }
            }
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

    const updatedProduct = response.data?.productUpdate?.product

    // Si se especificó una cantidad de inventario, actualizamos el inventario
    if (productData.inventoryQuantity !== undefined && updatedProduct) {
      const variantId = updatedProduct.variants.edges[0]?.node?.id
      if (variantId) {
        try {
          await updateInventoryLevel(variantId.split("/").pop(), Number.parseInt(productData.inventoryQuantity, 10))
        } catch (error) {
          console.error("Error al actualizar el inventario:", error)
          // No bloqueamos la actualización del producto si falla la actualización del inventario
        }
      }
    }

    return updatedProduct
  } catch (error) {
    console.error(`Error al actualizar el producto con ID ${id}:`, error)
    throw error
  }
}

// Función mejorada para actualizar el nivel de inventario
export async function updateInventoryLevel(variantId, quantity) {
  try {
    // Primero verificamos si el producto tiene habilitado el seguimiento de inventario
    const queryVariant = `
      query getVariantDetails($variantId: ID!) {
        productVariant(id: $variantId) {
          inventoryManagement
          inventoryItem {
            id
          }
        }
      }
    `

    const variantResponse = await shopifyFetch({
      query: queryVariant,
      variables: { variantId: `gid://shopify/ProductVariant/${variantId}` },
    })

    if (variantResponse.errors) {
      throw new Error(variantResponse.errors[0].message)
    }

    const variant = variantResponse.data?.productVariant

    // Si el producto no tiene habilitado el seguimiento de inventario, primero lo habilitamos
    if (variant?.inventoryManagement !== "SHOPIFY") {
      const updateVariantMutation = `
        mutation updateVariant($input: ProductVariantInput!) {
          productVariantUpdate(input: $input) {
            productVariant {
              id
              inventoryManagement
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      const updateVariantResponse = await shopifyFetch({
        query: updateVariantMutation,
        variables: {
          input: {
            id: `gid://shopify/ProductVariant/${variantId}`,
            inventoryManagement: "SHOPIFY",
          },
        },
      })

      if (updateVariantResponse.errors || updateVariantResponse.data?.productVariantUpdate?.userErrors?.length > 0) {
        const errorMessage =
          updateVariantResponse.errors?.[0]?.message ||
          updateVariantResponse.data?.productVariantUpdate?.userErrors[0]?.message
        console.error("Error al habilitar el seguimiento de inventario:", errorMessage)
        throw new Error(errorMessage)
      }
    }

    // Ahora obtenemos el inventoryItemId
    if (!variant?.inventoryItem?.id) {
      throw new Error("No se pudo obtener el ID del inventario")
    }

    const inventoryItemId = variant.inventoryItem.id

    // Obtenemos la ubicación del inventario
    const queryLocation = `
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

    const locationResponse = await shopifyFetch({ query: queryLocation })

    if (locationResponse.errors || !locationResponse.data?.locations?.edges?.[0]?.node?.id) {
      throw new Error("No se pudo obtener la ubicación del inventario")
    }

    const locationId = locationResponse.data.locations.edges[0].node.id

    // Ahora actualizamos el inventario usando la API REST
    const restEndpoint = `/admin/api/2023-07/inventory_levels/set.json`

    const inventoryData = {
      location_id: locationId.split("/").pop(),
      inventory_item_id: inventoryItemId.split("/").pop(),
      available: quantity,
    }

    // Realizamos la petición REST a Shopify
    const response = await fetch(`/api/shopify/rest?endpoint=${encodeURIComponent(restEndpoint)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Error al actualizar el inventario: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al actualizar el nivel de inventario:", error)
    throw error
  }
}

// Función para obtener el nivel de inventario actual
export async function getInventoryLevel(variantId) {
  try {
    const query = `
      query getVariantInventory($id: ID!) {
        productVariant(id: $id) {
          inventoryQuantity
          inventoryManagement
          inventoryItem {
            id
            inventoryLevels(first: 1) {
              edges {
                node {
                  available
                  location {
                    id
                    name
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
      variables: { id: `gid://shopify/ProductVariant/${variantId}` },
    })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    return response.data?.productVariant?.inventoryQuantity || 0
  } catch (error) {
    console.error("Error al obtener el nivel de inventario:", error)
    return 0
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

/**
 * Obtiene productos de Shopify
 * @param limit Número máximo de productos a obtener
 * @returns Array de productos
 */
export async function getProducts(limit = 100) {
  try {
    // Usar el servicio de caché para obtener productos
    const products = await fetchShopifyProducts(false, limit)
    return products.map((product) => transformShopifyProduct(product))
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

/**
 * Obtiene un producto específico de Shopify por ID
 * @param id ID del producto
 * @returns Producto
 */
export async function getProductById(id: string) {
  try {
    // Consulta GraphQL para obtener un producto específico
    const query = `
      query {
        product(id: "gid://shopify/Product/${id}") {
          id
          title
          description
          productType
          vendor
          status
          publishedAt
          handle
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
                sku
                barcode
                inventoryQuantity
                inventoryPolicy
                weight
                weightUnit
              }
            }
          }
          metafields(first: 10) {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e: any) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.product) {
      throw new Error(`No se pudo encontrar el producto con ID ${id}`)
    }

    // Transformar el producto
    return transformShopifyProduct(response.data.product)
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error)
    throw error
  }
}

/**
 * Busca productos en Shopify
 * @param query Término de búsqueda
 * @param limit Número máximo de productos a obtener
 * @returns Array de productos que coinciden con la búsqueda
 */
export async function searchProducts(query: string, limit = 20) {
  try {
    // Consulta GraphQL para buscar productos
    const graphqlQuery = `
      query {
        products(first: ${limit}, query: "${query}") {
          edges {
            node {
              id
              title
              description
              productType
              vendor
              status
              publishedAt
              handle
              tags
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
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

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({ query: graphqlQuery })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e: any) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.products) {
      throw new Error("No se pudieron obtener resultados de búsqueda")
    }

    // Transformar los productos
    const products = response.data.products.edges.map((edge: any) => edge.node)
    return products.map((product: any) => transformShopifyProduct(product))
  } catch (error) {
    console.error(`Error al buscar productos con término "${query}":`, error)
    throw error
  }
}
