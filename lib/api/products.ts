import { shopifyFetch } from "@/lib/shopify"

export interface Product {
  id: string
  title: string
  description: string
  handle: string
  status: string
  totalInventory: number
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
    maxVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  images: {
    edges: {
      node: {
        id: string
        url: string
        altText: string
      }
    }[]
  }
  variants: {
    edges: {
      node: {
        id: string
        title: string
        price: string
        inventoryQuantity: number
      }
    }[]
  }
  seo: {
    title: string
    description: string
  }
}

// Consulta para obtener productos
const GET_PRODUCTS = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          description
          handle
          status
          totalInventory
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                price
                inventoryQuantity
              }
            }
          }
          seo {
            title
            description
          }
        }
      }
    }
  }
`

// Función para obtener productos
export async function getProducts(
  first = 10,
  after?: string,
): Promise<{
  products: Product[]
  pageInfo: { hasNextPage: boolean; endCursor: string }
}> {
  try {
    const data = await shopifyFetch({
      query: GET_PRODUCTS,
      variables: { first, after },
    })

    const products = data.products.edges.map((edge: any) => edge.node)
    const pageInfo = data.products.pageInfo

    return { products, pageInfo }
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Consulta para obtener un producto por ID
const GET_PRODUCT_BY_ID = `
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      title
      description
      handle
      status
      totalInventory
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
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
      variants(first: 20) {
        edges {
          node {
            id
            title
            price
            inventoryQuantity
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
`

// Función para obtener un producto por ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const data = await shopifyFetch({
      query: GET_PRODUCT_BY_ID,
      variables: { id },
    })

    return data.product
  } catch (error) {
    console.error("Error al obtener el producto:", error)
    throw error
  }
}

// Consulta para crear un producto
const CREATE_PRODUCT = `
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

// Función para crear un producto
export async function createProduct(productData: {
  title: string
  description: string
  variants: { price: string }[]
  seo?: { title?: string; description?: string }
}): Promise<any> {
  try {
    const data = await shopifyFetch({
      query: CREATE_PRODUCT,
      variables: {
        input: productData,
      },
    })

    if (data.productCreate.userErrors.length > 0) {
      throw new Error(data.productCreate.userErrors[0].message)
    }

    return data.productCreate.product
  } catch (error) {
    console.error("Error al crear el producto:", error)
    throw error
  }
}

// Consulta para actualizar un producto
const UPDATE_PRODUCT = `
  mutation productUpdate($input: ProductInput!) {
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

// Función para actualizar un producto
export async function updateProduct(
  id: string,
  productData: {
    title?: string
    description?: string
    seo?: { title?: string; description?: string }
  },
): Promise<any> {
  try {
    const data = await shopifyFetch({
      query: UPDATE_PRODUCT,
      variables: {
        input: {
          id,
          ...productData,
        },
      },
    })

    if (data.productUpdate.userErrors.length > 0) {
      throw new Error(data.productUpdate.userErrors[0].message)
    }

    return data.productUpdate.product
  } catch (error) {
    console.error("Error al actualizar el producto:", error)
    throw error
  }
}

// Consulta para eliminar un producto
const DELETE_PRODUCT = `
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

// Función para eliminar un producto
export async function deleteProduct(id: string): Promise<string | null> {
  try {
    const data = await shopifyFetch({
      query: DELETE_PRODUCT,
      variables: {
        input: {
          id,
        },
      },
    })

    if (data.productDelete.userErrors.length > 0) {
      throw new Error(data.productDelete.userErrors[0].message)
    }

    return data.productDelete.deletedProductId
  } catch (error) {
    console.error("Error al eliminar el producto:", error)
    throw error
  }
}
