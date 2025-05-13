import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { obtenerAdministradores, crearAdministrador } from "@/lib/auth-service"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    // Verificar rol
    if (session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
    }

    // Obtener administradores
    const administradores = await obtenerAdministradores()
    return NextResponse.json(administradores)
  } catch (error) {
    console.error("Error en GET /api/administradores:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    // Verificar rol
    if (session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
    }

    // Obtener datos del cuerpo
    const body = await request.json()

    // Validar datos
    if (!body.nombre_usuario || !body.correo_electronico || !body.contrasena) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.correo_electronico)) {
      return NextResponse.json({ message: "Formato de correo electrónico inválido" }, { status: 400 })
    }

    // Validar longitud de contraseña
    if (body.contrasena.length < 8) {
      return NextResponse.json({ message: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Crear administrador
    const administrador = await crearAdministrador({
      nombre_usuario: body.nombre_usuario,
      correo_electronico: body.correo_electronico,
      contrasena: body.contrasena,
      nombre_completo: body.nombre_completo,
      rol: body.rol || "admin",
    })

    return NextResponse.json(administrador, { status: 201 })
  } catch (error) {
    console.error("Error en POST /api/administradores:", error)

    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes("Ya existe un administrador")) {
        return NextResponse.json({ message: error.message }, { status: 409 })
      }
    }

    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
