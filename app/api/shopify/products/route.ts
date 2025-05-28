export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const cursor = searchParams.get("cursor")
    const status = searchParams.get("status")

    console.log(`🛍️ Fetching ${limit} products from Shopify...${status ? ` with status: ${status}` : ""}`)

    // Validar configuración de Shopify
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Shopify credentials missing")
      return Response.json({ error: "Shopify configuration missing" }, { status: 500 })
    }

    // Construir la consulta GraphQL con filtro de estado opcional
    let statusFilter = ""
    if (status && ["ACTIVE", "DRAFT", "ARCHIVED"].includes(status)) {
      statusFilter = `, query: "status:${status}"`
    }

    const query = `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true${statusFilter}) {
          edges {
            node {
              id
              title
              handle
              status
              createdAt
              updatedAt
              totalInventory
              vendor
              productType
              tags
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    compareAtPrice
                    inventoryQuantity
                  }
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `

    const variables = {
      first: Math.min(limit, 250), // Shopify limit
      after: cursor,
    }

    // Implementar retry logic para manejar errores temporales
    let retries = 3
    let response

    while (retries > 0) {
      response = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
        // Aumentar el timeout para evitar errores de red
        cache: "no-store",
      })

      if (response.ok) break

      retries--
      if (retries > 0) {
        console.log(`Retry attempt for Shopify API, ${retries} attempts remaining`)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Esperar 1 segundo entre intentos
      }
    }

    if (!response.ok) {
      console.error(`❌ Shopify API error: ${response.status} ${response.statusText}`)
      return Response.json({ error: `Shopify API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()

    if (data.errors) {
      console.error("❌ GraphQL errors:", data.errors)
      return Response.json({ error: "GraphQL query failed", details: data.errors }, { status: 400 })
    }

    const products =
      data.data?.products?.edges?.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        status: edge.node.status,
        createdAt: edge.node.createdAt,
        updatedAt: edge.node.updatedAt,
        totalInventory: edge.node.totalInventory || 0,
        vendor: edge.node.vendor,
        productType: edge.node.productType,
        tags: edge.node.tags,
        image: edge.node.images?.edges?.[0]?.node?.url || null,
        price: edge.node.variants?.edges?.[0]?.node?.price || "0.00",
        compareAtPrice: edge.node.variants?.edges?.[0]?.node?.compareAtPrice,
        inventoryQuantity: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
        cursor: edge.cursor,
      })) || []

    console.log(`✅ Successfully fetched ${products.length} products`)

    return Response.json({
      products,
      pageInfo: data.data?.products?.pageInfo || {},
      totalCount: products.length,
    })
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    return Response.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
