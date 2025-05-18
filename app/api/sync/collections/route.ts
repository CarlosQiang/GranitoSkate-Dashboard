import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyFetch } from "@/lib/shopify"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

// Función para registrar la sincronización
async function registrarSincronizacion(
  tipoEntidad: string,
  entidadId: string | null,
  accion: string,
  resultado: string,
  mensaje: string,
  detalles?: any,
) {
  try {
    await sql`
      INSERT INTO registro_sincronizacion (
        tipo_entidad, entidad_id, accion, resultado, mensaje, detalles, fecha
      ) VALUES (
        ${tipoEntidad}, ${entidadId}, ${accion}, ${resultado}, ${mensaje}, 
        ${detalles ? JSON.stringify(detalles) : null}, NOW()
      )
    `
  } catch (error) {
    console.error("Error al registrar sincronización:", error)
  }
}

// Función para obtener colecciones de Shopify
async function obtenerColeccionesDeShopify(limit = 20) {
  try {
    // Registrar inicio de la obtención
    await registrarSincronizacion(
      "colecciones",
      null,
      "consulta",
      "iniciado",
      `Obteniendo colecciones de Shopify (límite: ${limit})`,
    )

    // Consulta GraphQL para obtener colecciones
    const query = `
      query {
        collections(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              handle
              productsCount
              image {
                id
                url
                altText
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify a través del proxy
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.collections) {
      throw new Error("No se pudieron obtener colecciones de Shopify: respuesta vacía o inválida")
    }

    // Registrar éxito de la obtención
    const collectionCount = response.data.collections.edges.length
    await registrarSincronizacion(
      "colecciones",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${collectionCount} colecciones de Shopify`,
    )

    return response.data.collections.edges.map((edge: any) => edge.node)
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "colecciones",
      null,
      "consulta",
      "error",
      `Error al obtener colecciones de Shopify: ${error.message}`,
    )
    console.error("Error al obtener colecciones de Shopify:", error)
    throw error
  }
}

// Función para guardar colecciones en la base de datos
async function guardarColeccionesEnBD(colecciones) {
  try {
    // Registrar inicio del guardado
    await registrarSincronizacion(
      "colecciones",
      null,
      "guardar",
      "iniciado",
      `Guardando ${colecciones.length} colecciones en la base de datos`,
    )

    // Guardar cada colección en la base de datos
    for (const coleccion of colecciones) {
      const shopifyId = coleccion.id.split("/").pop()
      const title = coleccion.title
      const description = coleccion.description || ""
      const handle = coleccion.handle || ""
      const productsCount = coleccion.productsCount || 0

      // Obtener la imagen
      const imageUrl = coleccion.image?.url || null

      // Datos adicionales en JSON
      const datosAdicionales = {
        image: coleccion.image,
      }

      // Verificar si la colección ya existe
      const existingCollection = await sql`
        SELECT id FROM colecciones WHERE shopify_id = ${shopifyId}
      `

      if (existingCollection.rows.length > 0) {
        // Actualizar colección existente
        await sql`
          UPDATE colecciones 
          SET 
            titulo = ${title},
            descripcion = ${description},
            handle = ${handle},
            productos_count = ${productsCount},
            imagen_url = ${imageUrl},
            datos_adicionales = ${JSON.stringify(datosAdicionales)},
            actualizado_en = NOW()
          WHERE shopify_id = ${shopifyId}
        `

        await registrarSincronizacion(
          "colecciones",
          shopifyId,
          "actualizar",
          "completado",
          `Colección actualizada: ${title}`,
        )
      } else {
        // Insertar nueva colección
        await sql`
          INSERT INTO colecciones (
            shopify_id, titulo, descripcion, handle, productos_count, 
            imagen_url, datos_adicionales, creado_en, actualizado_en
          ) VALUES (
            ${shopifyId}, ${title}, ${description}, ${handle}, ${productsCount},
            ${imageUrl}, ${JSON.stringify(datosAdicionales)}, NOW(), NOW()
          )
        `

        await registrarSincronizacion("colecciones", shopifyId, "crear", "completado", `Colección creada: ${title}`)
      }
    }

    // Registrar éxito del guardado
    await registrarSincronizacion(
      "colecciones",
      null,
      "guardar",
      "completado",
      `Se guardaron ${colecciones.length} colecciones en la base de datos`,
    )

    return { success: true, count: colecciones.length }
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "colecciones",
      null,
      "guardar",
      "error",
      `Error al guardar colecciones en la base de datos: ${error.message}`,
    )
    console.error("Error al guardar colecciones en la base de datos:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el límite de la URL si existe
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")

    // Obtener colecciones de Shopify
    const colecciones = await obtenerColeccionesDeShopify(limit)

    // Guardar colecciones en la base de datos
    const resultado = await guardarColeccionesEnBD(colecciones)

    return NextResponse.json({
      success: true,
      message: `Sincronización de colecciones completada. Se sincronizaron ${resultado.count} colecciones.`,
      count: resultado.count,
    })
  } catch (error: any) {
    console.error("Error en sincronización de colecciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido en sincronización de colecciones",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
