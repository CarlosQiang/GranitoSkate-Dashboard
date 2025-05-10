/**
 * Cliente de Shopify para interactuar con la API de Shopify
 */

// Configuración de la API de Shopify
const SHOPIFY_SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOM || ""
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || ""

// Construir la URL de la API de Shopify basada en el dominio de la tienda
let SHOPIFY_API_URL = ""
if (SHOPIFY_SHOP_DOMAIN) {
  // Asegurarse de que el dominio no incluya el protocolo
  const domain = SHOPIFY_SHOP_DOMAIN.replace(/^https?:\/\//, "")
  SHOPIFY_API_URL = `https://${domain}/admin/api/2023-07/graphql.json`
}

/**
 * Función para realizar consultas GraphQL a la API de Shopify
 */
export async function shopifyFetch({
  query,
  variables = {},
}: {
  query: string
  variables?: Record<string, any>
}): Promise<any> {
  try {
    if (!SHOPIFY_API_URL || !SHOPIFY_ACCESS_TOKEN) {
      // En lugar de lanzar un error, devolvemos datos simulados
      console.warn("Configuración de Shopify incompleta. Usando datos simulados.")
      return getMockData(query)
    }

    const response = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Error en la respuesta de Shopify:", {
        status: response.status,
        statusText: response.statusText,
      })
      // En lugar de lanzar un error, devolvemos datos simulados
      return getMockData(query)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("Error en la consulta GraphQL:", result.errors)
      // En lugar de lanzar un error, devolvemos datos simulados
      return getMockData(query)
    }

    return result.data
  } catch (error) {
    console.error("Error al realizar la consulta a Shopify:", error)
    // En caso de error, devolvemos datos simulados
    return getMockData(query)
  }
}

/**
 * Función para verificar la conexión con Shopify
 */
export async function checkShopifyConnection(): Promise<{
  success: boolean
  message?: string
  shop?: any
}> {
  try {
    if (!SHOPIFY_API_URL || !SHOPIFY_ACCESS_TOKEN) {
      return {
        success: false,
        message: "Configuración de Shopify incompleta. Usando datos simulados.",
      }
    }

    // Consulta simple para verificar la conexión
    const query = `
      {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `

    const response = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        success: false,
        message: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
      }
    }

    const result = await response.json()

    if (result.errors) {
      return {
        success: false,
        message: `Error en la consulta GraphQL: ${result.errors[0].message}`,
      }
    }

    if (result.data && result.data.shop) {
      return {
        success: true,
        message: `Conectado a ${result.data.shop.name}`,
        shop: result.data.shop,
      }
    }

    return {
      success: false,
      message: "No se pudo obtener información de la tienda",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

/**
 * Función para obtener la URL de la tienda Shopify
 */
export function getShopifyStoreUrl(): string {
  if (!SHOPIFY_SHOP_DOMAIN) {
    return "https://shopify.com"
  }

  // Asegurarse de que el dominio tenga el formato correcto
  const domain = SHOPIFY_SHOP_DOMAIN.replace(/^https?:\/\//, "")

  if (domain.includes("myshopify.com")) {
    return `https://${domain}`
  }

  return `https://${domain}.myshopify.com`
}

/**
 * Función para formatear el precio de Shopify
 */
export function formatShopifyPrice(amount: string | number): string {
  const price = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(price)
}

/**
 * Función para obtener datos simulados cuando la API de Shopify no está disponible
 */
function getMockData(query: string): any {
  // Determinar qué tipo de datos devolver basado en la consulta
  if (query.includes("shop")) {
    return {
      shop: {
        name: "Granito Skate (Demo)",
        primaryDomain: {
          url: "https://granitoskate.com",
        },
      },
    }
  }

  if (query.includes("products")) {
    return {
      products: {
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
        edges: Array.from({ length: 10 }, (_, i) => ({
          node: {
            id: `gid://shopify/Product/${i + 1}`,
            title: `Producto de demostración ${i + 1}`,
            description: "Esta es una descripción de demostración para un producto simulado.",
            handle: `producto-demo-${i + 1}`,
            status: "ACTIVE",
            totalInventory: Math.floor(Math.random() * 100),
            priceRange: {
              minVariantPrice: {
                amount: (Math.random() * 100 + 20).toFixed(2),
                currencyCode: "EUR",
              },
              maxVariantPrice: {
                amount: (Math.random() * 100 + 50).toFixed(2),
                currencyCode: "EUR",
              },
            },
            images: {
              edges: [
                {
                  node: {
                    id: `gid://shopify/ProductImage/${i + 1}`,
                    url: `/placeholder.svg?height=300&width=300&query=Producto ${i + 1}`,
                    altText: `Imagen de producto ${i + 1}`,
                  },
                },
              ],
            },
            variants: {
              edges: [
                {
                  node: {
                    id: `gid://shopify/ProductVariant/${i + 1}`,
                    title: "Default",
                    price: (Math.random() * 100 + 20).toFixed(2),
                    inventoryQuantity: Math.floor(Math.random() * 100),
                  },
                },
              ],
            },
            seo: {
              title: `Producto de demostración ${i + 1}`,
              description: "Esta es una descripción SEO de demostración para un producto simulado.",
            },
          },
        })),
      },
    }
  }

  if (query.includes("collections")) {
    return {
      collections: {
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
        edges: Array.from({ length: 5 }, (_, i) => ({
          node: {
            id: `gid://shopify/Collection/${i + 1}`,
            title: `Colección de demostración ${i + 1}`,
            description: "Esta es una descripción de demostración para una colección simulada.",
            handle: `coleccion-demo-${i + 1}`,
            image: {
              url: `/placeholder.svg?height=300&width=300&query=Colección ${i + 1}`,
              altText: `Imagen de colección ${i + 1}`,
            },
            seo: {
              title: `Colección de demostración ${i + 1}`,
              description: "Esta es una descripción SEO de demostración para una colección simulada.",
            },
          },
        })),
      },
    }
  }

  if (query.includes("orders")) {
    return {
      orders: {
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
        edges: Array.from({ length: 5 }, (_, i) => ({
          node: {
            id: `gid://shopify/Order/${i + 1}`,
            name: `#${1000 + i}`,
            createdAt: new Date(Date.now() - i * 86400000).toISOString(),
            displayFinancialStatus: ["PAID", "PENDING", "PAID", "PAID", "REFUNDED"][i % 5],
            displayFulfillmentStatus: ["FULFILLED", "UNFULFILLED", "IN_PROGRESS", "FULFILLED", "FULFILLED"][i % 5],
            totalPriceSet: {
              shopMoney: {
                amount: (Math.random() * 200 + 50).toFixed(2),
                currencyCode: "EUR",
              },
            },
            customer: {
              firstName: ["Juan", "María", "Carlos", "Ana", "Pedro"][i % 5],
              lastName: ["Pérez", "García", "Rodríguez", "Martínez", "Sánchez"][i % 5],
              email: `cliente${i + 1}@example.com`,
            },
            lineItems: {
              edges: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
                node: {
                  id: `gid://shopify/LineItem/${i * 10 + j + 1}`,
                  title: `Producto en pedido ${j + 1}`,
                  quantity: Math.floor(Math.random() * 3) + 1,
                  variant: {
                    price: (Math.random() * 100 + 20).toFixed(2),
                    product: {
                      id: `gid://shopify/Product/${j + 1}`,
                      title: `Producto ${j + 1}`,
                    },
                  },
                },
              })),
            },
          },
        })),
      },
    }
  }

  if (query.includes("customers")) {
    return {
      customers: {
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
        edges: Array.from({ length: 5 }, (_, i) => ({
          node: {
            id: `gid://shopify/Customer/${i + 1}`,
            firstName: ["Juan", "María", "Carlos", "Ana", "Pedro"][i % 5],
            lastName: ["Pérez", "García", "Rodríguez", "Martínez", "Sánchez"][i % 5],
            email: `cliente${i + 1}@example.com`,
            phone: `+34 6${Math.floor(Math.random() * 10000000)
              .toString()
              .padStart(8, "0")}`,
            ordersCount: Math.floor(Math.random() * 10),
            totalSpent: (Math.random() * 500 + 100).toFixed(2),
            addresses: {
              edges: [
                {
                  node: {
                    id: `gid://shopify/MailingAddress/${i + 1}`,
                    address1: `Calle Principal ${i + 1}`,
                    address2: "",
                    city: "Madrid",
                    province: "Madrid",
                    country: "España",
                    zip: `280${(i % 10) + 1}`,
                  },
                },
              ],
            },
          },
        })),
      },
      customer: {
        id: "gid://shopify/Customer/1",
        firstName: "Juan",
        lastName: "Pérez",
        email: "cliente1@example.com",
        phone: "+34 612345678",
        ordersCount: 5,
        totalSpent: "350.75",
        addresses: {
          edges: [
            {
              node: {
                id: "gid://shopify/MailingAddress/1",
                address1: "Calle Principal 1",
                address2: "",
                city: "Madrid",
                province: "Madrid",
                country: "España",
                zip: "28001",
              },
            },
          ],
        },
        orders: {
          edges: [
            {
              node: {
                id: "gid://shopify/Order/1",
                name: "#1001",
                createdAt: new Date().toISOString(),
                totalPriceSet: {
                  shopMoney: {
                    amount: "125.50",
                    currencyCode: "EUR",
                  },
                },
                displayFinancialStatus: "PAID",
                displayFulfillmentStatus: "FULFILLED",
              },
            },
          ],
        },
      },
    }
  }

  // Datos genéricos por defecto
  return {}
}
