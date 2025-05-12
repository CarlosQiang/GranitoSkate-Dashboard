import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { collectionId: string; productId: string } },
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { collectionId, productId } = params

    if (!collectionId || !productId) {
      return NextResponse.json({ error: "Se requieren los IDs de colección y producto" }, { status: 400 })
    }

    // Obtener las variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json({ error: "Faltan variables de entorno para Shopify" }, { status: 500 })
    }

    // Construir la URL para la API REST de Shopify
    const url = `https://${shopDomain}/admin/api/2023-07/collections/${collectionId}/products/${productId}.json`

    // Realizar la solicitud DELETE a la API de Shopify
    const shopifyResponse = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!shopifyResponse.ok) {
      // Si la respuesta no es OK, intentar obtener el mensaje de error
      let errorMessage = `Error ${shopifyResponse.status}: ${shopifyResponse.statusText}`
      try {
        const errorData = await shopifyResponse.json()
        errorMessage = errorData.errors || errorMessage
      } catch (e) {
        // Si no se puede parsear la respuesta, usar el mensaje de error genérico
      }

      console.error("Error al eliminar producto de la colección:", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: shopifyResponse.status })
    }

    // Devolver respuesta exitosa
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: `Error al eliminar producto de la colección: ${error.message}` }, { status: 500 })
  }
}
