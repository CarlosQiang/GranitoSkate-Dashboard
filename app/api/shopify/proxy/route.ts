import { NextResponse } from "next/server"
import { shopifyConfig } from "@/lib/config/shopify"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Verificar si la configuración de Shopify es válida
    if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
      const errors = []
      if (!shopifyConfig.shopDomain) errors.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      if (!shopifyConfig.accessToken) errors.push("SHOPIFY_ACCESS_TOKEN no está configurado")

      console.error("Configuración de Shopify inválida:", errors)
      return NextResponse.json(
        {
          error: "Configuración de Shopify incompleta",
          details: errors,
        },
        { status: 500 },
      )
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    const { query, variables } = body

    // Construir la URL de la API de Shopify
    const apiUrl =
      shopifyConfig.apiUrl || `https://${shopifyConfig.shopDomain}/admin/api/${shopifyConfig.apiVersion}/graphql.json`

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyConfig.accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      let errorText = ""
      try {
        const errorData = await response.json()
        console.error("Error en la respuesta de Shopify (JSON):", errorData)
        errorText = JSON.stringify(errorData)
      } catch (e) {
        // Si no es JSON, intentar obtener el texto
        errorText = await response.text()
        console.error("Error en la respuesta de Shopify (texto):", errorText.substring(0, 500))
      }

      return NextResponse.json(
        {
          error: `Error ${response.status}: ${response.statusText}`,
          details: errorText.substring(0, 1000), // Limitar el tamaño para evitar respuestas muy grandes
        },
        { status: response.status },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
