import { NextResponse } from "next/server"

// Base de datos en memoria para promociones (simulación)
const promocionesDB = new Map<string, any>()

// Inicializar con algunas promociones de ejemplo
if (promocionesDB.size === 0) {
  const ejemploPromocion = {
    id: "promo_ejemplo_1",
    titulo: "Promoción de Ejemplo",
    descripcion: "Esta es una promoción de ejemplo",
    tipo: "PERCENTAGE_DISCOUNT",
    valor: 20,
    fechaInicio: new Date().toISOString(),
    fechaFin: null,
    activa: true,
    fechaCreacion: new Date().toISOString(),
  }
  promocionesDB.set("promo_ejemplo_1", ejemploPromocion)
}

export async function GET(request: Request) {
  try {
    console.log("📋 GET /api/db/promociones - Obteniendo promociones...")

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "todas"

    console.log(`🔍 Filtro aplicado: ${filter}`)

    // Obtener todas las promociones
    const todasLasPromociones = Array.from(promocionesDB.values())
    console.log(`📊 Total promociones en DB: ${todasLasPromociones.length}`)

    // Aplicar filtros
    let promocionesFiltradas = todasLasPromociones
    const now = new Date()

    switch (filter) {
      case "activas":
        promocionesFiltradas = todasLasPromociones.filter((p) => p.activa === true)
        break
      case "programadas":
        promocionesFiltradas = todasLasPromociones.filter((p) => {
          const fechaInicio = new Date(p.fechaInicio)
          return fechaInicio > now
        })
        break
      case "expiradas":
        promocionesFiltradas = todasLasPromociones.filter((p) => {
          const fechaFin = p.fechaFin ? new Date(p.fechaFin) : null
          return fechaFin && fechaFin < now
        })
        break
      default:
        // "todas" - no filtrar
        break
    }

    console.log(`✅ Promociones filtradas: ${promocionesFiltradas.length}`)

    return NextResponse.json({
      success: true,
      data: promocionesFiltradas,
      total: promocionesFiltradas.length,
      filter: filter,
    })
  } catch (error) {
    console.error("❌ Error en GET promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("📝 POST /api/db/promociones - Iniciando creación...")

    // Verificar Content-Type
    const contentType = request.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Content-Type incorrecto:", contentType)
      return NextResponse.json(
        {
          success: false,
          error: "Content-Type debe ser application/json",
        },
        { status: 400 },
      )
    }

    // Leer y parsear datos
    let data
    try {
      const rawBody = await request.text()
      console.log("📄 Raw body recibido:", rawBody)

      if (!rawBody.trim()) {
        throw new Error("Body vacío")
      }

      data = JSON.parse(rawBody)
      console.log("📋 Datos parseados:", data)
    } catch (parseError) {
      console.error("❌ Error al parsear JSON:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "JSON inválido en el body de la petición",
          details: parseError instanceof Error ? parseError.message : "Error de parsing",
        },
        { status: 400 },
      )
    }

    // Validaciones básicas
    const validationErrors: string[] = []

    if (!data.titulo || typeof data.titulo !== "string" || data.titulo.trim() === "") {
      validationErrors.push("El título es obligatorio y debe ser un texto válido")
    }

    if (data.valor === undefined || data.valor === null || isNaN(Number(data.valor)) || Number(data.valor) <= 0) {
      validationErrors.push("El valor debe ser un número mayor que cero")
    }

    if (
      data.tipo &&
      !["PERCENTAGE_DISCOUNT", "FIXED_AMOUNT_DISCOUNT", "BUY_X_GET_Y", "FREE_SHIPPING"].includes(data.tipo)
    ) {
      validationErrors.push("Tipo de promoción no válido")
    }

    if (validationErrors.length > 0) {
      console.error("❌ Errores de validación:", validationErrors)
      return NextResponse.json(
        {
          success: false,
          error: "Errores de validación",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    // Generar ID único
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const id = `promo_${timestamp}_${random}`

    // Crear objeto promoción
    const nuevaPromocion = {
      id: id,
      titulo: data.titulo.trim(),
      descripcion: data.descripcion || data.titulo.trim(),
      tipo: data.tipo || "PERCENTAGE_DISCOUNT",
      valor: Number(data.valor),
      target: data.target || "CART",
      targetId: data.targetId || null,
      fechaInicio: data.fechaInicio || new Date().toISOString(),
      fechaFin: data.fechaFin || null,
      codigo: data.codigo || null,
      activa: data.activa !== undefined ? Boolean(data.activa) : true,
      limitarUsos: Boolean(data.limitarUsos),
      limiteUsos: data.limiteUsos ? Number(data.limiteUsos) : null,
      compraMinima: data.compraMinima ? Number(data.compraMinima) : null,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    }

    console.log("💾 Guardando promoción:", nuevaPromocion)

    // Guardar en la base de datos en memoria
    promocionesDB.set(id, nuevaPromocion)

    console.log(`✅ Promoción creada exitosamente con ID: ${id}`)
    console.log(`📊 Total promociones en DB: ${promocionesDB.size}`)

    return NextResponse.json(
      {
        success: true,
        data: nuevaPromocion,
        message: "Promoción creada correctamente",
        id: id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error crítico en POST promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
