/**
 * Cliente para realizar peticiones a la API de Shopify
 */

// Función para realizar peticiones a la API GraphQL de Shopify
export async function shopifyFetch({ query, variables = {} }) {
  try {
    // Verificar si estamos en el servidor
    if (typeof window !== "undefined") {
      // Si estamos en el cliente, hacemos la petición a través de nuestra API
      const response = await fetch("/api/shopify/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } else {
      // Si estamos en el servidor, necesitamos las credenciales de Shopify
      const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN } = process.env

      if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
        throw new Error("Faltan credenciales de Shopify en las variables de entorno")
      }

      // Construir la URL de la API de Shopify
      const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/graphql.json`

      // Realizar la petición a Shopify
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.errors ? errorData.errors[0].message : errorMessage
        } catch (e) {
          // Si no podemos parsear el error, usamos el mensaje genérico
        }
        throw new Error(errorMessage)
      }

      return await response.json()
    }
  } catch (error) {
    console.error("Error en shopifyFetch:", error)
    throw error
  }
}

// Función para realizar peticiones a la API REST de Shopify
export async function shopifyRestFetch(endpoint, method = "GET", data = null) {
  try {
    // Verificar si estamos en el servidor
    if (typeof window !== "undefined") {
      // Si estamos en el cliente, hacemos la petición a través de nuestra API
      const response = await fetch(`/api/shopify/rest?endpoint=${encodeURIComponent(endpoint)}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } else {
      // Si estamos en el servidor, necesitamos las credenciales de Shopify
      const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN } = process.env

      if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_API_TOKEN) {
        throw new Error("Faltan credenciales de Shopify en las variables de entorno")
      }

      // Construir la URL de la API de Shopify
      const url = `https://${SHOPIFY_STORE_DOMAIN}${endpoint}`

      // Realizar la petición a Shopify
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.errors ? JSON.stringify(errorData.errors) : errorMessage
        } catch (e) {
          // Si no podemos parsear el error, usamos el mensaje genérico
        }
        throw new Error(errorMessage)
      }

      return await response.json()
    }
  } catch (error) {
    console.error("Error en shopifyRestFetch:", error)
    throw error
  }
}

// Exportar las funciones
export { shopifyFetch as default }
