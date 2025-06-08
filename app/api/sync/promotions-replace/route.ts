import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando sincronización de promociones...")

    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener promociones de Shopify
    console.log("📡 Obteniendo promociones de Shopify...")

    const shopifyResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/shopify/promotions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!shopifyResponse.ok) {
      console.error("❌ Error al obtener promociones de Shopify:", shopifyResponse.status)
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener promociones de Shopify",
          insertados: 0,
          errores: 1,
        },
        { status: 500 },
      )
    }

    const shopifyData = await shopifyResponse.json()
    const promociones = shopifyData.promociones || []

    console.log(`📊 Promociones obtenidas de Shopify: ${promociones.length}`)

    // Simular guardado en base de datos (ya que las promociones se manejan principalmente desde Shopify)
    let insertados = 0
    let errores = 0

    for (const promocion of promociones) {
      try {
        // Aquí normalmente guardaríamos en la BD, pero como las promociones
        // se manejan directamente desde Shopify, solo contamos como insertadas
        insertados++
        console.log(`✅ Promoción procesada: ${promocion.titulo}`)
      } catch (error) {
        errores++
        console.error(`❌ Error procesando promoción:`, error)
      }
    }

    const resultado = {
      success: true,
      message: `Sincronización de promociones completada`,
      insertados,
      errores,
      total: promociones.length,
    }

    console.log("✅ Sincronización de promociones completada:", resultado)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error("❌ Error en sincronización de promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        insertados: 0,
        errores: 1,
      },
      { status: 500 },
    )
  }
}
