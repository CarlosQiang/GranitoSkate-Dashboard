"use server"

import { hash, compare } from "bcryptjs"
import { sql } from "@vercel/postgres"

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash)
}

export async function listAdmins() {
  try {
    const result =
      await sql`SELECT id, nombre_usuario, correo_electronico, nombre_completo, rol, activo FROM administradores`
    return result.rows
  } catch (error) {
    console.error("Error al listar administradores:", error)
    throw new Error("Error al listar administradores")
  }
}

export async function createAdmin(data: any) {
  try {
    const { nombre_usuario, correo_electronico, contrasena, nombre_completo, rol, activo } = data

    // Hash de la contraseña
    const hashedPassword = await hashPassword(contrasena)

    const result = await sql`
      INSERT INTO administradores (nombre_usuario, correo_electronico, contrasena, nombre_completo, rol, activo)
      VALUES (${nombre_usuario}, ${correo_electronico}, ${hashedPassword}, ${nombre_completo || null}, ${rol}, ${activo})
      RETURNING id, nombre_usuario, correo_electronico, nombre_completo, rol, activo
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear administrador:", error)
    throw new Error("Error al crear administrador")
  }
}

export async function updateLastLogin(userId: number): Promise<void> {
  try {
    await sql`
      UPDATE administradores
      SET ultimo_acceso = NOW()
      WHERE id = ${userId}
    `
  } catch (error) {
    console.error("Error al actualizar último acceso:", error)
    throw new Error("Error al actualizar último acceso")
  }
}
