import { NextResponse } from "next/server"
import config from "@/lib/config"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Verificar que las variables de entorno estén configuradas
    if (!config.shopify.apiUrl) {
      return NextResponse.json(
        {
          errors: [{ message: "SHOPIFY_API_URL no está configurado" }],
        },
        { status: 500 },
      )
    }

    if (!config.shopify.accessToken) {
      return NextResponse.json(
        {
          errors: [{ message: "SHOPIFY_ACCESS_TOKEN no está configurado" }],
        },
        { status: 500 },
      )
    }

    // Realizar la solicitud a Shopify
    const response = await fetch(config.shopify.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": config.shopify.accessToken,
      },
      body: JSON.stringify(body),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de Shopify (${response.status}):`, errorText)

      return NextResponse.json(
        {
          errors: [{ message: `Error en la respuesta de Shopify (${response.status}): ${errorText}` }],
        },
        { status: response.status },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)

    return NextResponse.json(
      {
        errors: [{ message: error instanceof Error ? error.message : "Error desconocido en el proxy de Shopify" }],
      },
      { status: 500 },
    )
  }
}
