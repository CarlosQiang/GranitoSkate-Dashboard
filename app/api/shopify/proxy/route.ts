import { NextResponse } from "next/server"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Verificar autenticación - Comentamos esta parte temporalmente para diagnosticar
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    // Obtener las credenciales de Shopify
    const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ACCESS_TOKEN } = process.env

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
      console.error("Faltan credenciales de Shopify:", {
        hasDomain: !!SHOPIFY_STORE_DOMAIN,
        hasToken: !!SHOPIFY_ACCESS_TOKEN,
      })
      return NextResponse.json(
        {
          error: "Faltan credenciales de Shopify en las variables de entorno",
          details: {
            hasDomain: !!SHOPIFY_STORE_DOMAIN,
            hasToken: !!SHOPIFY_ACCESS_TOKEN,
          },
        },
        { status: 500 },
      )
    }

    // Obtener el cuerpo de la petición
    const body = await request.json()

    // Construir la URL de la API de Shopify
    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/graphql.json`

    console.log("Enviando solicitud a Shopify:", {
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "***", // No mostrar el token completo por seguridad
      },
    })

    // Realizar la petición a Shopify
    const shopifyResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify(body),
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      let errorText = ""
      try {
        const errorData = await shopifyResponse.json()
        console.error("Error en la respuesta de Shopify (JSON):", errorData)
        errorText = JSON.stringify(errorData)
      } catch (e) {
        // Si no es JSON, intentar obtener el texto
        errorText = await shopifyResponse.text()
        console.error("Error en la respuesta de Shopify (texto):", errorText.substring(0, 500))
      }

      return NextResponse.json(
        {
          error: `Error ${shopifyResponse.status}: ${shopifyResponse.statusText}`,
          details: errorText.substring(0, 1000), // Limitar el tamaño para evitar respuestas muy grandes
        },
        { status: shopifyResponse.status },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error en el proxy de Shopify:", error)
    return NextResponse.json(
      {
        error: error.message || "Error desconocido en el proxy de Shopify",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
