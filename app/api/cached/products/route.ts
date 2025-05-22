import { NextResponse } from "next/server"
import { getShopifyProducts } from "@/lib/services/shopify-service"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const url = new URL(request.url)
    const forceRefresh = url.searchParams.get("refresh") === "true"
    const transform = url.searchParams.get("transform") === "true"

    // Obtener productos de Shopify
    const products = await getShopifyProducts(forceRefresh)

    // Si se solicita transformación, transformar los productos
    if (transform) {
      const transformedProducts = products.map((product) => {
        // Extraer el ID numérico
        const idParts = product.id.split("/")
        const shopifyId = idParts[idParts.length - 1]

        // Obtener la primera variante
        const firstVariant = product.variants?.edges?.[0]?.node || {}

        // Obtener la primera imagen
        const featuredImage = product.featuredImage || product.images?.edges?.[0]?.node || {}

        return {
          id: shopifyId,
          shopify_id: product.id,
          title: product.title,
          titulo: product.title,
          description: product.description,
          descripcion: product.description,
          price: firstVariant.price || "0.00",
          precio: firstVariant.price || "0.00",
          compareAtPrice: firstVariant.compareAtPrice,
          precio_comparacion: firstVariant.compareAtPrice,
          status: product.status,
          estado: product.status,
          vendor: product.vendor,
          proveedor: product.vendor,
          productType: product.productType,
          tipo_producto: product.productType,
          tags: product.tags,
          etiquetas: product.tags,
          handle: product.handle,
          url: product.handle,
          image: featuredImage.url,
          imagen_url: featuredImage.url,
          inventory: firstVariant.inventoryQuantity || 0,
          inventario: firstVariant.inventoryQuantity || 0,
        }
      })

      return NextResponse.json({
        success: true,
        count: transformedProducts.length,
        data: transformedProducts,
      })
    }

    // Devolver los productos sin transformar
    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    })
  } catch (error) {
    console.error("Error al obtener productos en caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener productos en caché",
      },
      { status: 500 },
    )
  }
}
