import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Simulación de base de datos en memoria para promociones
const promocionesDB = new Map<string, any>()

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "todas"

    console.log(`🔍 Obteniendo promociones con filtro: ${filter}`)

    // Obtener todas las promociones de la "base de datos" en memoria
    const todasLasPromociones = Array.from(promocionesDB.values())

    // Filtrar según el parámetro
    let promocionesFiltradas = todasLasPromociones
    if (filter === "activas") {
      promocionesFiltradas = todasLasPromociones.filter((p) => p.activa === true)
    } else if (filter === "programadas") {
      promocionesFiltradas = todasLasPromociones.filter((p) => {
        const fechaInicio = new Date(p.fechaInicio)
        return fechaInicio > new Date()
      })
    } else if (filter === "expiradas") {
      promocionesFiltradas = todasLasPromociones.filter((p) => {
        const fechaFin = p.fechaFin ? new Date(p.fechaFin) : null
        return fechaFin && fechaFin < new Date()
      })
    }

    console.log(`✅ Promociones filtradas (${filter}): ${promocionesFiltradas.length}`)
    return NextResponse.json(promocionesFiltradas)
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error)
    return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    console.log(`📝 Creando nueva promoción con datos:`, data)

    // Validar datos requeridos
    if (!data.titulo) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    // Generar ID único
    const id = Date.now().toString()

    // Preparar datos para creación
    const nuevaPromocion = {
      id: id,
      titulo: data.titulo,
      descripcion: data.descripcion || data.titulo,
      tipo: data.tipo || "PORCENTAJE_DESCUENTO",
      objetivo: data.objetivo || "TODOS_LOS_PRODUCTOS",
      valor: data.valor ? Number.parseFloat(data.valor) : 0,
      fechaInicio: data.fechaInicio || new Date().toISOString(),
      fechaFin: data.fechaFin || null,
      codigo: data.codigo || null,
      activa: data.activa !== undefined ? data.activa : true,
      limitarUsos: data.limitarUsos || false,
      limiteUsos: data.limiteUsos ? Number.parseInt(data.limiteUsos) : null,
      compraMinima: data.compraMinima ? Number.parseFloat(data.compraMinima) : null,
      fechaCreacion: new Date().toISOString(),
    }

    // Guardar en la "base de datos" en memoria
    promocionesDB.set(id, nuevaPromocion)

    console.log(`✅ Promoción creada exitosamente:`, nuevaPromocion)
    return NextResponse.json(nuevaPromocion)
  } catch (error) {
    console.error("❌ Error al crear promoción:", error)

    return NextResponse.json(
      {
        error: "Error al crear promoción",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
