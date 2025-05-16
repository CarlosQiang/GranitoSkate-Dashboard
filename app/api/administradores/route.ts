import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { createHash, randomBytes } from "crypto"

// Corregir la función de hashPassword para que coincida con lib/auth-service.ts
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = createHash("sha256")
    .update(password + salt) // Aseguramos que el orden sea password + salt
    .digest("hex")
  return `${salt}:${hash}`
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { rows } = await sql`
      SELECT 
        id, 
        nombre_usuario, 
        correo_electronico, 
        nombre_completo, 
        rol, 
        activo, 
        ultimo_acceso, 
        fecha_creacion
      FROM 
        administradores
      ORDER BY 
        fecha_creacion DESC
    `

    return NextResponse.json(rows)
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

    // Hashear contraseña
    const hashedPassword = hashPassword(contrasena)

    // Crear administrador
    const { rows } = await sql`
      INSERT INTO administradores (
        nombre_usuario, 
        correo_electronico, 
        contrasena, 
        nombre_completo, 
        rol, 
        activo
      ) 
      VALUES (
        ${nombre_usuario}, 
        ${correo_electronico}, 
        ${hashedPassword}, 
        ${nombre_completo || null}, 
        ${rol || "admin"}, 
        ${activo !== undefined ? activo : true}
      )
      RETURNING id, nombre_usuario, correo_electronico, nombre_completo, rol, activo
    `

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear administrador:", error)
    return NextResponse.json({ error: "Error al crear administrador" }, { status: 500 })
  }
}
