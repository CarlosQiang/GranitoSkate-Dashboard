import { type NextRequest, NextResponse } from "next/server"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando sincronización de colecciones...")

    // Obtener parámetros de la solicitud
    const { force = false } = await request.json()

    // Consulta GraphQL para obtener colecciones
    const query = gql`
      query {
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              productsCount
              image {
                url
                altText
              }
            }
          }
        }
      }
    `

    // Ejecutar consulta
    const data = await shopifyClient.request(query)

    if (!data || !data.collections || !data.collections.edges) {
      throw new Error("Formato de respuesta inválido de Shopify")
    }

    // Transformar datos
    const collections = data.collections.edges.map((edge) => edge.node)

    console.log(`Se encontraron ${collections.length} colecciones en Shopify`)

    // Aquí podrías guardar las colecciones en tu base de datos si lo necesitas

    return NextResponse.json({
      success: true,
      message: "Sincronización completada con éxito",
      count: collections.length,
      collections: collections.map((c) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
        productsCount: c.productsCount,
      })),
    })
  } catch (error) {
    console.error("Error en sincronización de colecciones:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error en sincronización: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

// Implementar GET para compatibilidad
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Método no permitido. Utiliza POST para sincronizar colecciones.",
    },
    { status: 405 },
  )
}
