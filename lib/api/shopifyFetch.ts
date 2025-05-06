// Función para realizar peticiones a la API de Shopify
export async function shopifyFetch({ query, variables }: { query: string; variables?: any }) {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Shopify environment variables not defined")
      throw new Error("Shopify environment variables not defined. Please check your .env file.")
    }

    const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Error en la respuesta de Shopify: ${response.status} ${text}`)
    }

    const json = await response.json()

    if (json.errors) {
      console.error("GraphQL Errors:", json.errors)
      throw new Error(`GraphQL Errors: ${json.errors.map((e: any) => e.message).join(", ")}`)
    }

    return json
  } catch (error) {
    console.error("Error en shopifyFetch:", error)
    throw error
  }
}
