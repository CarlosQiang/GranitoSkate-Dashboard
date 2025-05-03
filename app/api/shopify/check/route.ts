import { NextResponse } from "next/server"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function GET() {
  try {
    // Consulta simple para verificar la conexión
    const query = gql`
      {
        shop {
          name
          url
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.shop) {
      return NextResponse.json(
        {
          success: false,
          message: "No se pudo conectar con la API de Shopify",
          details: "Respuesta incompleta o inválida",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Conexión establecida correctamente",
      shop: data.shop,
    })
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)

    // Extraer mensaje de error más detallado
    let errorMessage = "Error desconocido"
    let errorDetails = null

    if (error instanceof Error) {
      errorMessage = error.message

      // Intentar extraer más detalles si es un error de GraphQL
      if ("response" in error && typeof error.response === "object" && error.response) {
        const response = error.response as any
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          errorDetails = response.errors.map((e: any) => e.message).join(", ")
        }
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error al verificar la conexión con Shopify",
        details: errorDetails || errorMessage,
      },
      { status: 500 },
    )
  }
}
