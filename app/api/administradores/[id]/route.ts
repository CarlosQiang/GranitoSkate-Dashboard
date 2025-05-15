import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { createHash, randomBytes } from "crypto"

// Función para hashear contraseñas
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex")
  return `${salt}:${hash}`
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
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
      WHERE 
        id = ${params.id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
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
    const { rows: existingAdmin } = await sql`
      SELECT id FROM administradores WHERE id = ${params.id}
    `

    if (existingAdmin.length === 0) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    // Verificar si el nombre de usuario o correo ya está en uso por otro administrador
    const { rows: existingUsers } = await sql`
      SELECT id FROM administradores 
      WHERE (nombre_usuario = ${nombre_usuario} OR correo_electronico = ${correo_electronico})
      AND id != ${params.id}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "El nombre de usuario o correo electrónico ya está en uso" }, { status: 400 })
    }

    // Actualizar administrador
    let result
    if (contrasena) {
      // Si se proporciona una nueva contraseña, actualizarla
      const hashedPassword = hashPassword(contrasena)
      result = await sql`
        UPDATE administradores
        SET 
          nombre_usuario = ${nombre_usuario},
          correo_electronico = ${correo_electronico},
          contrasena = ${hashedPassword},
          nombre_completo = ${nombre_completo || null},
          rol = ${rol},
          activo = ${activo},
          fecha_actualizacion = NOW()
        WHERE id = ${params.id}
        RETURNING id, nombre_usuario, correo_electronico, nombre_completo, rol, activo
      `
    } else {
      // Si no se proporciona contraseña, mantener la actual
      result = await sql`
        UPDATE administradores
        SET 
          nombre_usuario = ${nombre_usuario},
          correo_electronico = ${correo_electronico},
          nombre_completo = ${nombre_completo || null},
          rol = ${rol},
          activo = ${activo},
          fecha_actualizacion = NOW()
        WHERE id = ${params.id}
        RETURNING id, nombre_usuario, correo_electronico, nombre_completo, rol, activo
      `
    }

    return NextResponse.json(result.rows[0])
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
    const { rows: existingAdmin } = await sql`
      SELECT correo_electronico FROM administradores WHERE id = ${params.id}
    `

    if (existingAdmin.length === 0) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    // No permitir eliminar al propio usuario
    if (existingAdmin[0].correo_electronico === session.user.email) {
      return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 })
    }

    // Eliminar administrador
    await sql`DELETE FROM administradores WHERE id = ${params.id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar administrador:", error)
    return NextResponse.json({ error: "Error al eliminar administrador" }, { status: 500 })
  }
}
