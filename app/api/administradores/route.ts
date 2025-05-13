import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createAdmin, listAdmins } from "@/lib/auth-service"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const admins = await listAdmins()
    return NextResponse.json(admins)
  } catch (error) {
    console.error("Error al obtener administradores:", error)
    return NextResponse.json({ error: "Error al obtener administradores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const data = await request.json()

    // Validaciones básicas
    if (!data.nombre_usuario || !data.correo_electronico || !data.contrasena) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const admin = await createAdmin(data)

    // No devolver la contraseña en la respuesta
    const { contrasena, ...adminSinContrasena } = admin

    return NextResponse.json(adminSinContrasena, { status: 201 })
  } catch (error: any) {
    console.error("Error al crear administrador:", error)

    // Manejar errores de unicidad
    if (error.code === "P2002") {
      return NextResponse.json({ error: `El ${error.meta?.target[0]} ya está en uso` }, { status: 400 })
    }

    return NextResponse.json({ error: "Error al crear administrador" }, { status: 500 })
  }
}
