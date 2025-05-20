import { NextResponse } from "next/server"
import syncService from "@/lib/services"

export async function GET() {
  try {
    await syncService.sincronizarColecciones()
    return NextResponse.json({ message: "Colecciones sincronizadas correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error al sincronizar colecciones:", error)
    return NextResponse.json({ message: "Error al sincronizar colecciones", error: error.message }, { status: 500 })
  }
}
