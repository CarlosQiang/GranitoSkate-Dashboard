import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  obtenerMetadatosSeo,
  guardarMetadatosSeo,
  sincronizarSeoConShopify,
} from "@/lib/db/repositories/seo-repository"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tipoEntidad = searchParams.get("tipo_entidad")
    const idEntidad = searchParams.get("id_entidad")

    if (!tipoEntidad || !idEntidad) {
      return NextResponse.json({ error: "Parámetros requeridos: tipo_entidad, id_entidad" }, { status: 400 })
    }

    const metadatos = await obtenerMetadatosSeo(tipoEntidad, idEntidad)

    return NextResponse.json({
      success: true,
      data: metadatos,
    })
  } catch (error) {
    console.error("Error al obtener metadatos SEO:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { tipo_entidad, id_entidad, titulo, descripcion, palabras_clave, datos_adicionales, sincronizar_shopify } =
      body

    if (!tipo_entidad || !id_entidad || !titulo || !descripcion) {
      return NextResponse.json(
        {
          error: "Campos requeridos: tipo_entidad, id_entidad, titulo, descripcion",
        },
        { status: 400 },
      )
    }

    // Guardar en la base de datos local
    const success = await guardarMetadatosSeo({
      tipo_entidad,
      id_entidad,
      titulo,
      descripcion,
      palabras_clave: Array.isArray(palabras_clave) ? palabras_clave : [],
      datos_adicionales,
    })

    if (!success) {
      return NextResponse.json({ error: "Error al guardar metadatos SEO" }, { status: 500 })
    }

    // Sincronizar con Shopify si se solicita
    if (sincronizar_shopify) {
      await sincronizarSeoConShopify(tipo_entidad, id_entidad)
    }

    return NextResponse.json({
      success: true,
      message: "Metadatos SEO guardados correctamente",
    })
  } catch (error) {
    console.error("Error al guardar metadatos SEO:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
