import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createPromocion, getAllPromociones } from "@/lib/db/repositories/promociones-repository"

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

    // Intentar obtener promociones de la base de datos
    try {
      const promocionesFromDB = await getAllPromociones()
      if (promocionesFromDB && promocionesFromDB.length > 0) {
        console.log(`✅ Promociones obtenidas de la base de datos: ${promocionesFromDB.length}`)

        // Filtrar según el parámetro
        let promocionesFiltradas = promocionesFromDB
        if (filter === "activas") {
          promocionesFiltradas = promocionesFromDB.filter((p) => p.activa === true)
        } else if (filter === "programadas") {
          promocionesFiltradas = promocionesFromDB.filter((p) => {
            const fechaInicio = new Date(p.fecha_inicio)
            return fechaInicio > new Date()
          })
        } else if (filter === "expiradas") {
          promocionesFiltradas = promocionesFromDB.filter((p) => {
            const fechaFin = p.fecha_fin ? new Date(p.fecha_fin) : null
            return fechaFin && fechaFin < new Date()
          })
        }

        return NextResponse.json(promocionesFiltradas)
      }
    } catch (dbError) {
      console.error("Error al obtener promociones de la base de datos:", dbError)
    }

    // Si no hay promociones en la base de datos, usar la memoria
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

    try {
      // Intentar guardar en la base de datos
      const promocionDB = await createPromocion({
        shopify_id: data.shopify_id || null,
        titulo: data.titulo,
        descripcion: data.descripcion || data.titulo,
        tipo: data.tipo || "PORCENTAJE_DESCUENTO",
        valor: data.valor ? Number.parseFloat(data.valor.toString()) : 0,
        codigo: data.codigo || null,
        objetivo: data.objetivo || "TODOS_LOS_PRODUCTOS",
        objetivo_id: data.objetivo_id || null,
        condiciones: data.condiciones || null,
        fecha_inicio: data.fechaInicio ? new Date(data.fechaInicio) : new Date(),
        fecha_fin: data.fechaFin ? new Date(data.fechaFin) : null,
        activa: data.activa !== undefined ? data.activa : true,
        limite_uso: data.limiteUsos ? Number.parseInt(data.limiteUsos.toString()) : null,
        contador_uso: 0,
        es_automatica: data.es_automatica !== undefined ? data.es_automatica : !data.codigo,
      })

      console.log(`✅ Promoción guardada en base de datos:`, promocionDB)
      return NextResponse.json(promocionDB)
    } catch (dbError) {
      console.error("Error al guardar promoción en base de datos:", dbError)

      // Si falla la base de datos, guardar en memoria
      // Generar ID único
      const id = Date.now().toString()

      // Preparar datos para creación
      const nuevaPromocion = {
        id: id,
        titulo: data.titulo,
        descripcion: data.descripcion || data.titulo,
        tipo: data.tipo || "PORCENTAJE_DESCUENTO",
        objetivo: data.objetivo || "TODOS_LOS_PRODUCTOS",
        valor: data.valor ? Number.parseFloat(data.valor.toString()) : 0,
        fechaInicio: data.fechaInicio || new Date().toISOString(),
        fechaFin: data.fechaFin || null,
        codigo: data.codigo || null,
        activa: data.activa !== undefined ? data.activa : true,
        limitarUsos: data.limitarUsos || false,
        limiteUsos: data.limiteUsos ? Number.parseInt(data.limiteUsos.toString()) : null,
        compraMinima: data.compraMinima ? Number.parseFloat(data.compraMinima.toString()) : null,
        fechaCreacion: new Date().toISOString(),
      }

      // Guardar en la "base de datos" en memoria
      promocionesDB.set(id, nuevaPromocion)

      console.log(`✅ Promoción creada exitosamente en memoria:`, nuevaPromocion)
      return NextResponse.json(nuevaPromocion)
    }
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
