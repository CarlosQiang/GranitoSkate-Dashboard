import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulación de diagnósticos de Shopify
    const diagnostics = {
      success: true,
      connection: {
        status: "connected",
        latency: "45ms",
        lastSync: new Date().toISOString(),
      },
      api: {
        status: "healthy",
        rateLimit: {
          current: 12,
          max: 40,
          resetAt: new Date(Date.now() + 60000).toISOString(),
        },
      },
      shop: {
        name: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "example.myshopify.com",
        plan: "Advanced",
        features: ["Online Store 2.0", "Shopify Payments", "Shopify Shipping"],
      },
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error("Error checking Shopify diagnostics:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al verificar diagnósticos de Shopify",
      },
      { status: 500 },
    )
  }
}
