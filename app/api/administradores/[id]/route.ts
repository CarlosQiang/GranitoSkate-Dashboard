import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { createHash, randomBytes } from "crypto"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id

    // Obtener administrador por ID
    const result = await sql`
      SELECT id, nombre_usuario, email, nombre_completo, rol, activo, ultimo_acceso, fecha_creacion 
      FROM administradores
      WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error(`Error al obtener administrador con ID ${params.id}:`, error)
    return NextResponse.json({ error: "Error al obtener administrador" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const id = params.id
    const data = await request.json()
    const { nombre_usuario, email, nombre_completo, password, rol, activo } = data

    // Validar datos
    if (!nombre_usuario || !email || !rol) {
      return NextResponse.json({ error: "Faltan campos obligatorios: nombre_usuario, email, rol" }, { status: 400 })
    }

    // Verificar si el administrador existe
    const existingAdmin = await sql`
      SELECT * FROM administradores WHERE id = ${id}
    `

    if (existingAdmin.rows.length === 0) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    // Verificar si el nombre de usuario o email ya están en uso por otro administrador
    const duplicateCheck = await sql`
      SELECT id FROM administradores 
      WHERE (nombre_usuario = ${nombre_usuario} OR email = ${email}) AND id != ${id}
    `

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Ya existe otro administrador con ese nombre de usuario o email" },
        { status: 409 },
      )
    }

    let updateQuery

    // Si se proporciona una nueva contraseña, actualizarla
    if (password) {
      const salt = randomBytes(16).toString("hex")
      const passwordHash = createHash("sha256")
        .update(password + salt)
        .digest("hex")

      updateQuery = sql`
        UPDATE administradores
        SET 
          nombre_usuario = ${nombre_usuario},
          email = ${email},
          nombre_completo = ${nombre_completo || null},
          password_hash = ${passwordHash},
          salt = ${salt},
          rol = ${rol},
          activo = ${activo !== undefined ? activo : true},
          fecha_actualizacion = NOW()
        WHERE id = ${id}
        RETURNING id, nombre_usuario, email, nombre_completo, rol, activo, ultimo_acceso, fecha_creacion
      `
    } else {
      // Si no se proporciona contraseña, actualizar sin cambiar la contraseña
      updateQuery = sql`
        UPDATE administradores
        SET 
          nombre_usuario = ${nombre_usuario},
          email = ${email},
          nombre_completo = ${nombre_completo || null},
          rol = ${rol},
          activo = ${activo !== undefined ? activo : true},
          fecha_actualizacion = NOW()
        WHERE id = ${id}
        RETURNING id, nombre_usuario, email, nombre_completo, rol, activo, ultimo_acceso, fecha_creacion
      `
    }

    const result = await updateQuery
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error(`Error al actualizar administrador con ID ${params.id}:`, error)
    return NextResponse.json({ error: "Error al actualizar administrador" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const id = params.id

    // No permitir eliminar al propio usuario
    if (session.user.id === id) {
      return NextResponse.json({ error: "No puede eliminar su propio usuario" }, { status: 400 })
    }

    // Verificar si el administrador existe
    const existingAdmin = await sql`
      SELECT * FROM administradores WHERE id = ${id}
    `

    if (existingAdmin.rows.length === 0) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    // Eliminar administrador
    await sql`DELETE FROM administradores WHERE id = ${id}`

    return NextResponse.json({ success: true, message: "Administrador eliminado correctamente" })
  } catch (error) {
    console.error(`Error al eliminar administrador con ID ${params.id}:`, error)
    return NextResponse.json({ error: "Error al eliminar administrador" }, { status: 500 })
  }
}
