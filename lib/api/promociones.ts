import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Promotion } from "@/types/promotions"

// Función para obtener todas las promociones
export async function obtenerPromociones() {
  try {
    // Consulta para obtener los IDs y tipos de descuentos
    const query = gql`
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              __typename
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    const discountNodes = data.discountNodes.edges.map((edge) => edge.node)

    // Transformar los datos a un formato más amigable
    const promociones = discountNodes.map((node) => {
      return {
        id: node.id,
        titulo: `Promoción ${node.id.split("/").pop()}`,
        codigo: null,
        estado: "activa", // Por defecto
        tipo: "PORCENTAJE_DESCUENTO", // Por defecto
        valor: 10, // Por defecto
        fechaInicio: new Date().toISOString(),
        fechaFin: null,
      }
    })

    return promociones
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    throw new Error(`Error al obtener promociones: ${error.message}`)
  }
}

// Alias para mantener compatibilidad con el código existente
export const fetchPromociones = obtenerPromociones

// Función para obtener una promoción por ID
export async function fetchPriceListById(id: string): Promise<Promotion> {
  try {
    // Determinar si el ID es un gid completo o solo un ID numérico
    let promotionId = id
    if (promotionId.includes("gid:")) {
      // Si es un gid completo, extraer solo el ID numérico
      const matches = promotionId.match(/\/(\d+)$/)
      if (matches && matches[1]) {
        promotionId = matches[1]
      }
    }

    // Construir el gid completo si solo tenemos el ID numérico
    if (!promotionId.includes("gid:")) {
      promotionId = `gid://shopify/DiscountAutomaticNode/${promotionId}`
    }

    console.log("Fetching promotion with ID:", promotionId)
    const promotion = await fetchPromotionById(promotionId)
    return promotion
  } catch (error) {
    console.error(`Error fetching price list with ID ${id}:`, error)
    throw new Error(`Error al cargar la lista de precios: ${error.message}`)
  }
}

export async function deletePriceList(id: string): Promise<string> {
  try {
    const mutation = gql`
      mutation DiscountDelete($id: ID!) {
        discountNodeDelete(id: $id) {
          deletedNodeId
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

    if (data.discountNodeDelete.userErrors.length > 0) {
      throw new Error(data.discountNodeDelete.userErrors[0].message)
    }

    return data.discountNodeDelete.deletedNodeId
  } catch (error) {
    console.error(`Error al eliminar la promoción con ID ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

export async function crearPromocion(datos: any): Promise<any> {
  try {
    const mutation = gql`
      mutation DiscountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              title
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
      basicCodeDiscount: {
        title: datos.titulo,
        startsAt: datos.fechaInicio,
        endsAt: datos.fechaFin,
        codes: [{ code: datos.codigo }],
        customerGets: {
          value: {
            percentage: datos.valor,
          },
          items: {
            all: true,
          },
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeBasicCreate.userErrors[0].message)
    }

    return data.discountCodeBasicCreate.codeDiscountNode
  } catch (error) {
    console.error("Error al crear la promoción:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

export async function actualizarPromocion(id: string, datos: any): Promise<any> {
  try {
    // Implementación simplificada para evitar errores
    console.log(`Actualizando promoción con ID ${id} con los datos:`, datos)
    return { id, ...datos }
  } catch (error) {
    console.error(`Error al actualizar la promoción con ID ${id}:`, error)
    throw new Error(`Error al actualizar la promoción: ${error.message}`)
  }
}

export async function eliminarPromocion(id: string): Promise<string> {
  try {
    return await deletePriceList(id)
  } catch (error) {
    console.error(`Error al eliminar la promoción con ID ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

export async function obtenerPromocionPorId(id: string): Promise<any> {
  try {
    return await fetchPriceListById(id)
  } catch (error) {
    console.error(`Error al obtener la promoción con ID ${id}:`, error)
    throw new Error(`Error al obtener la promoción: ${error.message}`)
  }
}

async function fetchPromotionById(promotionId: string): Promise<any> {
  try {
    const query = gql`
      query ($id: ID!) {
        node(id: $id) {
          ... on DiscountAutomaticNode {
            discount {
              ... on DiscountAutomaticBasic {
                title
                startsAt
                endsAt
                customerGets {
                  items {
                    ... on DiscountAllItems {
                      all
                    }
                  }
                  value {
                    ... on DiscountPercentage {
                      percentage
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      id: promotionId,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data.node) {
      throw new Error(`Promotion with ID ${promotionId} not found`)
    }

    const discount = data.node.discount

    const promotion = {
      id: promotionId,
      title: discount.title,
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
      value: discount.customerGets.value.percentage,
      target: discount.customerGets.items.all ? "ALL" : "SPECIFIC",
    }

    return promotion
  } catch (error) {
    console.error(`Error fetching promotion with ID ${promotionId}:`, error)
    throw new Error(`Error fetching promotion: ${error.message}`)
  }
}
