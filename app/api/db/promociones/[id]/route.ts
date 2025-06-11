import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID de promoción no proporcionado" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM promociones 
      WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    const promocion = result.rows[0]

    return NextResponse.json({
      id: promocion.id,
      titulo: promocion.titulo,
      descripcion: promocion.descripcion,
      tipo: promocion.tipo,
      valor: Number.parseFloat(promocion.valor),
      codigo: promocion.codigo,
      fechaInicio: promocion.fecha_inicio,
      fechaFin: promocion.fecha_fin,
      activa: promocion.activa,
      shopify_id: promocion.shopify_id,
      fechaCreacion: promocion.fecha_creacion,
    })
  } catch (error) {
    console.error("Error obteniendo promoción:", error)
    return NextResponse.json({ error: "Error al obtener promoción", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID de promoción no proporcionado" }, { status: 400 })
    }

    const data = await request.json()

    // Validar datos mínimos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    const result = await sql`
      UPDATE promociones 
      SET 
        titulo = ${data.titulo}, 
        descripcion = ${data.descripcion || ""}, 
        tipo = ${data.tipo || "PORCENTAJE_DESCUENTO"}, 
        valor = ${data.valor || 0}, 
        codigo = ${data.codigo || ""}, 
        fecha_inicio = ${data.fechaInicio || new Date().toISOString()}, 
        fecha_fin = ${data.fechaFin || null}, 
        activa = ${data.activa !== undefined ? data.activa : true}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    const promocion = result.rows[0]

    return NextResponse.json({
      id: promocion.id,
      titulo: promocion.titulo,
      descripcion: promocion.descripcion,
      tipo: promocion.tipo,
      valor: Number.parseFloat(promocion.valor),
      codigo: promocion.codigo,
      fechaInicio: promocion.fecha_inicio,
      fechaFin: promocion.fecha_fin,
      activa: promocion.activa,
      shopify_id: promocion.shopify_id,
      fechaCreacion: promocion.fecha_creacion,
    })
  } catch (error) {
    console.error("Error actualizando promoción:", error)
    return NextResponse.json({ error: "Error al actualizar promoción", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID de promoción no proporcionado" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM promociones 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Promoción eliminada correctamente",
      id: result.rows[0].id,
    })
  } catch (error) {
    console.error("Error eliminando promoción:", error)
    return NextResponse.json({ error: "Error al eliminar promoción", details: error.message }, { status: 500 })
  }
}
