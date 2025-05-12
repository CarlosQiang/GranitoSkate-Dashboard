import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todas las promociones
export async function fetchPromotions() {
  try {
    const query = gql`
      query {
        codeDiscountNodes(first: 50) {
          edges {
            node {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
                  summary
                  status
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  startsAt
                  endsAt
                  customerSelection {
                    all
                  }
                  customerGets {
                    value {
                      ... on DiscountPercentage {
                        percentage
                      }
                      ... on DiscountAmount {
                        amount {
                          amount
                          currencyCode
                        }
                      }
                    }
                    items {
                      ... on DiscountProducts {
                        products(first: 5) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on DiscountCollections {
                        collections(first: 5) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on AllDiscountItems {
                        all
                      }
                    }
                  }
                }
                ... on DiscountCodeBxgy {
                  title
                  summary
                  status
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  startsAt
                  endsAt
                  customerSelection {
                    all
                  }
                  customerBuys {
                    value {
                      quantity
                    }
                    items {
                      ... on DiscountProducts {
                        products(first: 5) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on DiscountCollections {
                        collections(first: 5) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on AllDiscountItems {
                        all
                      }
                    }
                  }
                  customerGets {
                    value {
                      ... on DiscountPercentage {
                        percentage
                      }
                      ... on DiscountAmount {
                        amount {
                          amount
                          currencyCode
                        }
                      }
                    }
                    items {
                      ... on DiscountProducts {
                        products(first: 5) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on DiscountCollections {
                        collections(first: 5) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on AllDiscountItems {
                        all
                      }
                    }
                  }
                }
                ... on DiscountCodeFreeShipping {
                  title
                  summary
                  status
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  startsAt
                  endsAt
                  customerSelection {
                    all
                  }
                  destinationSelection {
                    all
                  }
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      subtotal {
                        amount
                        currencyCode
                      }
                    }
                    ... on DiscountMinimumQuantity {
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.codeDiscountNodes.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al cargar promociones: ${error.message}`)
  }
}

// Función para obtener una promoción por ID
export async function fetchPromotionById(id) {
  try {
    const query = gql`
      query GetPromotion($id: ID!) {
        codeDiscountNode(id: $id) {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              summary
              status
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              startsAt
              endsAt
              customerSelection {
                all
              }
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                  ... on DiscountAmount {
                    amount {
                      amount
                      currencyCode
                    }
                  }
                }
                items {
                  ... on DiscountProducts {
                    products(first: 20) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 20) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on AllDiscountItems {
                    all
                  }
                }
              }
            }
            ... on DiscountCodeBxgy {
              title
              summary
              status
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              startsAt
              endsAt
              customerSelection {
                all
              }
              customerBuys {
                value {
                  quantity
                }
                items {
                  ... on DiscountProducts {
                    products(first: 20) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 20) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on AllDiscountItems {
                    all
                  }
                }
              }
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                  ... on DiscountAmount {
                    amount {
                      amount
                      currencyCode
                    }
                  }
                }
                items {
                  ... on DiscountProducts {
                    products(first: 20) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 20) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on AllDiscountItems {
                    all
                  }
                }
              }
            }
            ... on DiscountCodeFreeShipping {
              title
              summary
              status
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              startsAt
              endsAt
              customerSelection {
                all
              }
              destinationSelection {
                all
              }
              minimumRequirement {
                ... on DiscountMinimumSubtotal {
                  subtotal {
                    amount
                    currencyCode
                  }
                }
                ... on DiscountMinimumQuantity {
                  quantity
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)
    return data.codeDiscountNode
  } catch (error) {
    console.error(`Error fetching promotion with ID ${id}:`, error)
    throw new Error(`Error al cargar la promoción: ${error.message}`)
  }
}

// Función para crear una nueva promoción de descuento básico
export async function createBasicDiscount(discountData) {
  try {
    const mutation = gql`
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                status
                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
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

    const variables = {
      basicCodeDiscount: discountData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeBasicCreate.userErrors[0].message)
    }

    return data.discountCodeBasicCreate.codeDiscountNode
  } catch (error) {
    console.error("Error creating basic discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para crear una nueva promoción de compra X, obtén Y
export async function createBxgyDiscount(discountData) {
  try {
    const mutation = gql`
      mutation discountCodeBxgyCreate($bxgyCodeDiscount: DiscountCodeBxgyInput!) {
        discountCodeBxgyCreate(bxgyCodeDiscount: $bxgyCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBxgy {
                title
                status
                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
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

    const variables = {
      bxgyCodeDiscount: discountData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeBxgyCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeBxgyCreate.userErrors[0].message)
    }

    return data.discountCodeBxgyCreate.codeDiscountNode
  } catch (error) {
    console.error("Error creating BXGY discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para crear una nueva promoción de envío gratuito
export async function createFreeShippingDiscount(discountData) {
  try {
    const mutation = gql`
      mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
        discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeFreeShipping {
                title
                status
                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
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

    const variables = {
      freeShippingCodeDiscount: discountData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeFreeShippingCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeFreeShippingCreate.userErrors[0].message)
    }

    return data.discountCodeFreeShippingCreate.codeDiscountNode
  } catch (error) {
    console.error("Error creating free shipping discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para actualizar una promoción
export async function updatePromotion(id, discountData, type = "BASIC") {
  try {
    let mutation
    let variables

    if (type === "BASIC") {
      mutation = gql`
        mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      variables = {
        id,
        basicCodeDiscount: discountData,
      }
    } else if (type === "BXGY") {
      mutation = gql`
        mutation discountCodeBxgyUpdate($id: ID!, $bxgyCodeDiscount: DiscountCodeBxgyInput!) {
          discountCodeBxgyUpdate(id: $id, bxgyCodeDiscount: $bxgyCodeDiscount) {
            codeDiscountNode {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      variables = {
        id,
        bxgyCodeDiscount: discountData,
      }
    } else if (type === "FREE_SHIPPING") {
      mutation = gql`
        mutation discountCodeFreeShippingUpdate($id: ID!, $freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
          discountCodeFreeShippingUpdate(id: $id, freeShippingCodeDiscount: $freeShippingCodeDiscount) {
            codeDiscountNode {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      variables = {
        id,
        freeShippingCodeDiscount: discountData,
      }
    } else {
      throw new Error("Tipo de promoción no válido")
    }

    const data = await shopifyClient.request(mutation, variables)

    const resultKey = `discountCode${type.charAt(0) + type.slice(1).toLowerCase()}Update`

    if (data[resultKey].userErrors.length > 0) {
      throw new Error(data[resultKey].userErrors[0].message)
    }

    return data[resultKey].codeDiscountNode
  } catch (error) {
    console.error(`Error updating promotion with ID ${id}:`, error)
    throw new Error(`Error al actualizar la promoción: ${error.message}`)
  }
}

// Función para eliminar una promoción
export async function deletePromotion(id) {
  try {
    const mutation = gql`
      mutation discountCodeDelete($id: ID!) {
        discountCodeDelete(id: $id) {
          deletedCodeDiscountId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeDelete.userErrors.length > 0) {
      throw new Error(data.discountCodeDelete.userErrors[0].message)
    }

    return data.discountCodeDelete.deletedCodeDiscountId
  } catch (error) {
    console.error(`Error deleting promotion with ID ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

// Función para activar una promoción
export async function activatePromotion(id) {
  try {
    const mutation = gql`
      mutation discountCodeActivate($id: ID!) {
        discountCodeActivate(id: $id) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                status
              }
              ... on DiscountCodeBxgy {
                status
              }
              ... on DiscountCodeFreeShipping {
                status
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeActivate.userErrors.length > 0) {
      throw new Error(data.discountCodeActivate.userErrors[0].message)
    }

    return data.discountCodeActivate.codeDiscountNode
  } catch (error) {
    console.error(`Error activating promotion with ID ${id}:`, error)
    throw new Error(`Error al activar la promoción: ${error.message}`)
  }
}

// Función para desactivar una promoción
export async function deactivatePromotion(id) {
  try {
    const mutation = gql`
      mutation discountCodeDeactivate($id: ID!) {
        discountCodeDeactivate(id: $id) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                status
              }
              ... on DiscountCodeBxgy {
                status
              }
              ... on DiscountCodeFreeShipping {
                status
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeDeactivate.userErrors.length > 0) {
      throw new Error(data.discountCodeDeactivate.userErrors[0].message)
    }

    return data.discountCodeDeactivate.codeDiscountNode
  } catch (error) {
    console.error(`Error deactivating promotion with ID ${id}:`, error)
    throw new Error(`Error al desactivar la promoción: ${error.message}`)
  }
}
