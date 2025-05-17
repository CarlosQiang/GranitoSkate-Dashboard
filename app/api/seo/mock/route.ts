import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Simular un retraso para que parezca una llamada a API real
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simplemente devolver éxito
    return NextResponse.json({ success: true, message: "SEO settings saved successfully" })
  } catch (error) {
    console.error("Error in mock SEO API:", error)
    return NextResponse.json({ success: false, message: "Error saving SEO settings" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Simular un retraso para que parezca una llamada a API real
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Devolver datos de ejemplo
    return NextResponse.json({
      success: true,
      data: {
        title: "Granito Skate Shop - Tienda de skate online",
        description:
          "Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas.",
        keywords: ["skate", "tablas", "ruedas", "trucks", "accesorios"],
      },
    })
  } catch (error) {
    console.error("Error in mock SEO API:", error)
    return NextResponse.json({ success: false, message: "Error fetching SEO settings" }, { status: 500 })
  }
}
