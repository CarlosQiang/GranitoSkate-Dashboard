import { query } from "./db"

export type Administrador = {
  id: number
  nombre_usuario: string
  correo_electronico: string
  nombre_completo?: string
  rol: string
  activo: boolean
  ultimo_acceso?: Date
  fecha_creacion: Date
  fecha_actualizacion: Date
}

/**
 * Verifica las credenciales de un administrador
 * @param identifier Email o nombre de usuario
 * @param password Contraseña
 * @returns Administrador si las credenciales son válidas, null en caso contrario
 */
export async function verificarCredenciales(identifier: string, password: string) {
  try {
    // Buscar administrador por email o nombre de usuario
    const result = await query(
      `SELECT * FROM administradores 
       WHERE (correo_electronico = $1 OR nombre_usuario = $1) 
       AND activo = true`,
      [identifier],
    )

    if (result.rows.length === 0) {
      return null
    }

    const admin = result.rows[0]

    // Importar bcryptjs dinámicamente para entornos serverless
    const bcrypt = await import("bcryptjs")

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, admin.contrasena)

    if (!passwordMatch) {
      return null
    }

    // Actualizar último acceso
    await query(`UPDATE administradores SET ultimo_acceso = NOW() WHERE id = $1`, [admin.id])

    // No devolver la contraseña
    const { contrasena, ...adminSinContrasena } = admin
    return adminSinContrasena as Administrador
  } catch (error) {
    console.error("Error al verificar credenciales", error)
    return null
  }
}
