import { NextResponse } from "next/server"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("Faltan credenciales de Shopify:", {
        hasDomain: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
        hasToken: !!process.env.SHOPIFY_ACCESS_TOKEN,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Faltan credenciales de Shopify en las variables de entorno",
        },
        { status: 500 },
      )
    }

    // Construir la URL de la API de Shopify
    const url = `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/custom_collections.json?limit=50`

    console.log("Enviando solicitud a Shopify para colecciones:", {
      url,
      method: "GET",
    })

    // Realizar la petición a Shopify
    const shopifyResponse = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
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
          success: false,
          error: `Error ${shopifyResponse.status}: ${shopifyResponse.statusText}`,
          details: errorText.substring(0, 1000), // Limitar el tamaño para evitar respuestas muy grandes
        },
        { status: shopifyResponse.status },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()

    // Transformar los datos para que tengan el mismo formato que esperamos
    const transformedCollections = data.custom_collections.map((collection) => ({
      id: collection.id.toString(),
      shopify_id: collection.id.toString(),
      title: collection.title,
      titulo: collection.title,
      description: collection.body_html,
      descripcion: collection.body_html,
      image: collection.image?.src || null,
      imagen_url: collection.image?.src || null,
      handle: collection.handle,
      url: collection.handle,
      updated_at: collection.updated_at,
      published_at: collection.published_at,
      products_count: collection.products_count || 0,
      productos_count: collection.products_count || 0,
    }))

    return NextResponse.json({
      success: true,
      count: transformedCollections.length,
      data: transformedCollections,
    })
  } catch (error: any) {
    console.error("Error al obtener colecciones de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener colecciones de Shopify",
      },
      { status: 500 },
    )
  }
}
