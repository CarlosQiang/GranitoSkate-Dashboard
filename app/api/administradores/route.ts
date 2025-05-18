import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { hashPassword } from "@/lib/auth-service"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("GET /api/administradores")

    const session = await getServerSession(authOptions)
    console.log("Session:", session)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Comentamos temporalmente la validación de rol para depurar
    /*
    if (session.user.role !== "superadmin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    */

    const result = await sql`
      SELECT id, nombre_usuario, correo_electronico, nombre_completo, rol, activo, ultimo_acceso, fecha_creacion
      FROM administradores
      ORDER BY fecha_creacion DESC
    `

    console.log(`Se encontraron ${result.rows.length} administradores`)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error al obtener administradores:", error)
    return NextResponse.json({ error: "Error al obtener administradores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/administradores")

    const session = await getServerSession(authOptions)
    console.log("Session:", session)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Comentamos temporalmente la validación de rol para depurar
    /*
    if (session.user.role !== "superadmin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    */

    const body = await request.json()
    console.log("Body:", body)

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

    // Hash de la contraseña
    const hashedPassword = await hashPassword(contrasena)

    // Crear administrador
    const result = await sql`
      INSERT INTO administradores (nombre_usuario, correo_electronico, contrasena, nombre_completo, rol, activo)
      VALUES (${nombre_usuario}, ${correo_electronico}, ${hashedPassword}, ${nombre_completo || null}, ${rol || "admin"}, ${activo !== undefined ? activo : true})
      RETURNING id, nombre_usuario, correo_electronico, nombre_completo, rol, activo
    `

    console.log("Administrador creado:", result.rows[0])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear administrador:", error)
    return NextResponse.json({ error: "Error al crear administrador" }, { status: 500 })
  }
}
