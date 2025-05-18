import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Verificar si ya existe un administrador
    const adminExists = await prisma.administradores.findFirst()

    if (adminExists) {
      return NextResponse.json({
        success: true,
        message: "Ya existe un administrador en el sistema",
        admin: {
          id: adminExists.id,
          nombre_usuario: adminExists.nombre_usuario,
          correo_electronico: adminExists.correo_electronico,
          nombre_completo: adminExists.nombre_completo,
          rol: adminExists.rol,
          activo: adminExists.activo,
        },
      })
    }

    // Crear un administrador por defecto
    const hashedPassword = await hash("GranitoSkate", 10)

    const admin = await prisma.administradores.create({
      data: {
        nombre_usuario: "admin",
        correo_electronico: "admin@granitoskate.com",
        contrasena: hashedPassword,
        nombre_completo: "Administrador",
        rol: "admin",
        activo: true,
        fecha_creacion: new Date(),
        ultimo_acceso: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Administrador creado correctamente",
      admin: {
        id: admin.id,
        nombre_usuario: admin.nombre_usuario,
        correo_electronico: admin.correo_electronico,
        nombre_completo: admin.nombre_completo,
        rol: admin.rol,
        activo: admin.activo,
      },
    })
  } catch (error) {
    console.error("Error al inicializar administrador:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al inicializar administrador",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
