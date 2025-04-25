"use server"

import { revalidatePath } from "next/cache"
import { shopifyClient } from "./shopify-client"

// Productos
export async function getProductById(id: string) {
  try {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          descriptionHtml
          status
          productType
          vendor
          tags
          seo {
            title
            description
          }
        }
      }
    `

    const variables = {
      id: `gid://shopify/Product/${id}`,
    }

    const response = await shopifyClient.request(query, variables)
    const product = response.product

    return {
      ...product,
      id: product.id.split("/").pop(),
    }
  } catch (error) {
    console.error("Error al obtener producto:", error)
    throw new Error("Error al obtener producto")
  }
}

export async function createProduct(data: any) {
  try {
    const mutation = `
      mutation productCreate($input: ProductInput!) {
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

    const variables = {
      input: {
        title: data.title,
        descriptionHtml: data.description,
        status: data.status || "ACTIVE",
        productType: data.productType || "",
        vendor: data.vendor || "",
        tags: data.tags ? data.tags.split(",").map((tag: string) => tag.trim()) : [],
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description?.substring(0, 160) || "",
        },
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.productCreate.userErrors.length > 0) {
      throw new Error(response.productCreate.userErrors[0].message)
    }

    revalidatePath("/dashboard/productos")
    return {
      id: response.productCreate.product.id.split("/").pop(),
      title: response.productCreate.product.title,
    }
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw new Error("Error al crear producto")
  }
}

export async function updateProduct(id: string, data: any) {
  try {
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
        id: `gid://shopify/Product/${id}`,
        title: data.title,
        descriptionHtml: data.description,
        status: data.status,
        productType: data.productType || "",
        vendor: data.vendor || "",
        tags: data.tags ? data.tags.split(",").map((tag: string) => tag.trim()) : [],
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description?.substring(0, 160) || "",
        },
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.productUpdate.userErrors.length > 0) {
      throw new Error(response.productUpdate.userErrors[0].message)
    }

    revalidatePath("/dashboard/productos")
    revalidatePath(`/dashboard/productos/${id}`)
    return {
      id: response.productUpdate.product.id.split("/").pop(),
      title: response.productUpdate.product.title,
    }
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    throw new Error("Error al actualizar producto")
  }
}

export async function deleteProduct(id: string) {
  try {
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
        id: `gid://shopify/Product/${id}`,
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.productDelete.userErrors.length > 0) {
      throw new Error(response.productDelete.userErrors[0].message)
    }

    revalidatePath("/dashboard/productos")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    throw new Error("Error al eliminar producto")
  }
}

// Colecciones
export async function getCollectionById(id: string) {
  try {
    const query = `
      query getCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          descriptionHtml
          seo {
            title
            description
          }
        }
      }
    `

    const variables = {
      id: `gid://shopify/Collection/${id}`,
    }

    const response = await shopifyClient.request(query, variables)
    const collection = response.collection

    return {
      ...collection,
      id: collection.id.split("/").pop(),
    }
  } catch (error) {
    console.error("Error al obtener colección:", error)
    throw new Error("Error al obtener colección")
  }
}

export async function createCollection(data: any) {
  try {
    const mutation = `
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
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
        title: data.title,
        descriptionHtml: data.description,
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description?.substring(0, 160) || "",
        },
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.collectionCreate.userErrors.length > 0) {
      throw new Error(response.collectionCreate.userErrors[0].message)
    }

    revalidatePath("/dashboard/colecciones")
    return {
      id: response.collectionCreate.collection.id.split("/").pop(),
      title: response.collectionCreate.collection.title,
    }
  } catch (error) {
    console.error("Error al crear colección:", error)
    throw new Error("Error al crear colección")
  }
}

export async function updateCollection(id: string, data: any) {
  try {
    const mutation = `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
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
        id: `gid://shopify/Collection/${id}`,
        title: data.title,
        descriptionHtml: data.description,
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.description?.substring(0, 160) || "",
        },
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.collectionUpdate.userErrors.length > 0) {
      throw new Error(response.collectionUpdate.userErrors[0].message)
    }

    revalidatePath("/dashboard/colecciones")
    revalidatePath(`/dashboard/colecciones/${id}`)
    return {
      id: response.collectionUpdate.collection.id.split("/").pop(),
      title: response.collectionUpdate.collection.title,
    }
  } catch (error) {
    console.error("Error al actualizar colección:", error)
    throw new Error("Error al actualizar colección")
  }
}

export async function deleteCollection(id: string) {
  try {
    const mutation = `
      mutation collectionDelete($input: CollectionDeleteInput!) {
        collectionDelete(input: $input) {
          deletedCollectionId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: `gid://shopify/Collection/${id}`,
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.collectionDelete.userErrors.length > 0) {
      throw new Error(response.collectionDelete.userErrors[0].message)
    }

    revalidatePath("/dashboard/colecciones")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar colección:", error)
    throw new Error("Error al eliminar colección")
  }
}

// Clientes
export async function getCustomerById(id: string) {
  try {
    const query = `
      query getCustomer($id: ID!) {
        customer(id: $id) {
          id
          firstName
          lastName
          email
          phone
          defaultAddress {
            address1
            address2
            city
            province
            country
            zip
          }
          orders(first: 5) {
            edges {
              node {
                id
                name
                totalPrice {
                  amount
                  currencyCode
                }
                processedAt
                fulfillmentStatus
                financialStatus
              }
            }
          }
          note
          tags
        }
      }
    `

    const variables = {
      id: `gid://shopify/Customer/${id}`,
    }

    const response = await shopifyClient.request(query, variables)
    const customer = response.customer

    return {
      ...customer,
      id: customer.id.split("/").pop(),
      orders: customer.orders.edges.map((edge: any) => ({
        ...edge.node,
        id: edge.node.id.split("/").pop(),
      })),
    }
  } catch (error) {
    console.error("Error al obtener cliente:", error)
    throw new Error("Error al obtener cliente")
  }
}

// Pedidos
export async function getOrderById(id: string) {
  try {
    const query = `
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          customer {
            id
            firstName
            lastName
            email
          }
          shippingAddress {
            address1
            address2
            city
            province
            country
            zip
          }
          lineItems(first: 20) {
            edges {
              node {
                title
                quantity
                originalUnitPrice {
                  amount
                  currencyCode
                }
                variant {
                  title
                  sku
                  image {
                    url
                  }
                }
              }
            }
          }
          totalPrice {
            amount
            currencyCode
          }
          subtotalPrice {
            amount
            currencyCode
          }
          totalShippingPrice {
            amount
            currencyCode
          }
          totalTax {
            amount
            currencyCode
          }
          processedAt
          fulfillmentStatus
          financialStatus
          note
          tags
        }
      }
    `

    const variables = {
      id: `gid://shopify/Order/${id}`,
    }

    const response = await shopifyClient.request(query, variables)
    const order = response.order

    return {
      ...order,
      id: order.id.split("/").pop(),
      customer: order.customer
        ? {
            ...order.customer,
            id: order.customer.id.split("/").pop(),
          }
        : null,
      lineItems: order.lineItems.edges.map((edge: any) => edge.node),
    }
  } catch (error) {
    console.error("Error al obtener pedido:", error)
    throw new Error("Error al obtener pedido")
  }
}
