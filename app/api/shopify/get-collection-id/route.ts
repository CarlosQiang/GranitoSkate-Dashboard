import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener las credenciales de Shopify
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    // Verificar que las credenciales existen
    if (!shopDomain || !accessToken) {
      console.error("Faltan credenciales de Shopify:", { shopDomain: !!shopDomain, accessToken: !!accessToken })
      return NextResponse.json({ success: false, message: "Faltan credenciales de Shopify" }, { status: 500 })
    }

    // Construir la URL de la API de Shopify
    const shopifyApiUrl = `https://${shopDomain}/admin/api/2023-07/graphql.json`

    // Consulta GraphQL para obtener colecciones
    const query = `
      query {
        collections(first: 10) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `

    // Realizar la solicitud a la API de Shopify
    const shopifyResponse = await fetch(shopifyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query }),
    })

    // Verificar si la respuesta es exitosa
    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text()
      console.error("Error en la respuesta de Shopify:", {
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        body: errorText,
      })
      return NextResponse.json(
        {
          success: false,
          message: `Error en la API de Shopify: ${shopifyResponse.status} ${shopifyResponse.statusText}`,
          details: errorText,
        },
        { status: shopifyResponse.status },
      )
    }

    // Obtener la respuesta como JSON
    const data = await shopifyResponse.json()

    // Verificar si hay errores en la respuesta
    if (data.errors) {
      console.error("Errores en la respuesta de Shopify:", data.errors)
      return NextResponse.json(
        { success: false, message: "Errores en la respuesta de Shopify", errors: data.errors },
        { status: 500 },
      )
    }

    // Buscar la colección "Tutoriales"
    const tutorialesCollection = data.data?.collections?.edges?.find((edge: any) => edge.node.title === "Tutoriales")

    if (!tutorialesCollection) {
      return NextResponse.json(
        {
          success: false,
          message: "No se encontró la colección 'Tutoriales'",
          collections: data.data?.collections?.edges,
        },
        { status: 404 },
      )
    }

    // Devolver el ID de la colección
    return NextResponse.json({
      success: true,
      collectionId: tutorialesCollection.node.id,
      title: tutorialesCollection.node.title,
    })
  } catch (error) {
    console.error("Error al obtener ID de colección:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}
