import { GraphQLClient } from "graphql-request"

// Este cliente solo debe usarse en componentes del servidor o en rutas de API
const serverShopifyClient = new GraphQLClient(
  `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
      "Content-Type": "application/json",
    },
  },
)

export default serverShopifyClient
