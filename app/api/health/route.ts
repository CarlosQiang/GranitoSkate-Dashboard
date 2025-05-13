import { NextResponse } from "next/server"
import { checkConnection } from "@/lib/db"

export async function GET() {
  try {
    const result = await checkConnection()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error en health check:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}
