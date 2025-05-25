// API para crear el usuario admin desde la aplicación
import { NextResponse } from "next/server"
import { createAdminUser } from "@/lib/db/seed-admin"

export async function POST() {
  try {
    const admin = await createAdminUser()

    return NextResponse.json({
      success: true,
      message: "Usuario administrador creado/actualizado correctamente",
      admin: {
        id: admin.id,
        nombre_usuario: admin.nombre_usuario,
        correo_electronico: admin.correo_electronico,
      },
    })
  } catch (error) {
    console.error("Error al crear admin:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Error al crear usuario administrador",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
