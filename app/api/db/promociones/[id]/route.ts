import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Simulación de base de datos en memoria para promociones
const promocionesDB = new Map<string, any>()

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    console.log(`🔍 Obteniendo promoción con ID: ${id}`)

    // Buscar en la "base de datos" en memoria
    const promocion = promocionesDB.get(id)

    if (!promocion) {
      // Si no existe, crear una promoción de ejemplo basada en los datos de Shopify
      const promocionEjemplo = {
        id: id,
        titulo: "Promoción de prueba",
        descripcion: "Promoción de ejemplo",
        tipo: "PERCENTAGE_DISCOUNT",
        valor: 1,
        fechaInicio: new Date().toISOString(),
        fechaFin: null,
        codigo: null,
        activa: true,
        limitarUsos: false,
        limiteUsos: null,
        compraMinima: null,
      }

      promocionesDB.set(id, promocionEjemplo)
      console.log(`✅ Promoción creada en memoria:`, promocionEjemplo)
      return NextResponse.json(promocionEjemplo)
    }

    console.log(`✅ Promoción encontrada:`, promocion)
    return NextResponse.json(promocion)
  } catch (error) {
    console.error(`❌ Error al obtener promoción ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener promoción" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const data = await request.json()

    console.log(`📝 Actualizando promoción ${id} con datos:`, data)

    // Validar datos requeridos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    // Preparar datos para actualización
    const promocionActualizada = {
      id: id,
      titulo: data.titulo,
      descripcion: data.descripcion || data.titulo,
      tipo: data.tipo || "PERCENTAGE_DISCOUNT",
      valor: data.valor ? Number.parseFloat(data.valor) : 0,
      fechaInicio: data.fechaInicio || new Date().toISOString(),
      fechaFin: data.fechaFin || null,
      codigo: data.codigo || null,
      activa: data.activa !== undefined ? data.activa : true,
      limitarUsos: data.limitarUsos || false,
      limiteUsos: data.limiteUsos ? Number.parseInt(data.limiteUsos) : null,
      compraMinima: data.compraMinima ? Number.parseFloat(data.compraMinima) : null,
      fechaActualizacion: new Date().toISOString(),
    }

    // Guardar en la "base de datos" en memoria
    promocionesDB.set(id, promocionActualizada)

    console.log(`✅ Promoción actualizada exitosamente:`, promocionActualizada)
    return NextResponse.json(promocionActualizada)
  } catch (error) {
    console.error(`❌ Error al actualizar promoción ${params.id}:`, error)

    return NextResponse.json(
      {
        error: "Error al actualizar promoción",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id

    // Verificar que la promoción existe
    const promocion = promocionesDB.get(id)
    if (!promocion) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    // Eliminar promoción
    promocionesDB.delete(id)

    console.log(`✅ Promoción eliminada: ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`❌ Error al eliminar promoción ${params.id}:`, error)
    return NextResponse.json({ error: "Error al eliminar promoción" }, { status: 500 })
  }
}
