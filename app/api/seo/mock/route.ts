import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      title: "Granito Skate Shop - Tienda de skate online",
      description:
        "Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas.",
      keywords: ["skate", "skateboard", "tablas", "ruedas", "trucks"],
    },
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    return NextResponse.json({
      success: true,
      message: "Configuración SEO guardada correctamente",
      data,
    })
  } catch (error) {
    console.error("Error en la API mock de SEO:", error)
    return NextResponse.json({ success: false, error: "Error al procesar la solicitud" }, { status: 400 })
  }
}
