import { NextResponse } from "next/server"
import { fetchProducts } from "@/lib/api/products"
import shopifyClient from "@/lib/shopify"

export async function GET() {
  try {
    // Realizar varias comprobaciones para diagnosticar la conexión con Shopify
    const diagnostics = {
      connection: false,
      products: false,
      collections: false,
      orders: false,
      customers: false,
      errors: [] as string[],
    }

    // Comprobar conexión básica
    try {
      const query = `
        query {
          shop {
            name
          }
        }
      `

      const data = await shopifyClient.request(query)
      diagnostics.connection = !!data?.shop?.name
    } catch (error: any) {
      diagnostics.errors.push(`Error de conexión: ${error.message}`)
    }

    // Comprobar acceso a productos
    try {
      const products = await fetchProducts({ limit: 1 })
      diagnostics.products = products && products.length > 0
    } catch (error: any) {
      diagnostics.errors.push(`Error al acceder a productos: ${error.message}`)
    }

    // Devolver resultados del diagnóstico
    return NextResponse.json(diagnostics)
  } catch (error: any) {
    console.error("Error en diagnóstico de Shopify:", error)
    return NextResponse.json(
      { status: "error", message: `Error en diagnóstico: ${error.message}`, errors: [error.message] },
      { status: 500 },
    )
  }
}
