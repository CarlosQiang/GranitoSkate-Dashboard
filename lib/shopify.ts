"use server"

import { GraphQLClient } from "graphql-request"

const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || ""

if (!shopDomain) {
  console.error("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
}

if (!accessToken) {
  console.error("SHOPIFY_ACCESS_TOKEN no está configurado")
}

const shopifyClient = new GraphQLClient(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
  headers: {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  },
})

export default shopifyClient
