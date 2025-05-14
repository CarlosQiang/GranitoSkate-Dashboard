"use client"

import { GraphQLClient } from "graphql-request"

// Función para obtener un cliente de Shopify con credenciales temporales o de entorno
export function getShopifyClient() {
  // Intentar obtener credenciales temporales del localStorage
  const tempShopDomain = typeof window !== "undefined" ? localStorage.getItem("shopify_domain") : null
  const tempAccessToken = typeof window !== "undefined" ? localStorage.getItem("shopify_token") : null

  // Usar credenciales temporales o las de las variables de entorno
  const shopifyDomain = tempShopDomain || process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""
  const shopifyAccessToken = tempAccessToken || ""

  // Verificar si las credenciales están configuradas
  if (!shopifyDomain || !shopifyAccessToken) {
    console.error("Error: Credenciales de Shopify no configuradas")
    return null
  }

  // Crear el cliente GraphQL para Shopify
  const apiUrl = `https://${shopifyDomain}/admin/api/2023-10/graphql.json`
  const client = new GraphQLClient(apiUrl, {
    headers: {
      "X-Shopify-Access-Token": shopifyAccessToken,
      "Content-Type": "application/json",
    },
  })

  return client
}

// Función para realizar consultas GraphQL a Shopify
export async function clientShopifyFetch({ query, variables = {} }) {
  try {
    const client = getShopifyClient()

    if (!client) {
      return {
        data: null,
        errors: [{ message: "Cliente de Shopify no inicializado" }],
      }
    }

    const result = await client.request(query, variables)

    return { data: result, errors: null }
  } catch (error) {
    console.error("Error en la consulta GraphQL:", error)

    // Intentar extraer errores específicos de GraphQL
    const graphQLErrors = error.response?.errors || [{ message: error.message }]

    return {
      data: null,
      errors: graphQLErrors,
    }
  }
}
