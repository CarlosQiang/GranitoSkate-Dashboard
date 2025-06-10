export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "todas"

    console.log(`🔍 API Shopify: Obteniendo promociones con filtro: ${filter}`)

    // Simular datos de promociones de Shopify para pruebas
    const promocionesShopify = [
      {
        id: "gid://shopify/DiscountCodeNode/1",
        titulo: "Descuento Verano 2024",
        descripcion: "20% de descuento en toda la tienda",
        tipo: "PORCENTAJE_DESCUENTO",
        valor: 20,
        codigo: "VERANO20",
        fechaInicio: "2024-06-01T00:00:00Z",
        fechaFin: "2024-08-31T23:59:59Z",
        activa: true,
        limite_uso: 100,
        contador_uso: 25,
      },
      {
        id: "gid://shopify/DiscountCodeNode/2",
        titulo: "Envío Gratis",
        descripcion: "Envío gratuito en pedidos superiores a 50€",
        tipo: "ENVIO_GRATIS",
        valor: 0,
        codigo: "ENVIOGRATIS",
        fechaInicio: "2024-01-01T00:00:00Z",
        fechaFin: null,
        activa: true,
        limite_uso: null,
        contador_uso: 150,
      },
      {
        id: "gid://shopify/DiscountCodeNode/3",
        titulo: "Black Friday",
        descripcion: "30% de descuento especial Black Friday",
        tipo: "PORCENTAJE_DESCUENTO",
        valor: 30,
        codigo: "BLACKFRIDAY30",
        fechaInicio: "2024-11-29T00:00:00Z",
        fechaFin: "2024-11-29T23:59:59Z",
        activa: false,
        limite_uso: 500,
        contador_uso: 0,
      },
    ]

    // Aplicar filtros
    let promocionesFiltradas = promocionesShopify
    if (filter === "activas") {
      promocionesFiltradas = promocionesShopify.filter((p) => p.activa === true)
    } else if (filter === "programadas") {
      const now = new Date()
      promocionesFiltradas = promocionesShopify.filter((p) => {
        const fechaInicio = new Date(p.fechaInicio)
        return fechaInicio > now
      })
    } else if (filter === "expiradas") {
      const now = new Date()
      promocionesFiltradas = promocionesShopify.filter((p) => {
        const fechaFin = p.fechaFin ? new Date(p.fechaFin) : null
        return fechaFin && fechaFin < now
      })
    }

    console.log(`✅ Promociones filtradas (${filter}): ${promocionesFiltradas.length}`)

    return NextResponse.json({
      success: true,
      promociones: promocionesFiltradas,
      count: promocionesFiltradas.length,
    })
  } catch (error) {
    console.error("❌ Error en API Shopify promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promociones de Shopify",
        promociones: [],
        count: 0,
      },
      { status: 500 },
    )
  }
}
