// Configuración para la API de Shopify
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2023-10"

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SHOPIFY_STORE_URL) {
  console.error("Faltan variables de entorno para la API de Shopify")
}

// Función para realizar solicitudes a la API de Shopify
export async function shopifyFetch({
  endpoint,
  method,
  body,
}: {
  endpoint: string
  method: string
  body?: string
}) {
  try {
    const url = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/${endpoint}`

    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_API_SECRET as string,
    }

    const options: RequestInit = {
      method,
      headers,
      cache: "no-store",
    }

    if (body && (method === "POST" || method === "PUT")) {
      options.body = body
    }

    return await fetch(url, options)
  } catch (error) {
    console.error("Error en shopifyFetch:", error)
    throw error
  }
}
