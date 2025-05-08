import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Eliminar cookie de sesión
    cookies().delete("session")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}
