import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Verificar credenciales
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Establecer cookie de sesión
      cookies().set("session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 día
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: "Credenciales incorrectas" }, { status: 401 })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}
