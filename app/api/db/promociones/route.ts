import { NextResponse } from "next/server"

// Base de datos en memoria para promociones
const promocionesDB = new Map<string, any>()

// Inicializar con promociones de ejemplo
if (promocionesDB.size === 0) {
  promocionesDB.set("promo_1", {
    id: "promo_1",
    titulo: "Descuento de Verano",
    descripcion: "20% de descuento en todos los productos",
    tipo: "PERCENTAGE_DISCOUNT",
    valor: 20,
    activa: true,
    fechaCreacion: new Date().toISOString(),
  })

  promocionesDB.set("promo_2", {
    id: "promo_2",
    titulo: "Envío Gratis",
    descripcion: "Envío gratuito en compras superiores a 50€",
    tipo: "FREE_SHIPPING",
    valor: 50,
    activa: true,
    fechaCreacion: new Date().toISOString(),
  })
}

export async function GET() {
  try {
    console.log("📋 GET promociones - Total:", promocionesDB.size)

    const promociones = Array.from(promocionesDB.values())

    return NextResponse.json({
      success: true,
      data: promociones,
      total: promociones.length,
    })
  } catch (error) {
    console.error("❌ Error GET promociones:", error)
    return NextResponse.json({ success: false, error: "Error al obtener promociones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("📝 POST promociones - Iniciando...")

    const data = await request.json()
    console.log("📋 Datos recibidos:", data)

    // Validaciones básicas y simples
    if (!data.titulo || data.titulo.trim().length < 2) {
      return NextResponse.json({ success: false, error: "El título debe tener al menos 2 caracteres" }, { status: 400 })
    }

    if (!data.valor || Number(data.valor) <= 0) {
      return NextResponse.json({ success: false, error: "El valor debe ser mayor que 0" }, { status: 400 })
    }

    // Generar ID simple
    const id = `promo_${Date.now()}`

    // Crear promoción con datos mínimos
    const nuevaPromocion = {
      id: id,
      titulo: data.titulo.trim(),
      descripcion: data.descripcion?.trim() || data.titulo.trim(),
      tipo: data.tipo || "PERCENTAGE_DISCOUNT",
      valor: Number(data.valor),
      codigo: data.codigo?.trim() || null,
      activa: true,
      fechaCreacion: new Date().toISOString(),
      fechaInicio: data.fechaInicio || new Date().toISOString(),
      fechaFin: data.fechaFin || null,
      compraMinima: data.compraMinima ? Number(data.compraMinima) : null,
    }

    // Guardar
    promocionesDB.set(id, nuevaPromocion)

    console.log("✅ Promoción creada:", id)

    return NextResponse.json({
      success: true,
      data: nuevaPromocion,
      message: "Promoción creada correctamente",
    })
  } catch (error) {
    console.error("❌ Error POST promociones:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
