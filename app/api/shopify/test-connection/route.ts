import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET() {
  try {
    console.log("Probando conexión con Shopify...")

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN
    const apiUrl = process.env.SHOPIFY_API_URL

    if (!shopDomain || !accessToken || !apiUrl) {
      return NextResponse.json({
        success: false,
        error: "Faltan variables de entorno para la conexión con Shopify",
        missingVars: {
          shopDomain: !shopDomain,
          accessToken: !accessToken,
          apiUrl: !apiUrl,
        },
      })
    }

    console.log("Variables de entorno verificadas")

    // Consulta GraphQL simple para probar la conexión
    const query = `
      query {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `

    console.log("Enviando consulta GraphQL a Shopify...")

    // Realizar la consulta a Shopify
    const response = await shopifyFetch({
      query,
    })

    console.log("Respuesta recibida de Shopify")

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      console.error("Errores en la respuesta de Shopify:", errorMessage)

      return NextResponse.json({
        success: false,
        error: `Error en la API de Shopify: ${errorMessage}`,
        response,
      })
    }

    if (!response.data || !response.data.shop) {
      console.error("Respuesta de Shopify inválida:", response)

      return NextResponse.json({
        success: false,
        error: "No se pudo obtener información de la tienda: respuesta vacía o inválida",
        response,
      })
    }

    // Conexión exitosa
    return NextResponse.json({
      success: true,
      shop: response.data.shop,
      message: `Conexión exitosa con la tienda: ${response.data.shop.name}`,
    })
  } catch (error) {
    console.error("Error al probar conexión con Shopify:", error)

    return NextResponse.json({
      success: false,
      error: error.message || "Error desconocido",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}
