import { GraphQLClient } from "graphql-request"

// Crear un cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(process.env.SHOPIFY_API_URL || "", {
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
  },
})

// Función para realizar consultas GraphQL a Shopify
export async function shopifyFetch({ query, variables = {} }) {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.SHOPIFY_API_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Error: Faltan credenciales de Shopify")
      throw new Error(
        "Faltan credenciales de Shopify. Verifica las variables de entorno SHOPIFY_API_URL y SHOPIFY_ACCESS_TOKEN.",
      )
    }

    // Realizar la consulta a Shopify
    const response = await fetch(process.env.SHOPIFY_API_URL, {
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

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const text = await response.text()
      console.error(`Error en la solicitud a Shopify (${response.status})`, { text })
      throw new Error(`Error en la solicitud a Shopify (${response.status}): ${text}`)
    }

    // Parsear la respuesta como JSON
    const json = await response.json()

    // Verificar si hay errores en la respuesta
    if (json.errors) {
      console.error("Errores en la respuesta de Shopify", { errors: json.errors })
      throw new Error(`Errores en la respuesta de Shopify: ${JSON.stringify(json.errors)}`)
    }

    return json
  } catch (error) {
    console.error("Error en shopifyFetch", { error })
    throw error
  }
}

// Función para realizar una petición REST a Shopify
export async function shopifyRestFetch(endpoint, method = "GET", data = null) {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Error: Faltan credenciales de Shopify")
      throw new Error(
        "Faltan credenciales de Shopify. Verifica las variables de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN.",
      )
    }

    // Construir la URL de la API de Shopify
    const url = `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`

    // Configurar las opciones de la petición
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: data ? JSON.stringify(data) : undefined,
    }

    // Realizar la petición a Shopify
    const response = await fetch(url, options)

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const text = await response.text()
      console.error(`Error en la respuesta REST de Shopify (${response.status})`, { text })
      throw new Error(`Error en la respuesta de Shopify: ${response.status} ${response.statusText}`)
    }

    // Parsear la respuesta como JSON
    return await response.json()
  } catch (error) {
    console.error("Error en la petición REST a Shopify", { error })
    throw error
  }
}

// Extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid) {
  if (!gid) return ""
  const parts = gid.split("/")
  return parts[parts.length - 1]
}

// Formatear un ID para Shopify
export function formatShopifyId(id, resourceType) {
  if (!id) return `gid://shopify/${resourceType}/0`

  // Si el ID ya tiene el formato correcto, devolverlo tal cual
  if (typeof id === "string" && id.startsWith(`gid://shopify/${resourceType}/`)) {
    return id
  }

  // Si el ID es un número o una cadena que representa un número
  const idStr = String(id)

  // Si el ID ya contiene el prefijo gid://shopify/ pero no el tipo de recurso correcto
  if (idStr.startsWith("gid://shopify/")) {
    const parts = idStr.split("/")
    const numericId = parts[parts.length - 1]
    return `gid://shopify/${resourceType}/${numericId}`
  }

  // Si el ID es solo el número
  return `gid://shopify/${resourceType}/${idStr}`
}

export default shopifyClient
