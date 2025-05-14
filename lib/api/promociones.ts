import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todas las promociones
export async function fetchPromociones() {
  try {
    // Consulta para obtener los IDs y tipos de descuentos
    const query = gql`
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              __typename
              ... on DiscountAutomaticNode {
                automaticDiscount {
                  __typename
                  title
                  startsAt
                  endsAt
                  status
                  summary
                }
              }
              ... on DiscountCodeNode {
                codeDiscount {
                  __typename
                  title
                  startsAt
                  endsAt
                  status
                  summary
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
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    // Transformar los datos al formato esperado por la aplicación
    const promotions = data.discountNodes.edges.map((edge) => {
      const node = edge.node
      let promotion = {
        id: node.id,
        title: "Promoción sin título",
        code: null,
        isAutomatic: node.__typename === "DiscountAutomaticNode",
        startsAt: new Date().toISOString(),
        endsAt: null,
        status: "active",
        valueType: "percentage",
        value: 10,
        summary: "",
        target: "CART",
      }

      if (node.__typename === "DiscountAutomaticNode" && node.automaticDiscount) {
        promotion = {
          ...promotion,
          title: node.automaticDiscount.title || "Promoción automática",
          startsAt: node.automaticDiscount.startsAt || new Date().toISOString(),
          endsAt: node.automaticDiscount.endsAt || null,
          status: node.automaticDiscount.status || "active",
          summary: node.automaticDiscount.summary || "",
        }
      } else if (node.__typename === "DiscountCodeNode" && node.codeDiscount) {
        const code = node.codeDiscount.codes?.edges?.[0]?.node?.code || ""
        promotion = {
          ...promotion,
          title: node.codeDiscount.title || "Promoción con código",
          startsAt: node.codeDiscount.startsAt || new Date().toISOString(),
          endsAt: node.codeDiscount.endsAt || null,
          status: node.codeDiscount.status || "active",
          summary: node.codeDiscount.summary || "",
          code,
        }
      }

      return promotion
    })

    return promotions
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al obtener promociones: ${error.message}`)
  }
}
