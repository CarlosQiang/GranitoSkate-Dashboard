import { NextResponse } from "next/server"
import db from "@/lib/db/vercel-postgres"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "init-db-api",
})

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    logger.info("Iniciando inicialización de la base de datos")

    const result = await db.initDatabase()

    if (result.success) {
      logger.info("Base de datos inicializada correctamente")
      return NextResponse.json({
        success: true,
        message: "Base de datos inicializada correctamente",
      })
    } else {
      logger.error("Error al inicializar la base de datos", { error: result.error })
      return NextResponse.json(
        {
          success: false,
          message: "Error al inicializar la base de datos",
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    logger.error("Error al inicializar la base de datos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    return NextResponse.json(
      {
        success: false,
        message: "Error al inicializar la base de datos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return GET()
}
