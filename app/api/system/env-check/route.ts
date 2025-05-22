import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Lista de variables de entorno a verificar
    const variables = [
      {
        name: "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN",
        status: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "ok" : "missing",
        required: true,
        description: "Dominio de la tienda Shopify (ej: mi-tienda.myshopify.com)",
      },
      {
        name: "SHOPIFY_ACCESS_TOKEN",
        status: process.env.SHOPIFY_ACCESS_TOKEN ? "ok" : "missing",
        required: true,
        description: "Token de acceso a la API de Shopify",
      },
      {
        name: "SHOPIFY_API_URL",
        status: process.env.SHOPIFY_API_URL ? "ok" : "missing",
        required: true,
        description: "URL de la API de Shopify (ej: https://mi-tienda.myshopify.com/admin/api/2023-07/graphql.json)",
      },
      {
        name: "POSTGRES_URL",
        status: process.env.POSTGRES_URL ? "ok" : "missing",
        required: true,
        description: "URL de conexión a la base de datos PostgreSQL",
      },
      {
        name: "DATABASE_URL",
        status: process.env.DATABASE_URL ? "ok" : "missing",
        required: false,
        description: "URL alternativa de conexión a la base de datos (se usa si POSTGRES_URL no está configurado)",
      },
      {
        name: "NEXTAUTH_SECRET",
        status: process.env.NEXTAUTH_SECRET ? "ok" : "missing",
        required: true,
        description: "Secreto para NextAuth (autenticación)",
      },
      {
        name: "NEXTAUTH_URL",
        status: process.env.NEXTAUTH_URL ? "ok" : "missing",
        required: false,
        description: "URL base para NextAuth (se usa en producción)",
      },
      {
        name: "NEXT_PUBLIC_VERCEL_URL",
        status: process.env.NEXT_PUBLIC_VERCEL_URL ? "ok" : "missing",
        required: false,
        description: "URL de Vercel (se configura automáticamente en Vercel)",
      },
      {
        name: "NEXT_PUBLIC_API_URL",
        status: process.env.NEXT_PUBLIC_API_URL ? "ok" : "missing",
        required: false,
        description: "URL base de la API (opcional)",
      },
      {
        name: "SHOPIFY_STORE_DOMAIN",
        status: process.env.SHOPIFY_STORE_DOMAIN ? "ok" : "missing",
        required: false,
        description:
          "Dominio alternativo de la tienda Shopify (se usa si NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado)",
      },
      {
        name: "NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN",
        status: process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN ? "ok" : "missing",
        required: false,
        description: "Token de acceso público a la API de Shopify (opcional)",
      },
      {
        name: "NEXT_PUBLIC_APP_URL",
        status: process.env.NEXT_PUBLIC_APP_URL ? "ok" : "missing",
        required: false,
        description: "URL base de la aplicación (opcional)",
      },
    ]

    // Verificar si todas las variables requeridas están configuradas
    const missingRequired = variables.filter((v) => v.required && v.status === "missing")

    return NextResponse.json({
      success: true,
      variables,
      missingRequired: missingRequired.length > 0 ? missingRequired.map((v) => v.name) : null,
      allRequiredConfigured: missingRequired.length === 0,
    })
  } catch (error) {
    console.error("Error al verificar variables de entorno:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al verificar variables de entorno",
      },
      { status: 500 },
    )
  }
}
