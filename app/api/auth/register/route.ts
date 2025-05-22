import { NextResponse } from "next/server"
import { hash } from "bcryptjs" // Cambiado de bcrypt a bcryptjs
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { nombre, email, password, rol = "admin" } = await request.json()

    // Validar datos
    if (!nombre || !email || !password) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingAdmin = await prisma.administrador.findFirst({
      where: { email },
    })

    if (existingAdmin) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
    }

    // Hash de la contraseña
    const hashedPassword = await hash(password, 10)

    // Crear administrador
    const admin = await prisma.administrador.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        activo: true,
        fecha_registro: new Date(),
      },
    })

    return NextResponse.json(
      {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al registrar administrador:", error)
    return NextResponse.json({ error: "Error al registrar administrador" }, { status: 500 })
  }
}
