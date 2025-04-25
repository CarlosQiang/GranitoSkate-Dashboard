import { NextResponse } from "next/server"

export async function GET() {
  // Verificar las variables de entorno críticas
  const envStatus = {
    NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
    SHOPIFY_ACCESS_TOKEN: !!process.env.SHOPIFY_ACCESS_TOKEN,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
  }

  // Verificar si todas las variables de entorno están configuradas
  const allEnvVarsSet = Object.values(envStatus).every(Boolean)

  // Verificar la conexión con Shopify
  let shopifyStatus = "unknown"
  let shopifyMessage = ""

  if (envStatus.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN && envStatus.SHOPIFY_ACCESS_TOKEN) {
    try {
      // Intentar hacer una solicitud simple a la API de Shopify
      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/shop.json`,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
          },
        },
      )

      if (response.ok) {
        shopifyStatus = "connected"
        shopifyMessage = "Conexión con Shopify establecida correctamente"
      } else {
        shopifyStatus = "error"
        shopifyMessage = `Error al conectar con Shopify: ${response.status} ${response.statusText}`
      }
    } catch (error) {
      shopifyStatus = "error"
      shopifyMessage = `Error al conectar con Shopify: ${(error as Error).message}`
    }
  } else {
    shopifyStatus = "not_configured"
    shopifyMessage = "Faltan variables de entorno para la conexión con Shopify"
  }

  return NextResponse.json(
    {
      status: allEnvVarsSet && shopifyStatus === "connected" ? "ok" : "warning",
      message:
        allEnvVarsSet && shopifyStatus === "connected"
          ? "La aplicación está funcionando correctamente"
          : "La aplicación está funcionando, pero hay problemas con la configuración",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL === "1" ? true : false,
      envStatus,
      shopify: {
        status: shopifyStatus,
        message: shopifyMessage,
        domain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "no configurado",
      },
    },
    { status: 200 },
  )
}
