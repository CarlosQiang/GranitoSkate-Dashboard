import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verificar variables de entorno
    const envResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/system/env-check`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })

    const envData = await envResponse.json()
    const missingRequiredVars = envData.variables?.filter((v) => v.required && v.status === "missing") || []

    // Verificar conexión con Shopify
    let shopifyStatus = { success: false, message: "No se pudo verificar la conexión con Shopify" }
    try {
      shopifyStatus = await testShopifyConnection(true)
    } catch (error) {
      console.error("Error al verificar conexión con Shopify:", error)
      shopifyStatus = {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al verificar conexión con Shopify",
      }
    }

    // Verificar conexión con la base de datos
    let dbStatus = { connected: false, message: "No se pudo verificar la conexión con la base de datos" }
    try {
      const testResult = await db.testConnection()
      dbStatus = {
        connected: testResult,
        message: testResult
          ? "Conexión exitosa con la base de datos"
          : "Error al conectar con la base de datos. Verifica las credenciales.",
      }
    } catch (error) {
      console.error("Error al verificar conexión con la base de datos:", error)
      dbStatus = {
        connected: false,
        message:
          error instanceof Error ? error.message : "Error desconocido al verificar conexión con la base de datos",
      }
    }

    // Determinar el estado general del sistema
    const allRequiredVarsPresent = missingRequiredVars.length === 0
    const shopifyConnected = shopifyStatus.success
    const dbConnected = dbStatus.connected

    let systemStatus = "error"
    let systemMessage = "Se encontraron problemas críticos en el sistema"

    if (allRequiredVarsPresent && shopifyConnected && dbConnected) {
      systemStatus = "ok"
      systemMessage = "Todos los componentes del sistema están funcionando correctamente"
    } else if ((shopifyConnected || dbConnected) && missingRequiredVars.length <= 2) {
      systemStatus = "warning"
      systemMessage = "El sistema está funcionando parcialmente. Algunos componentes requieren atención."
    }

    return NextResponse.json({
      success: systemStatus === "ok",
      summary: {
        status: systemStatus,
        message: systemMessage,
      },
      details: {
        environment: {
          status: allRequiredVarsPresent ? "ok" : "error",
          missingRequired: missingRequiredVars.map((v) => v.name),
          allRequiredPresent: allRequiredVarsPresent,
        },
        shopify: {
          status: shopifyConnected ? "ok" : "error",
          connected: shopifyConnected,
          message: shopifyStatus.message,
          data: shopifyStatus.data,
        },
        database: {
          status: dbConnected ? "ok" : "error",
          connected: dbConnected,
          message: dbStatus.message,
        },
      },
    })
  } catch (error) {
    console.error("Error al realizar diagnóstico completo:", error)
    return NextResponse.json(
      {
        success: false,
        summary: {
          status: "error",
          message: "Error al realizar diagnóstico completo",
        },
        error: error instanceof Error ? error.message : "Error desconocido al realizar diagnóstico completo",
      },
      { status: 500 },
    )
  }
}
