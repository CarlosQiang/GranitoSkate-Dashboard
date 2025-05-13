import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()

    // Verificar que tenemos las credenciales de Shopify
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopifyDomain || !shopifyToken) {
      console.error("Faltan credenciales de Shopify")
      return NextResponse.json(
        {
          success: false,
          message: "Faltan credenciales de Shopify",
          errors: [{ message: "Configuración de Shopify incompleta" }],
        },
        { status: 500 },
      )
    }

    // Construir la URL de la API de Shopify
    const apiUrl = `https://${shopifyDomain}/admin/api/2023-10/graphql.json`

    // Realizar la solicitud a Shopify
    console.log("Enviando solicitud a Shopify API:", apiUrl)
    const shopifyResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyToken,
      },
      body: JSON.stringify(body),
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      console.error("Error en la respuesta de Shopify:", shopifyResponse.status, shopifyResponse.statusText)
      const errorText = await shopifyResponse.text().catch(() => "No se pudo leer el cuerpo de la respuesta")
      console.error("Cuerpo de la respuesta de error:", errorText)

      return NextResponse.json(
        {
          success: false,
          message: `Error en la API de Shopify: ${shopifyResponse.status} ${shopifyResponse.statusText}`,
          errors: [{ message: errorText }],
        },
        { status: shopifyResponse.status },
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
