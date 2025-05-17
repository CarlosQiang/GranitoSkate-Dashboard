import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulamos una sincronización exitosa
    const mockProducts = [
      {
        id: "gid://shopify/Product/1",
        title: "Producto de Prueba 1",
        handle: "producto-de-prueba-1",
        description: "Descripción del producto de prueba 1",
        status: "ACTIVE",
        images: {
          edges: [
            {
              node: {
                url: "https://via.placeholder.com/500",
              },
            },
          ],
        },
        variants: {
          edges: [
            {
              node: {
                id: "gid://shopify/ProductVariant/1",
                price: "0.00",
                inventoryQuantity: 10,
              },
            },
          ],
        },
        productType: "Skate",
        vendor: "Granito",
      },
      {
        id: "gid://shopify/Product/2",
        title: "sad",
        handle: "sad",
        description: "",
        status: "ACTIVE",
        images: {
          edges: [],
        },
        variants: {
          edges: [
            {
              node: {
                id: "gid://shopify/ProductVariant/2",
                price: "0.00",
                inventoryQuantity: 5,
              },
            },
          ],
        },
        productType: "",
        vendor: "",
      },
    ]

    return NextResponse.json({ success: true, products: mockProducts })
  } catch (error) {
    console.error("Error al sincronizar productos:", error)
    return NextResponse.json({ success: false, error: "Error al sincronizar productos" }, { status: 500 })
  }
}
