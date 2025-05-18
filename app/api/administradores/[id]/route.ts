import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { hashPassword } from "@/lib/auth-service"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`GET /api/administradores/${params.id}`)

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

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Administrador no encontrado" }, { status: 404 })
    }

    console.log("Administrador encontrado:", result.rows[0])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error al obtener administrador:", error)
    return NextResponse.json({ error: "Error al obtener administrador" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`PUT /api/administradores/${params.id}`)

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
    const { rows: duplicateUser } = await sql`
      SELECT id FROM administradores 
      WHERE (nombre_usuario = ${nombre_usuario} OR correo_electronico = ${correo_electronico})
      AND id != ${params.id}
    `

    if (duplicateUser.length > 0) {
      return NextResponse.json({ error: "El nombre de usuario o correo electrónico ya está en uso" }, { status: 400 })
    }

    let result

    // Si se proporciona una nueva contraseña, actualizarla
    if (contrasena) {
      const hashedPassword = await hashPassword(contrasena)

      result = await sql`
        UPDATE administradores
        SET 
          nombre_usuario = ${nombre_usuario},
          correo_electronico = ${correo_electronico},
          contrasena = ${hashedPassword},
          nombre_completo = ${nombre_completo || null},
          rol = ${rol},
          activo = ${activo}
        WHERE id = ${params.id}
        RETURNING id, nombre_usuario, correo_electronico, nombre_completo, rol, activo
      `
    } else {
      result = await sql`
        UPDATE administradores
        SET 
          nombre_usuario = ${nombre_usuario},
          correo_electronico = ${correo_electronico},
          nombre_completo = ${nombre_completo || null},
          rol = ${rol},
          activo = ${activo}
        WHERE id = ${params.id}
        RETURNING id, nombre_usuario, correo_electronico, nombre_completo, rol, activo
      `
    }

    console.log("Administrador actualizado:", result.rows[0])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error al actualizar administrador:", error)
    return NextResponse.json({ error: "Error al actualizar administrador" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`DELETE /api/administradores/${params.id}`)

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
    await sql`
      DELETE FROM administradores
      WHERE id = ${params.id}
    `

    console.log("Administrador eliminado")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar administrador:", error)
    return NextResponse.json({ error: "Error al eliminar administrador" }, { status: 500 })
  }
}
