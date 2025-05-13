import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const administradores = await prisma.administrador.findMany({
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
      orderBy: {
        fecha_creacion: "desc",
      },
    })

    return NextResponse.json(administradores)
  } catch (error) {
    console.error("Error al obtener administradores:", error)
    return NextResponse.json({ message: "Error al obtener administradores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { nombre_usuario, correo_electronico, contrasena, nombre_completo, rol, activo } = body

    // Validar datos
    if (!nombre_usuario || !correo_electronico || !contrasena) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar si ya existe un usuario con ese nombre o correo
    const existingUser = await prisma.administrador.findFirst({
      where: {
        OR: [{ nombre_usuario }, { correo_electronico }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "El nombre de usuario o correo electrónico ya está en uso" }, { status: 400 })
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(contrasena)

    // Crear administrador
    const newAdmin = await prisma.administrador.create({
      data: {
        nombre_usuario,
        correo_electronico,
        contrasena: hashedPassword,
        nombre_completo: nombre_completo || null,
        rol: rol || "admin",
        activo: activo !== undefined ? activo : true,
      },
    })

    return NextResponse.json(
      {
        id: newAdmin.id,
        nombre_usuario: newAdmin.nombre_usuario,
        correo_electronico: newAdmin.correo_electronico,
        nombre_completo: newAdmin.nombre_completo,
        rol: newAdmin.rol,
        activo: newAdmin.activo,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear administrador:", error)
    return NextResponse.json({ message: "Error al crear administrador" }, { status: 500 })
  }
}
