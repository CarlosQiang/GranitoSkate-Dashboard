import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as promocionesRepository from "@/lib/db/repositories/promociones-repository"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    console.log(`🔍 Obteniendo promoción con ID: ${id}`)

    // Intentar obtener de la base de datos primero
    let promocion = await promocionesRepository.getPromocionById(Number.parseInt(id))

    if (!promocion) {
      // Si no existe en BD, intentar obtener de Shopify
      console.log(`📡 Promoción no encontrada en BD, buscando en Shopify...`)

      const shopifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shopify/promotions/${id}`)
      if (shopifyResponse.ok) {
        promocion = await shopifyResponse.json()
      }
    }

    if (!promocion) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

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
    const datosActualizacion = {
      titulo: data.titulo,
      descripcion: data.descripcion || data.titulo,
      tipo: data.tipo || "PORCENTAJE_DESCUENTO",
      valor: data.valor ? Number.parseFloat(data.valor) : 0,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio).toISOString() : new Date().toISOString(),
      fechaFin: data.fechaFin ? new Date(data.fechaFin).toISOString() : null,
      codigo: data.codigo || null,
      activa: data.activa !== undefined ? data.activa : true,
      limitarUsos: data.limitarUsos || false,
      limiteUsos: data.limiteUsos ? Number.parseInt(data.limiteUsos) : null,
      compraMinima: data.compraMinima ? Number.parseFloat(data.compraMinima) : null,
    }

    // Verificar que la promoción existe
    const promocionExistente = await promocionesRepository.getPromocionById(Number.parseInt(id))

    let promocionActualizada
    if (promocionExistente) {
      // Actualizar en base de datos
      promocionActualizada = await promocionesRepository.updatePromocion(Number.parseInt(id), datosActualizacion)
    } else {
      // Crear nueva entrada en base de datos
      promocionActualizada = await promocionesRepository.createPromocion({
        ...datosActualizacion,
        shopifyId: id,
      })
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: id,
      accion: "UPDATE",
      resultado: "SUCCESS",
      mensaje: `Promoción actualizada: ${data.titulo}`,
    })

    console.log(`✅ Promoción actualizada exitosamente:`, promocionActualizada)
    return NextResponse.json(promocionActualizada)
  } catch (error) {
    console.error(`❌ Error al actualizar promoción ${params.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: params.id,
      accion: "UPDATE",
      resultado: "ERROR",
      mensaje: `Error al actualizar promoción: ${(error as Error).message}`,
    })

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

    const id = Number.parseInt(params.id)

    // Verificar que la promoción existe
    const promocion = await promocionesRepository.getPromocionById(id)
    if (!promocion) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    // Eliminar promoción
    await promocionesRepository.deletePromocion(id)

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: id.toString(),
      accion: "DELETE",
      resultado: "SUCCESS",
      mensaje: `Promoción eliminada: ${promocion.titulo}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`❌ Error al eliminar promoción ${params.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: params.id,
      accion: "DELETE",
      resultado: "ERROR",
      mensaje: `Error al eliminar promoción: ${(error as Error).message}`,
    })

    return NextResponse.json({ error: "Error al eliminar promoción" }, { status: 500 })
  }
}
