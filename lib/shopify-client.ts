import { GraphQLClient } from "graphql-request"

// Usamos los valores de las variables de entorno
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "qiangtheme.myshopify.com"
const apiVersion = "2023-10" // Usa la versión más reciente de la API
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

if (!accessToken && process.env.NODE_ENV === "production") {
  console.error("Error: SHOPIFY_ACCESS_TOKEN no está definido en las variables de entorno")
}

const endpoint = `https://${shopifyDomain}/admin/api/${apiVersion}/graphql.json`

export const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Access-Token": accessToken || "",
    "Content-Type": "application/json",
  },
})
