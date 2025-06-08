import { type NextRequest, NextResponse } from "next/server"
import { getAllPromociones, createPromocion } from "@/lib/db/repositories/promociones-repository"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "todas"

    console.log(`🔍 Obteniendo promociones de BD con filtro: ${filter}`)

    const promociones = await getAllPromociones()

    // Aplicar filtros
    let promocionesFiltradas = promociones
    if (filter === "activas") {
      promocionesFiltradas = promociones.filter((p) => p.activa)
    } else if (filter === "programadas") {
      const now = new Date()
      promocionesFiltradas = promociones.filter((p) => p.fecha_inicio && new Date(p.fecha_inicio) > now)
    } else if (filter === "expiradas") {
      const now = new Date()
      promocionesFiltradas = promociones.filter((p) => p.fecha_fin && new Date(p.fecha_fin) < now)
    }

    console.log(`✅ Promociones encontradas en BD: ${promocionesFiltradas.length}`)

    return NextResponse.json(promocionesFiltradas)
  } catch (error) {
    console.error("❌ Error obteniendo promociones de BD:", error)
    return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log(`📝 Creando promoción en BD:`, data)

    const promocion = await createPromocion({
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      objetivo: data.objetivo,
      valor: Number.parseFloat(data.valor),
      codigo: data.codigo,
      fecha_inicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
      fecha_fin: data.fechaFin ? new Date(data.fechaFin) : null,
      activa: true,
      limite_uso: data.limitarUsos ? Number.parseInt(data.limiteUsos) : null,
      es_automatica: !data.codigo,
    })

    console.log(`✅ Promoción creada en BD:`, promocion)

    return NextResponse.json(promocion)
  } catch (error) {
    console.error("❌ Error creando promoción en BD:", error)
    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 })
  }
}
