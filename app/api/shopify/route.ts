import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("Error de autenticación: No hay sesión activa")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) {
      console.error("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      return NextResponse.json(
        { error: "Configuración de Shopify incompleta: falta el dominio de la tienda" },
        { status: 500 },
      )
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("SHOPIFY_ACCESS_TOKEN no está configurado")
      return NextResponse.json(
        { error: "Configuración de Shopify incompleta: falta el token de acceso" },
        { status: 500 },
      )
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    const { query, variables } = body

    // Construir la URL completa de la API de Shopify
    const shopifyUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`

    console.log(`Enviando solicitud a Shopify: ${shopifyUrl}`)

    // Limitar el tamaño del log para evitar logs demasiado grandes
    const queryPreview = query.length > 200 ? query.substring(0, 200) + "..." : query
    console.log("Query:", queryPreview)

    if (variables) {
      const variablesString = JSON.stringify(variables)
      const variablesPreview =
        variablesString.length > 200 ? variablesString.substring(0, 200) + "..." : variablesString
      console.log("Variables:", variablesPreview)
    }

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de Shopify (${response.status}): ${errorText}`)
      return NextResponse.json(
        {
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Devolver la respuesta
    const data = await response.json()

    // Verificar si hay errores en la respuesta GraphQL
    if (data.errors) {
      console.error("Errores GraphQL:", data.errors)
      return NextResponse.json(
        {
          error: "Error en la consulta GraphQL",
          details: data.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
