import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    console.log(`📝 Creando promoción en Shopify:`, data)

    // Validar datos mínimos requeridos
    if (!data.titulo) {
      return NextResponse.json({ success: false, error: "El título es obligatorio" }, { status: 400 })
    }

    // Asegurarnos de que el valor es un número
    const valorNumerico = Number.parseFloat(data.valor)
    if (isNaN(valorNumerico)) {
      return NextResponse.json({ success: false, error: "El valor debe ser un número" }, { status: 400 })
    }

    // Crear la promoción en la base de datos local primero
    try {
      const dbResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/db/promociones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: data.titulo,
          descripcion: data.descripcion || "",
          tipo: data.tipo || "PORCENTAJE_DESCUENTO",
          valor: valorNumerico,
          codigo: data.codigo || "",
          fechaInicio: data.fechaInicio || new Date().toISOString(),
          fechaFin: data.fechaFin || null,
          activa: true,
          shopify_id: `promo_${Date.now()}`, // ID temporal
        }),
      })

      if (!dbResponse.ok) {
        throw new Error(`Error al guardar en base de datos: ${dbResponse.status}`)
      }

      const dbResult = await dbResponse.json()
      console.log("✅ Promoción guardada en base de datos local:", dbResult)

      // Simular éxito de Shopify (para desarrollo)
      return NextResponse.json({
        success: true,
        data: {
          id: dbResult.id || `promo_${Date.now()}`,
          titulo: data.titulo,
          descripcion: data.descripcion || "",
          tipo: data.tipo || "PORCENTAJE_DESCUENTO",
          valor: valorNumerico,
          codigo: data.codigo || "",
          fechaInicio: data.fechaInicio || new Date().toISOString(),
          fechaFin: data.fechaFin || null,
          activa: true,
        },
        message: "Promoción creada correctamente",
      })
    } catch (dbError) {
      console.error("Error guardando en base de datos:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Error al guardar la promoción",
          details: dbError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error creando promoción:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear la promoción",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
