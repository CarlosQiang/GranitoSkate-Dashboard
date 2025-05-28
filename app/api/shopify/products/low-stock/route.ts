import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threshold = Number.parseInt(searchParams.get("threshold") || "5")

    // Simulamos datos de productos con diferentes niveles de stock
    const mockProducts = [
      {
        id: "1",
        title: "sad",
        quantity: 10,
        inventoryPolicy: "DENY",
        price: "1.00",
        status: "ACTIVE",
      },
      {
        id: "2",
        title: "alconoque",
        quantity: 10,
        inventoryPolicy: "DENY",
        price: "12.00",
        status: "ACTIVE",
      },
      {
        id: "3",
        title: "Skateboard Deck Pro",
        quantity: 3,
        inventoryPolicy: "DENY",
        price: "45.00",
        status: "ACTIVE",
      },
      {
        id: "4",
        title: "Ruedas Premium",
        quantity: 0,
        inventoryPolicy: "DENY",
        price: "25.00",
        status: "ACTIVE",
      },
      {
        id: "5",
        title: "Trucks Aluminum",
        quantity: 2,
        inventoryPolicy: "DENY",
        price: "35.00",
        status: "ACTIVE",
      },
    ]

    // Filtrar productos según el threshold o devolver todos si threshold es alto
    const filteredProducts =
      threshold >= 15 ? mockProducts : mockProducts.filter((product) => product.quantity <= threshold)

    return NextResponse.json({
      success: true,
      products: filteredProducts,
      threshold,
      total: filteredProducts.length,
    })
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener productos con stock bajo",
        products: [],
      },
      { status: 500 },
    )
  }
}
