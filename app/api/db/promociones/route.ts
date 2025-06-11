import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const result = await sql`
      SELECT * FROM promociones 
      ORDER BY fecha_creacion DESC
    `

    return NextResponse.json(
      result.rows.map((row) => ({
        id: row.id,
        titulo: row.titulo,
        descripcion: row.descripcion,
        tipo: row.tipo,
        valor: Number.parseFloat(row.valor),
        codigo: row.codigo,
        fechaInicio: row.fecha_inicio,
        fechaFin: row.fecha_fin,
        activa: row.activa,
        shopify_id: row.shopify_id,
        fechaCreacion: row.fecha_creacion,
      })),
    )
  } catch (error) {
    console.error("Error obteniendo promociones:", error)
    return NextResponse.json({ error: "Error al obtener promociones", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Validar datos mínimos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO promociones (
        titulo, 
        descripcion, 
        tipo, 
        valor, 
        codigo, 
        fecha_inicio, 
        fecha_fin, 
        activa, 
        shopify_id
      ) 
      VALUES (
        ${data.titulo}, 
        ${data.descripcion || ""}, 
        ${data.tipo || "PORCENTAJE_DESCUENTO"}, 
        ${data.valor || 0}, 
        ${data.codigo || ""}, 
        ${data.fechaInicio || new Date().toISOString()}, 
        ${data.fechaFin || null}, 
        ${data.activa !== undefined ? data.activa : true}, 
        ${data.shopify_id || `local_${Date.now()}`}
      )
      RETURNING *
    `

    if (result.rows.length === 0) {
      throw new Error("No se pudo crear la promoción")
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
    console.error("Error creando promoción:", error)
    return NextResponse.json({ error: "Error al crear promoción", details: error.message }, { status: 500 })
  }
}
