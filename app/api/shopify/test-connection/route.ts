import { NextResponse } from "next/server"
import { GraphQLClient } from "graphql-request"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shopDomain, accessToken } = body

    // Verificar que las credenciales estén configuradas
    if (!shopDomain) {
      return NextResponse.json({
        success: false,
        message: "El dominio de la tienda no está configurado",
      })
    }

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: "El token de acceso no está configurado",
      })
    }

    // Crear un cliente GraphQL para Shopify
    const apiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`
    const client = new GraphQLClient(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    // Realizar una consulta simple para verificar la conexión
    const query = `
      query {
        shop {
          name
          id
        }
      }
    `

    const result = await client.request(query)

    return NextResponse.json({
      success: true,
      message: `Conexión exitosa con la tienda ${result.shop.name}`,
      data: result,
    })
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)

    // Intentar extraer un mensaje de error más específico
    let errorMessage = "Error desconocido al conectar con Shopify"

    if (error instanceof Error) {
      errorMessage = error.message

      // Verificar si es un error de autenticación
      if (errorMessage.includes("401")) {
        errorMessage = "Error de autenticación: Token de acceso inválido o expirado"
      }
      // Verificar si es un error de dominio no encontrado
      else if (errorMessage.includes("404") || errorMessage.includes("ENOTFOUND")) {
        errorMessage = "Error: Tienda no encontrada. Verifique el dominio de la tienda"
      }
    }

    return NextResponse.json({
      success: false,
      message: errorMessage,
    })
  }
}
