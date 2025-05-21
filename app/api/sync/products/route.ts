import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchShopifyProducts } from "@/lib/services/shopify-service"
import { saveProductFromShopify } from "@/lib/repositories/productos-repository"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID del producto de la URL si existe
    const url = new URL(request.url)
    const productId = url.searchParams.get("id")

    // Si se proporciona un ID, sincronizar solo ese producto
    if (productId) {
      // Aquí implementaríamos la lógica para obtener y sincronizar un solo producto
      return NextResponse.json({
        success: true,
        message: `Sincronización de producto ${productId} no implementada aún`,
      })
    }

    // Si no hay ID, obtener todos los productos pero no intentar sincronizarlos
    const products = await fetchShopifyProducts(true, 10) // Limitamos a 10 para pruebas

    return NextResponse.json({
      success: true,
      message: "Productos obtenidos de Shopify (sin sincronizar con la base de datos)",
      count: products.length,
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
      })),
    })
  } catch (error: any) {
    console.error("Error en sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido en sincronización de productos",
      },
      { status: 500 },
    )
  }
}

// Endpoint para sincronizar un solo producto
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await request.json()
    const { productData } = data

    if (!productData || !productData.id) {
      return NextResponse.json(
        { success: false, error: "Datos de producto no proporcionados o inválidos" },
        { status: 400 },
      )
    }

    // Intentar guardar el producto en la base de datos
    try {
      const result = await saveProductFromShopify(productData)
      return NextResponse.json({
        success: true,
        message: `Producto ${productData.title || productData.id} sincronizado correctamente`,
        product: result,
      })
    } catch (dbError: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Error al guardar en la base de datos: ${dbError.message}`,
          productId: productData.id,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error en sincronización de producto:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido en sincronización de producto",
      },
      { status: 500 },
    )
  }
}
