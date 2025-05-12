// Función para realizar solicitudes a la API de Shopify
export async function shopifyFetch({ query, variables }) {
  try {
    // Obtener las variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    // Verificar que las variables de entorno estén definidas
    if (!shopDomain || !accessToken) {
      throw new Error("Faltan variables de entorno para la API de Shopify")
    }

    // Construir la URL de la API de Shopify
    const apiUrl = `https://${shopDomain}/admin/api/2023-07/graphql.json`

    // Realizar la solicitud a la API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error en la respuesta de Shopify: ${response.status} ${response.statusText} - ${errorText}`)
    }

    // Convertir la respuesta a JSON
    const json = await response.json()
    return json
  } catch (error) {
    console.error("Error en shopifyFetch:", error)
    throw error
  }
}

// Función para obtener información de la tienda
export async function getShopInfo() {
  try {
    const query = `
      query {
        shop {
          name
          email
          myshopifyDomain
          primaryDomain {
            url
            host
          }
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
        }
      }
    `

    const response = await shopifyFetch({ query, variables: {} })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    return response.data.shop
  } catch (error) {
    console.error("Error al obtener información de la tienda:", error)
    throw new Error(`Error al obtener información de la tienda: ${error.message}`)
  }
}

// Función para verificar la conexión con Shopify
export async function checkShopifyConnection() {
  try {
    const shopInfo = await getShopInfo()
    return {
      connected: true,
      shopName: shopInfo.name,
      shopDomain: shopInfo.myshopifyDomain,
      plan: shopInfo.plan.displayName,
    }
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)
    return {
      connected: false,
      error: error.message,
    }
  }
}
