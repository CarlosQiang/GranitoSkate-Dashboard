import { GraphQLClient } from "graphql-request"

const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "qiangtheme.myshopify.com"
const apiVersion = "2023-10"
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || ""

const endpoint = `https://${shopifyDomain}/admin/api/${apiVersion}/graphql.json`

export const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  },
})
