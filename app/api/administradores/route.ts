import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { listAdmins, createAdmin } from "@/lib/auth-service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const admins = await listAdmins()
    return NextResponse.json(admins)
  } catch (error) {
    console.error("Error al obtener administradores:", error)
    return NextResponse.json({ error: "Error al obtener administradores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { nombre_usuario, correo_electronico, contrasena, nombre_completo, rol, activo } = body

    // Validaciones básicas
    if (!nombre_usuario || !correo_electronico || !contrasena) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si ya existe un usuario con ese nombre o correo
    const { rows: existingUsers } = await sql`
      SELECT id FROM administradores 
      WHERE nombre_usuario = ${nombre_usuario} OR correo_electronico = ${correo_electronico}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "El nombre de usuario o correo electrónico ya está en uso" }, { status: 400 })
    }

    // Crear administrador usando la función de auth-service
    const admin = await createAdmin({
      nombre_usuario,
      correo_electronico,
      contrasena,
      nombre_completo,
      rol: rol || "admin",
      activo: activo !== undefined ? activo : true,
    })

    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    console.error("Error al crear administrador:", error)
    return NextResponse.json({ error: "Error al crear administrador" }, { status: 500 })
  }
}
