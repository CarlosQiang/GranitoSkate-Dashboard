import { shopifyFetch } from "@/lib/shopify"

export async function fetchProducts({ limit = 10, cursor = null, query = null, sortKey = "TITLE", reverse = false }) {
  try {
    console.log(`Fetching products with limit: ${limit}`)

    // Construir la consulta GraphQL
    const queryString = `
      query GetProducts($limit: Int!, $cursor: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
        products(first: $limit, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              status
              productType
              vendor
              tags
              featuredImage {
                url
                altText
              }
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    compareAtPrice
                    inventoryQuantity
                    availableForSale
                  }
                }
              }
              collections(first: 5) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    `

    console.log("Enviando consulta a Shopify...")

    // Realizar la consulta a la API de Shopify
    const response = await shopifyFetch({
      query: queryString,
      variables: {
        limit,
        cursor,
        query,
        sortKey,
        reverse,
      },
    })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    // Procesar los datos recibidos
    const products = response.data.products.edges.map((edge) => {
      const product = edge.node

      // Extraer el precio del primer variante
      const price = product.variants.edges[0]?.node.price || product.priceRangeV2?.minVariantPrice?.amount || "0.00"

      // Extraer las colecciones
      const collections =
        product.collections?.edges.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
        })) || []

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        status: product.status,
        productType: product.productType,
        vendor: product.vendor,
        tags: product.tags,
        image: product.featuredImage,
        price,
        inventoryQuantity: product.variants.edges[0]?.node.inventoryQuantity || 0,
        availableForSale: product.variants.edges[0]?.node.availableForSale || false,
        collections,
      }
    })

    console.log(`Successfully fetched ${products.length} products`)
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error(`Error al cargar productos: ${error.message}`)
  }
}

export async function fetchProductById(id) {
  try {
    // Si el ID no incluye el prefijo gid://, añadirlo
    let fullId = id
    if (!id.includes("gid://")) {
      fullId = `gid://shopify/Product/${id}`
    }

    const queryString = `
      query GetProductById($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          description
          descriptionHtml
          status
          productType
          vendor
          tags
          featuredImage {
            url
            altText
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
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
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            id
            name
            values
          }
          collections(first: 10) {
            edges {
              node {
                id
                title
              }
            }
          }
          metafields(first: 20) {
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

    const response = await shopifyFetch({
      query: queryString,
      variables: {
        id: fullId,
      },
    })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    if (!response.data.product) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    const product = response.data.product

    // Procesar los datos del producto
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      descriptionHtml: product.descriptionHtml,
      status: product.status,
      productType: product.productType,
      vendor: product.vendor,
      tags: product.tags,
      featuredImage: product.featuredImage,
      images: product.images.edges.map((edge) => edge.node),
      price: product.priceRangeV2?.minVariantPrice?.amount || product.variants.edges[0]?.node.price || "0.00",
      currencyCode: product.priceRangeV2?.minVariantPrice?.currencyCode || "EUR",
      variants: product.variants.edges.map((edge) => edge.node),
      options: product.options,
      collections: product.collections.edges.map((edge) => edge.node),
      metafields: product.metafields.edges.map((edge) => edge.node),
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    throw new Error(`Error al cargar el producto: ${error.message}`)
  }
}

export async function updateProduct(id, data) {
  try {
    // Si el ID no incluye el prefijo gid://, añadirlo
    let fullId = id
    if (!id.includes("gid://")) {
      fullId = `gid://shopify/Product/${id}`
    }

    const input = {
      id: fullId,
      ...data,
    }

    const queryString = `
      mutation UpdateProduct($input: ProductInput!) {
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
      query: queryString,
      variables: {
        input,
      },
    })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    if (response.data.productUpdate.userErrors.length > 0) {
      throw new Error(response.data.productUpdate.userErrors[0].message)
    }

    return response.data.productUpdate.product
  } catch (error) {
    console.error("Error updating product:", error)
    throw new Error(`Error al actualizar el producto: ${error.message}`)
  }
}

export async function deleteProduct(id) {
  try {
    // Si el ID no incluye el prefijo gid://, añadirlo
    let fullId = id
    if (!id.includes("gid://")) {
      fullId = `gid://shopify/Product/${id}`
    }

    const queryString = `
      mutation DeleteProduct($id: ID!) {
        productDelete(input: {id: $id}) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: queryString,
      variables: {
        id: fullId,
      },
    })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    if (response.data.productDelete.userErrors.length > 0) {
      throw new Error(response.data.productDelete.userErrors[0].message)
    }

    return response.data.productDelete.deletedProductId
  } catch (error) {
    console.error("Error deleting product:", error)
    throw new Error(`Error al eliminar el producto: ${error.message}`)
  }
}
