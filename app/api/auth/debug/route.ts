import { NextResponse } from "next/server"
import { getUserByIdentifier, verifyPassword } from "@/lib/auth-service"

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: "Credenciales incompletas" }, { status: 400 })
    }

    // Buscar usuario
    const user = await getUserByIdentifier(identifier)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar contraseña
    const isValid = await verifyPassword(password, user.contrasena)

    // Devolver resultado
    return NextResponse.json({
      success: isValid,
      user: {
        id: user.id,
        nombre_usuario: user.nombre_usuario,
        correo_electronico: user.correo_electronico,
        nombre_completo: user.nombre_completo,
        rol: user.rol,
        activo: user.activo,
        contrasena_hash: user.contrasena.substring(0, 10) + "...", // Solo mostrar parte del hash por seguridad
      },
    })
  } catch (error) {
    console.error("Error en debug:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
