import { NextResponse } from "next/server"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
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

    // Construir la URL de la API de Shopify
    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/products.json?limit=50`

    console.log("Enviando solicitud a Shopify:", {
      url,
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": "***", // No mostrar el token completo por seguridad
      },
    })

    // Realizar la petición a Shopify
    const shopifyResponse = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
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
          error: `Error ${shopifyResponse.status}: ${shopifyResponse.statusText}`,
          details: errorText.substring(0, 1000), // Limitar el tamaño para evitar respuestas muy grandes
        },
        { status: shopifyResponse.status },
      )
    }

    // Devolver la respuesta de Shopify
    const data = await shopifyResponse.json()

    // Transformar los datos para que tengan el mismo formato que esperamos
    const transformedProducts = data.products.map((product) => ({
      id: product.id.toString(),
      shopify_id: product.id.toString(),
      title: product.title,
      titulo: product.title,
      description: product.body_html,
      descripcion: product.body_html,
      price: product.variants[0]?.price || "0.00",
      precio: product.variants[0]?.price || "0.00",
      image: product.image?.src || null,
      imagen: product.image?.src || null,
      status: product.status,
      estado: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
      vendor: product.vendor,
      proveedor: product.vendor,
      product_type: product.product_type,
      tipo_producto: product.product_type,
      tags: product.tags,
      etiquetas: product.tags,
      handle: product.handle,
      url: product.handle,
      variants: product.variants,
      variantes: product.variants,
    }))

    return NextResponse.json({
      success: true,
      count: transformedProducts.length,
      data: transformedProducts,
    })
  } catch (error: any) {
    console.error("Error al obtener productos de Shopify:", error)
    return NextResponse.json(
      {
        error: error.message || "Error desconocido al obtener productos de Shopify",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
