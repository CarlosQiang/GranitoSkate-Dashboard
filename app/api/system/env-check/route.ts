import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Lista de variables de entorno a verificar
    const variables = [
      {
        name: "SHOPIFY_API_URL",
        status: process.env.SHOPIFY_API_URL ? "ok" : "missing",
        description:
          "URL de la API GraphQL de Shopify (https://tu-tienda.myshopify.com/admin/api/2023-07/graphql.json)",
        required: true,
      },
      {
        name: "SHOPIFY_ACCESS_TOKEN",
        status: process.env.SHOPIFY_ACCESS_TOKEN ? "ok" : "missing",
        description: "Token de acceso para la API de Shopify",
        required: true,
      },
      {
        name: "SHOPIFY_STORE_DOMAIN",
        status: process.env.SHOPIFY_STORE_DOMAIN ? "ok" : "missing",
        description: "Dominio de la tienda Shopify (sin https://)",
        required: true,
      },
      {
        name: "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN",
        status: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "ok" : "missing",
        description: "Dominio de la tienda Shopify para el cliente (sin https://)",
        required: true,
      },
      {
        name: "POSTGRES_URL",
        status: process.env.POSTGRES_URL ? "ok" : "missing",
        description: "URL de conexión a la base de datos PostgreSQL",
        required: true,
      },
      {
        name: "DATABASE_URL",
        status: process.env.DATABASE_URL ? "ok" : "missing",
        description: "URL alternativa de conexión a la base de datos (se usa si POSTGRES_URL no está definida)",
        required: false,
      },
      {
        name: "NEXTAUTH_URL",
        status: process.env.NEXTAUTH_URL ? "ok" : "missing",
        description: "URL base de la aplicación para NextAuth (https://tu-app.vercel.app)",
        required: true,
      },
      {
        name: "NEXTAUTH_SECRET",
        status: process.env.NEXTAUTH_SECRET ? "ok" : "missing",
        description: "Secreto para cifrar las sesiones de NextAuth",
        required: true,
      },
      {
        name: "NEXT_PUBLIC_API_URL",
        status: process.env.NEXT_PUBLIC_API_URL ? "ok" : "missing",
        description: "URL base de la API para el cliente",
        required: false,
      },
      {
        name: "NEXT_PUBLIC_VERCEL_URL",
        status: process.env.NEXT_PUBLIC_VERCEL_URL ? "ok" : "missing",
        description: "URL de Vercel para el cliente (proporcionada automáticamente por Vercel)",
        required: false,
      },
      {
        name: "VERCEL_REGION",
        status: process.env.VERCEL_REGION ? "ok" : "missing",
        description: "Región de Vercel donde se despliega la aplicación (proporcionada automáticamente por Vercel)",
        required: false,
      },
    ]

    return NextResponse.json({
      success: true,
      variables,
    })
  } catch (error) {
    console.error("Error al verificar variables de entorno:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al verificar variables de entorno",
      },
      { status: 500 },
    )
  }
}
