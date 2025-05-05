// Función para obtener la URL base de la aplicación
const getBaseUrl = () => {
  // En el navegador, usamos window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // En el servidor, usamos la URL de Vercel o localhost
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}

// Función para realizar consultas a la API de Shopify a través de nuestro proxy
export async function shopifyFetch({ query, variables = {} }: { query: string; variables?: any }) {
  try {
    const url = `${getBaseUrl()}/api/shopify/proxy`

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Error en la respuesta: ${res.status} ${text}`)
    }

    const data = await res.json()

    // Si hay errores en la respuesta GraphQL, los devolvemos
    if (data.errors) {
      console.error("Errores GraphQL:", data.errors)
      return { data: data.data, errors: data.errors }
    }

    return { data: data.data }
  } catch (error) {
    console.error("Error en shopifyFetch:", error)
    throw error
  }
}
