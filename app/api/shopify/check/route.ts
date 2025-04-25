import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuración de Shopify incompleta. Verifica las variables de entorno.",
        },
        { status: 200 },
      )
    }

    // Consulta GraphQL simple para verificar la conexión
    const query = `
      {
        shop {
          name
        }
      }
    `

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: 200 },
      )
    }

    const data = await response.json()

    // Verificar si hay errores en la respuesta GraphQL
    if (data.errors) {
      return NextResponse.json(
        {
          success: false,
          error: "Error en la consulta GraphQL",
          details: data.errors,
        },
        { status: 200 },
      )
    }

    // Verificar que la respuesta contiene los datos esperados
    if (!data.data || !data.data.shop) {
      return NextResponse.json(
        {
          success: false,
          error: "Respuesta de Shopify incompleta o inesperada",
        },
        { status: 200 },
      )
    }

    return NextResponse.json({
      success: true,
      shopName: data.data.shop.name,
    })
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al verificar la conexión: ${(error as Error).message}`,
      },
      { status: 200 },
    )
  }
}
