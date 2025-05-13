import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  obtenerAdministradorPorId,
  actualizarAdministrador,
  eliminarAdministrador,
  cambiarEstadoAdministrador,
} from "@/lib/auth-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Obtener administrador
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 })
    }

    const administrador = await obtenerAdministradorPorId(id)
    if (!administrador) {
      return NextResponse.json({ message: "Administrador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(administrador)
  } catch (error) {
    console.error(`Error en GET /api/administradores/${params.id}:`, error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Validar ID
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 })
    }

    // Si se está cambiando el estado activo, usar la función específica
    if (body.activo !== undefined && Object.keys(body).length === 1) {
      try {
        const administrador = await cambiarEstadoAdministrador(id, body.activo)
        return NextResponse.json(administrador)
      } catch (error) {
        if (error instanceof Error) {
          return NextResponse.json({ message: error.message }, { status: 400 })
        }
        throw error
      }
    }

    // Actualizar administrador
    const administrador = await actualizarAdministrador(id, body)
    return NextResponse.json(administrador)
  } catch (error) {
    console.error(`Error en PATCH /api/administradores/${params.id}:`, error)

    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes("No se encontró administrador")) {
        return NextResponse.json({ message: error.message }, { status: 404 })
      }
      if (error.message.includes("No se puede desactivar")) {
        return NextResponse.json({ message: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Validar ID
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 })
    }

    // No permitir eliminar el propio usuario
    if (session.user.id === params.id) {
      return NextResponse.json({ message: "No puedes eliminar tu propio usuario" }, { status: 400 })
    }

    // Eliminar administrador
    await eliminarAdministrador(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error en DELETE /api/administradores/${params.id}:`, error)

    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes("No se encontró administrador")) {
        return NextResponse.json({ message: error.message }, { status: 404 })
      }
      if (error.message.includes("No se puede eliminar")) {
        return NextResponse.json({ message: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
