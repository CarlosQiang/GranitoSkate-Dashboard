import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/prisma"

export async function GET() {
  try {
    const isConnected = await checkDatabaseConnection()

    if (isConnected) {
      return NextResponse.json({ status: "ok", message: "Conexión a la base de datos establecida correctamente" })
    } else {
      return NextResponse.json({ status: "error", message: "No se pudo conectar a la base de datos" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)
    return NextResponse.json(
      { status: "error", message: "Error al verificar la conexión a la base de datos", error: String(error) },
      { status: 500 },
    )
  }
}
