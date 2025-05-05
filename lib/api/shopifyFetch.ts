import { GraphQLClient } from "graphql-request"

export interface ShopifyFetchOptions {
  query: string
  variables?: Record<string, any>
}

export async function shopifyFetch<T>({
  query,
  variables,
}: ShopifyFetchOptions): Promise<{ data: T | undefined; errors: any[] | undefined }> {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

  if (!shopDomain || !accessToken) {
    console.error("Shopify environment variables not defined")
    return {
      data: undefined,
      errors: [
        {
          message: "Shopify environment variables not defined. Please check your .env file.",
        },
      ],
    }
  }

  try {
    const client = new GraphQLClient(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    const data = await client.request<T>(query, variables)
    return { data, errors: undefined }
  } catch (error: any) {
    console.error("Shopify fetch error:", error)
    return {
      data: undefined,
      errors: [
        {
          message: error.message,
        },
      ],
    }
  }
}
