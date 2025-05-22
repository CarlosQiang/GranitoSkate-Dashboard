import { NextResponse } from "next/server"
import {
  checkShopifyConnection,
  checkSystemConfiguration,
  checkApiAvailability,
  checkSystemStatus,
} from "@/lib/system-check"

export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico completo del sistema...")

    // 1. Verificar conexión con Shopify
    console.log("Verificando conexión con Shopify...")
    const shopifyStatus = await checkShopifyConnection()

    // 2. Verificar configuración del sistema
    console.log("Verificando configuración del sistema...")
    const configStatus = await checkSystemConfiguration()

    // 3. Verificar disponibilidad de la API
    console.log("Verificando disponibilidad de la API...")
    const apiStatus = await checkApiAvailability()

    // 4. Verificar estado general del sistema
    console.log("Verificando estado general del sistema...")
    const systemStatus = await checkSystemStatus()

    // Determinar el estado general
    const allOk =
      shopifyStatus.status === "ok" &&
      configStatus.status === "ok" &&
      apiStatus.status === "ok" &&
      systemStatus.status === "ok"

    const summary = {
      status: allOk ? "ok" : "error",
      message: allOk ? "Todos los sistemas funcionan correctamente" : "Se encontraron problemas en uno o más sistemas",
    }

    // Resultado final
    console.log("\n✅ Diagnóstico completo finalizado")

    return NextResponse.json({
      success: true,
      summary,
      shopifyStatus,
      configStatus,
      apiStatus,
      systemStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error durante el diagnóstico completo:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido durante el diagnóstico",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
