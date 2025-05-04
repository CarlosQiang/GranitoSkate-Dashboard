import { NextResponse } from "next/server"
import { fetchProducts } from "@/lib/api/products"
import { fetchCollections } from "@/lib/api/collections"
import { fetchRecentOrders } from "@/lib/api/orders"
import { fetchPromotions } from "@/lib/api/promotions"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  try {
    let result
    let message
    let details

    switch (type) {
      case "products":
        result = await fetchProducts(3)
        message = `Se cargaron ${result.length} productos correctamente`
        details = {
          count: result.length,
          sample: result.map((p) => ({ id: p.id, title: p.title })),
        }
        break

      case "collections":
        result = await fetchCollections(3)
        message = `Se cargaron ${result.length} colecciones correctamente`
        details = {
          count: result.length,
          sample: result.map((c) => ({ id: c.id, title: c.title })),
        }
        break

      case "orders":
        result = await fetchRecentOrders(3)
        message = `Se cargaron ${result.length} pedidos correctamente`
        details = {
          count: result.length,
          sample: result.map((o) => ({ id: o.id, name: o.name })),
        }
        break

      case "promotions":
        result = await fetchPromotions(3)
        message = `Se cargaron ${result.length} promociones correctamente`
        details = {
          count: result.length,
          sample: result.map((p) => ({ id: p.id, title: p.title })),
        }
        break

      default:
        return NextResponse.json({ success: false, message: "Tipo de diagnóstico no válido" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message,
      details,
    })
  } catch (error) {
    console.error(`Error en diagnóstico de ${type}:`, error)

    return NextResponse.json(
      {
        success: false,
        message: `Error en diagnóstico de ${type}: ${error.message}`,
        details: {
          error: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
