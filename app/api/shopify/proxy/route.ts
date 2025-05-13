import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar autenticación del usuario
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error("Usuario no autenticado intentando acceder al proxy de Shopify")
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()

    // Verificar que tenemos las credenciales de Shopify
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopifyDomain || !shopifyToken) {
      console.error("Faltan credenciales de Shopify en las variables de entorno")
      return NextResponse.json(
        {
          success: false,
          message: "Faltan credenciales de Shopify en las variables de entorno",
          errors: [{ message: "Configuración de Shopify incompleta" }],
        },
        { status: 500 },
      )
    }

    console.log(`Enviando solicitud a Shopify API: https://${shopifyDomain}/admin/api/2023-10/graphql.json`)

    // Realizar la solicitud a Shopify con el token correcto
    const shopifyResponse = await fetch(`https://${shopifyDomain}/admin/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyToken,
      },
      body: JSON.stringify(body),
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      const statusCode = shopifyResponse.status
      const statusText = shopifyResponse.statusText

      console.error(`Error en la respuesta de Shopify: ${statusCode} ${statusText}`)

      let errorBody = "No se pudo leer el cuerpo de la respuesta"
      try {
        errorBody = await shopifyResponse.text()
        console.error("Cuerpo de la respuesta de error:", errorBody)
      } catch (e) {
        console.error("Error al leer el cuerpo de la respuesta:", e)
      }

      // Proporcionar información detallada sobre el error
      return NextResponse.json(
        {
          success: false,
          message: `Error en la API de Shopify: ${statusCode} ${statusText}`,
          statusCode,
          errorBody,
          tokenLength: shopifyToken.length, // Para depuración, solo mostramos la longitud
          shopifyDomain,
        },
        { status: statusCode },
      )
    }

    // Obtener la respuesta como JSON
    const data = await shopifyResponse.json()

    // Verificar si hay errores en la respuesta de GraphQL
    if (data.errors) {
      console.error("Errores GraphQL de Shopify:", data.errors)
      return NextResponse.json(
        {
          success: false,
          message: "Errores en la consulta GraphQL",
          errors: data.errors,
        },
        { status: 400 },
      )
    }

    // Devolver la respuesta exitosa
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido en el proxy de Shopify",
        errors: [{ message: error instanceof Error ? error.message : "Error desconocido" }],
      },
      { status: 500 },
    )
  }
}
