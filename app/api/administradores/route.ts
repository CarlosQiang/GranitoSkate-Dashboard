import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { createHash, randomBytes } from "crypto"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el usuario tiene permisos de administrador
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No tiene permisos para esta acción" }, { status: 403 })
    }

    // Obtener todos los administradores
    const result = await sql`
      SELECT id, nombre_usuario, email, nombre_completo, rol, activo, ultimo_acceso, fecha_creacion 
      FROM administradores
      ORDER BY fecha_creacion DESC
    `

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error al obtener administradores:", error)
    return NextResponse.json({ error: "Error al obtener administradores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el usuario tiene permisos de administrador
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No tiene permisos para esta acción" }, { status: 403 })
    }

    const data = await request.json()
    const { nombre_usuario, email, nombre_completo, password, rol } = data

    // Validar datos
    if (!nombre_usuario || !email || !password || !rol) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre_usuario, email, password, rol" },
        { status: 400 },
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await sql`
      SELECT id FROM administradores 
      WHERE nombre_usuario = ${nombre_usuario} OR email = ${email}
    `

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Ya existe un administrador con ese nombre de usuario o email" },
        { status: 409 },
      )
    }

    // Generar salt y hash de la contraseña
    const salt = randomBytes(16).toString("hex")
    const passwordHash = createHash("sha256")
      .update(password + salt)
      .digest("hex")

    // Crear nuevo administrador
    const result = await sql`
      INSERT INTO administradores (
        nombre_usuario, email, nombre_completo, password_hash, salt, rol, activo, fecha_creacion, fecha_actualizacion
      )
      VALUES (
        ${nombre_usuario}, ${email}, ${nombre_completo || null}, ${passwordHash}, ${salt}, ${rol}, true, NOW(), NOW()
      )
      RETURNING id, nombre_usuario, email, nombre_completo, rol, activo, fecha_creacion
    `

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear administrador:", error)
    return NextResponse.json({ error: "Error al crear administrador" }, { status: 500 })
  }
}
