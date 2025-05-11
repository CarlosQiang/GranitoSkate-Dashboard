import { NextResponse } from "next/server"
import { checkRequiredEnvVars } from "@/lib/env-check"

export async function GET() {
  try {
    // Verificar las variables de entorno necesarias
    const { success, missingVars } = checkRequiredEnvVars()

    // Obtener todas las variables de entorno (solo sus nombres, no sus valores por seguridad)
    const allVars: Record<string, string> = {}
    Object.keys(process.env).forEach((key) => {
      // Solo incluimos si la variable existe y no es sensible
      if (process.env[key]) {
        // Para variables sensibles, solo indicamos si están definidas
        if (key.includes("SECRET") || key.includes("TOKEN") || key.includes("PASSWORD")) {
          allVars[key] = "[REDACTED]"
        } else {
          // Para otras variables, mostramos un fragmento del valor
          const value = process.env[key] || ""
          allVars[key] = value.length > 5 ? `${value.substring(0, 3)}...` : "[EMPTY]"
        }
      }
    })

    return NextResponse.json({
      success,
      missingVars,
      allVars,
    })
  } catch (error) {
    console.error("Error en el endpoint de verificación de variables de entorno:", error)
    return NextResponse.json(
      {
        success: false,
        missingVars: [],
        allVars: {},
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
