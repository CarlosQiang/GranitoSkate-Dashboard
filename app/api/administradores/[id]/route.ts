import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const admin = await prisma.administrador.findUnique({
      where: { id: Number.parseInt(params.id) },
      select: {
        id: true,
        nombre_usuario: true,
        correo_electronico: true,
        nombre_completo: true,
        rol: true,
        activo: true,
        ultimo_acceso: true,
        fecha_creacion: true,
      },
    })

    if (!admin) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Error al obtener administrador:", error)
    return NextResponse.json({ error: "Error al obtener administrador" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { nombre_usuario, correo_electronico, contrasena, nombre_completo, rol, activo } = body

    // Validaciones básicas
    if (!nombre_usuario || !correo_electronico) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el administrador existe
    const existingAdmin = await prisma.administrador.findUnique({
      where: { id: Number.parseInt(params.id) },
    })

    if (!existingAdmin) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    // Verificar si el nombre de usuario o correo ya está en uso por otro administrador
    const duplicateUser = await prisma.administrador.findFirst({
      where: {
        OR: [{ nombre_usuario }, { correo_electronico }],
        NOT: { id: Number.parseInt(params.id) },
      },
    })

    if (duplicateUser) {
      return NextResponse.json({ error: "El nombre de usuario o correo electrónico ya está en uso" }, { status: 400 })
    }

    // Preparar datos para actualización
    const updateData: any = {
      nombre_usuario,
      correo_electronico,
      nombre_completo,
      rol,
      activo,
    }

    // Si se proporciona una nueva contraseña, actualizarla
    if (contrasena) {
      updateData.contrasena = await hashPassword(contrasena)
    }

    // Actualizar administrador
    const updatedAdmin = await prisma.administrador.update({
      where: { id: Number.parseInt(params.id) },
      data: updateData,
      select: {
        id: true,
        nombre_usuario: true,
        correo_electronico: true,
        nombre_completo: true,
        rol: true,
        activo: true,
      },
    })

    return NextResponse.json(updatedAdmin)
  } catch (error) {
    console.error("Error al actualizar administrador:", error)
    return NextResponse.json({ error: "Error al actualizar administrador" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar si el administrador existe
    const existingAdmin = await prisma.administrador.findUnique({
      where: { id: Number.parseInt(params.id) },
    })

    if (!existingAdmin) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    // No permitir eliminar al propio usuario
    if (existingAdmin.correo_electronico === session.user.email) {
      return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 })
    }

    // Eliminar administrador
    await prisma.administrador.delete({
      where: { id: Number.parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar administrador:", error)
    return NextResponse.json({ error: "Error al eliminar administrador" }, { status: 500 })
  }
}
