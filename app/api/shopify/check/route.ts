import { NextResponse } from "next/server"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function GET() {
  try {
    // Verificar que las variables de entorno estén configuradas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan variables de entorno para la conexión con Shopify",
          missingEnvVars: {
            NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: !shopDomain,
            SHOPIFY_ACCESS_TOKEN: !accessToken,
          },
        },
        { status: 500 },
      )
    }

    // Consulta simple para verificar la conexión
    const query = gql`
      {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    return NextResponse.json({
      success: true,
      message: "Conexión con Shopify establecida correctamente",
      shop: data.shop,
      config: {
        shopDomain,
        accessTokenConfigured: !!accessToken,
      },
    })
  } catch (error) {
    console.error("Error checking Shopify connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al conectar con Shopify: ${(error as Error).message}`,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
