import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulación de verificación SEO
    const seoStatus = {
      success: true,
      status: "healthy",
      metrics: {
        performance: 85,
        accessibility: 92,
        bestPractices: 78,
        seo: 88,
      },
      keywords: [
        { keyword: "skate barcelona", position: 5, change: 2 },
        { keyword: "comprar skateboard", position: 8, change: -1 },
        { keyword: "mejores tablas de skate", position: 12, change: 5 },
        { keyword: "skate shop online", position: 15, change: 0 },
        { keyword: "accesorios skate", position: 10, change: 3 },
      ],
    }

    return NextResponse.json(seoStatus)
  } catch (error) {
    console.error("Error checking SEO:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al verificar SEO",
      },
      { status: 500 },
    )
  }
}
