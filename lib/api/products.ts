import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export interface ProductFilters {
  query?: string
  status?: string
  productType?: string
  vendor?: string
  sortKey?: string
  reverse?: boolean
  first?: number
  after?: string | null
}

export async function fetchProducts(filters: ProductFilters = {}) {
  try {
    const {
      query = "",
      status,
      productType,
      vendor,
      sortKey = "CREATED_AT",
      reverse = false,
      first = 20,
      after = null,
    } = filters

    // Construir la query de búsqueda
    let searchQuery = query
    if (status) {
      searchQuery += ` status:${status}`
    }
    if (productType) {
      searchQuery += ` product_type:${productType}`
    }
    if (vendor) {
      searchQuery += ` vendor:${vendor}`
    }

    const graphqlQuery = gql`
      query GetProducts($query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $first: Int, $after: String) {
        products(query: $query, sortKey: $sortKey, reverse: $reverse, first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              title
              description
              handle
              status
              productType
              vendor
              tags
              createdAt
              updatedAt
              publishedAt
              featuredImage {
                url
                altText
              }
              images(first: 5) {
                edges {
                  node {
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
                    availableForSale
                  }
                }
              }
              collections(first: 5) {
                edges {
                  node {
                    id
                    title
                    handle
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
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      query: searchQuery.trim(),
      sortKey,
      reverse,
      first,
      after,
    }

    const data = await shopifyClient.request(graphqlQuery, variables)

    if (!data || !data.products) {
      console.warn("No se encontraron datos de productos en la respuesta")
      return {
        products: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      }
    }

    if (!data.products.edges || !Array.isArray(data.products.edges)) {
      console.warn("Los datos de productos no tienen la estructura esperada")
      return {
        products: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      }
    }

    return {
      products: data.products.edges.map((edge: any) => ({
        id: edge.node.id.split("/").pop(),
        title: edge.node.title,
        description: edge.node.description,
        handle: edge.node.handle,
        status: edge.node.status,
        productType: edge.node.productType,
        vendor: edge.node.vendor,
        tags: edge.node.tags,
        createdAt: edge.node.createdAt,
        updatedAt: edge.node.updatedAt,
        publishedAt: edge.node.publishedAt,
        featuredImage: edge.node.featuredImage,
        images: edge.node.images?.edges?.map((imgEdge: any) => imgEdge.node) || [],
        variants:
          edge.node.variants?.edges?.map((varEdge: any) => ({
            id: varEdge.node.id.split("/").pop(),
            title: varEdge.node.title,
            price: varEdge.node.price,
            compareAtPrice: varEdge.node.compareAtPrice,
            sku: varEdge.node.sku,
            barcode: varEdge.node.barcode,
            inventoryQuantity: varEdge.node.inventoryQuantity,
            inventoryPolicy: varEdge.node.inventoryPolicy,
            weight: varEdge.node.weight,
            weightUnit: varEdge.node.weightUnit,
            availableForSale: varEdge.node.availableForSale,
          })) || [],
        collections:
          edge.node.collections?.edges?.map((colEdge: any) => ({
            id: colEdge.node.id.split("/").pop(),
            title: colEdge.node.title,
            handle: colEdge.node.handle,
          })) || [],
        metafields:
          edge.node.metafields?.edges?.map((metaEdge: any) => ({
            id: metaEdge.node.id,
            namespace: metaEdge.node.namespace,
            key: metaEdge.node.key,
            value: metaEdge.node.value,
          })) || [],
        cursor: edge.cursor,
      })),
      pageInfo: data.products.pageInfo || { hasNextPage: false, endCursor: null },
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error(`Error al obtener productos: ${(error as Error).message}`)
  }
}

export async function fetchProductById(id: string) {
  try {
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Product/${id}`
    }

    const query = gql`
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          handle
          status
          productType
          vendor
          tags
          createdAt
          updatedAt
          publishedAt
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
                inventoryPolicy
                weight
                weightUnit
                availableForSale
              }
            }
          }
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
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
              }
            }
          }
        }
      }
    `

    const variables = { id: formattedId }
    const data = await shopifyClient.request(query, variables)

    if (!data || !data.product) {
      throw new Error(`Producto no encontrado: ${id}`)
    }

    return {
      id: data.product.id.split("/").pop(),
      title: data.product.title,
      description: data.product.description,
      handle: data.product.handle,
      status: data.product.status,
      productType: data.product.productType,
      vendor: data.product.vendor,
      tags: data.product.tags,
      createdAt: data.product.createdAt,
      updatedAt: data.product.updatedAt,
      publishedAt: data.product.publishedAt,
      featuredImage: data.product.featuredImage,
      images: data.product.images?.edges?.map((edge: any) => edge.node) || [],
      variants:
        data.product.variants?.edges?.map((edge: any) => ({
          id: edge.node.id.split("/").pop(),
          title: edge.node.title,
          price: edge.node.price,
          compareAtPrice: edge.node.compareAtPrice,
          sku: edge.node.sku,
          barcode: edge.node.barcode,
          inventoryQuantity: edge.node.inventoryQuantity,
          inventoryPolicy: edge.node.inventoryPolicy,
          weight: edge.node.weight,
          weightUnit: edge.node.weightUnit,
          availableForSale: edge.node.availableForSale,
        })) || [],
      collections:
        data.product.collections?.edges?.map((edge: any) => ({
          id: edge.node.id.split("/").pop(),
          title: edge.node.title,
          handle: edge.node.handle,
        })) || [],
      metafields:
        data.product.metafields?.edges?.map((edge: any) => ({
          id: edge.node.id,
          namespace: edge.node.namespace,
          key: edge.node.key,
          value: edge.node.value,
        })) || [],
    }
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw new Error(`Error al cargar producto: ${(error as Error).message}`)
  }
}

export async function updateProduct(id: string, productData: any) {
  try {
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Product/${id}`
    }

    const mutation = gql`
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            description
            status
            productType
            vendor
            tags
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
      description: productData.description,
      productType: productData.productType,
      vendor: productData.vendor,
      tags: productData.tags,
      status: productData.status,
    }

    const variables = { input }
    const result = await shopifyClient.request(mutation, variables)

    if (result.productUpdate.userErrors && result.productUpdate.userErrors.length > 0) {
      throw new Error(result.productUpdate.userErrors[0].message)
    }

    return result.productUpdate.product
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw new Error(`Error al actualizar producto: ${(error as Error).message}`)
  }
}

export async function deleteProduct(id: string) {
  try {
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/Product/${id}`
    }

    const mutation = gql`
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
      input: { id: formattedId },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.productDelete.userErrors && result.productDelete.userErrors.length > 0) {
      throw new Error(result.productDelete.userErrors[0].message)
    }

    return { success: true, id: result.productDelete.deletedProductId }
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw new Error(`Error al eliminar producto: ${(error as Error).message}`)
  }
}

export async function createProduct(productData: any) {
  try {
    const mutation = gql`
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            description
            status
            productType
            vendor
            tags
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
      description: productData.description,
      productType: productData.productType,
      vendor: productData.vendor,
      tags: productData.tags,
      status: productData.status || "DRAFT",
    }

    const variables = { input }
    const result = await shopifyClient.request(mutation, variables)

    if (result.productCreate.userErrors && result.productCreate.userErrors.length > 0) {
      throw new Error(result.productCreate.userErrors[0].message)
    }

    const fullId = result.productCreate.product.id
    const newProductId = fullId.split("/").pop()

    return {
      id: newProductId,
      ...result.productCreate.product,
    }
  } catch (error) {
    console.error("Error creating product:", error)
    throw new Error(`Error al crear producto: ${(error as Error).message}`)
  }
}

export async function getInventoryLevel(variantId: string) {
  try {
    let formattedId = variantId
    if (!variantId.includes("gid://shopify/")) {
      formattedId = `gid://shopify/ProductVariant/${variantId}`
    }

    const query = gql`
      query GetInventoryLevel($id: ID!) {
        productVariant(id: $id) {
          id
          inventoryQuantity
          inventoryPolicy
          availableForSale
        }
      }
    `

    const variables = { id: formattedId }
    const data = await shopifyClient.request(query, variables)

    if (!data || !data.productVariant) {
      throw new Error(`Variante no encontrada: ${variantId}`)
    }

    return {
      id: data.productVariant.id.split("/").pop(),
      inventoryQuantity: data.productVariant.inventoryQuantity,
      inventoryPolicy: data.productVariant.inventoryPolicy,
      availableForSale: data.productVariant.availableForSale,
    }
  } catch (error) {
    console.error(`Error getting inventory level for variant ${variantId}:`, error)
    throw new Error(`Error al obtener nivel de inventario: ${(error as Error).message}`)
  }
}

export async function updateInventoryLevel(variantId: string, quantity: number) {
  try {
    let formattedId = variantId
    if (!variantId.includes("gid://shopify/")) {
      formattedId = `gid://shopify/ProductVariant/${variantId}`
    }

    const mutation = gql`
      mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
        inventoryAdjustQuantity(input: $input) {
          inventoryLevel {
            id
            available
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Primero necesitamos obtener el inventory item ID
    const variantQuery = gql`
      query GetVariantInventory($id: ID!) {
        productVariant(id: $id) {
          id
          inventoryItem {
            id
          }
        }
      }
    `

    const variantData = await shopifyClient.request(variantQuery, { id: formattedId })

    if (!variantData || !variantData.productVariant || !variantData.productVariant.inventoryItem) {
      throw new Error(`No se pudo obtener el inventory item para la variante: ${variantId}`)
    }

    const inventoryItemId = variantData.productVariant.inventoryItem.id

    const variables = {
      input: {
        inventoryItemId,
        availableDelta: quantity,
      },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.inventoryAdjustQuantity.userErrors && result.inventoryAdjustQuantity.userErrors.length > 0) {
      throw new Error(result.inventoryAdjustQuantity.userErrors[0].message)
    }

    return result.inventoryAdjustQuantity.inventoryLevel
  } catch (error) {
    console.error(`Error updating inventory level for variant ${variantId}:`, error)
    throw new Error(`Error al actualizar nivel de inventario: ${(error as Error).message}`)
  }
}

export async function fetchLowStockProducts(threshold = 10) {
  try {
    const query = gql`
      query GetLowStockProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              status
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
                    inventoryQuantity
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = { first: 100 }
    const data = await shopifyClient.request(query, variables)

    if (!data || !data.products || !data.products.edges) {
      return []
    }

    // Filtrar productos con stock bajo
    const lowStockProducts = data.products.edges
      .map((edge: any) => {
        const product = edge.node
        const variants = product.variants?.edges?.map((varEdge: any) => varEdge.node) || []

        // Encontrar variantes con stock bajo
        const lowStockVariants = variants.filter(
          (variant: any) => variant.inventoryQuantity !== null && variant.inventoryQuantity <= threshold,
        )

        if (lowStockVariants.length > 0) {
          return {
            id: product.id.split("/").pop(),
            title: product.title,
            status: product.status,
            featuredImage: product.featuredImage,
            variants: lowStockVariants.map((variant: any) => ({
              id: variant.id.split("/").pop(),
              title: variant.title,
              price: variant.price,
              inventoryQuantity: variant.inventoryQuantity,
              availableForSale: variant.availableForSale,
            })),
            lowestStock: Math.min(...lowStockVariants.map((v: any) => v.inventoryQuantity)),
          }
        }
        return null
      })
      .filter(Boolean)

    return lowStockProducts
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    throw new Error(`Error al obtener productos con stock bajo: ${(error as Error).message}`)
  }
}
