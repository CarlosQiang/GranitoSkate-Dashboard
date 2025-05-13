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

export type AdministradorInput = {
  nombre_usuario: string
  correo_electronico: string
  contrasena: string
  nombre_completo?: string
  rol?: string
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

    // Importar bcrypt dinámicamente para entornos serverless
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

/**
 * Obtiene todos los administradores
 * @returns Lista de administradores
 */
export async function obtenerAdministradores() {
  try {
    const result = await query(
      `SELECT id, nombre_usuario, correo_electronico, nombre_completo, 
       rol, activo, ultimo_acceso, fecha_creacion, fecha_actualizacion 
       FROM administradores 
       ORDER BY fecha_creacion DESC`,
    )

    return result.rows as Administrador[]
  } catch (error) {
    console.error("Error al obtener administradores", error)
    throw error
  }
}

/**
 * Obtiene un administrador por su ID
 * @param id ID del administrador
 * @returns Administrador si existe, null en caso contrario
 */
export async function obtenerAdministradorPorId(id: number) {
  try {
    const result = await query(
      `SELECT id, nombre_usuario, correo_electronico, nombre_completo, 
       rol, activo, ultimo_acceso, fecha_creacion, fecha_actualizacion 
       FROM administradores 
       WHERE id = $1`,
      [id],
    )

    return result.rows.length > 0 ? (result.rows[0] as Administrador) : null
  } catch (error) {
    console.error(`Error al obtener administrador con ID ${id}`, error)
    throw error
  }
}

/**
 * Crea un nuevo administrador
 * @param admin Datos del administrador
 * @returns Administrador creado
 */
export async function crearAdministrador(admin: AdministradorInput) {
  try {
    // Verificar si ya existe un administrador con el mismo email o nombre de usuario
    const existente = await query(
      `SELECT * FROM administradores 
       WHERE correo_electronico = $1 OR nombre_usuario = $2`,
      [admin.correo_electronico, admin.nombre_usuario],
    )

    if (existente.rows.length > 0) {
      throw new Error("Ya existe un administrador con ese correo o nombre de usuario")
    }

    // Importar bcrypt dinámicamente para entornos serverless
    const bcrypt = await import("bcryptjs")

    // Hashear contraseña con salt fuerte (12 rondas)
    const hashedPassword = await bcrypt.hash(admin.contrasena, 12)

    // Insertar nuevo administrador
    const result = await query(
      `INSERT INTO administradores 
       (nombre_usuario, correo_electronico, contrasena, nombre_completo, rol) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, nombre_usuario, correo_electronico, nombre_completo, 
       rol, activo, ultimo_acceso, fecha_creacion, fecha_actualizacion`,
      [
        admin.nombre_usuario,
        admin.correo_electronico,
        hashedPassword,
        admin.nombre_completo || null,
        admin.rol || "admin",
      ],
    )

    return result.rows[0] as Administrador
  } catch (error) {
    console.error("Error al crear administrador", error)
    throw error
  }
}

/**
 * Actualiza un administrador existente
 * @param id ID del administrador
 * @param admin Datos a actualizar
 * @returns Administrador actualizado
 */
export async function actualizarAdministrador(id: number, admin: Partial<AdministradorInput> & { activo?: boolean }) {
  try {
    // Construir consulta dinámica
    const updateFields = []
    const params = []
    let paramIndex = 1

    if (admin.nombre_usuario) {
      updateFields.push(`nombre_usuario = $${paramIndex}`)
      params.push(admin.nombre_usuario)
      paramIndex++
    }

    if (admin.correo_electronico) {
      updateFields.push(`correo_electronico = $${paramIndex}`)
      params.push(admin.correo_electronico)
      paramIndex++
    }

    if (admin.contrasena) {
      // Importar bcrypt dinámicamente para entornos serverless
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash(admin.contrasena, 12)
      updateFields.push(`contrasena = $${paramIndex}`)
      params.push(hashedPassword)
      paramIndex++
    }

    if (admin.nombre_completo !== undefined) {
      updateFields.push(`nombre_completo = $${paramIndex}`)
      params.push(admin.nombre_completo)
      paramIndex++
    }

    if (admin.rol) {
      updateFields.push(`rol = $${paramIndex}`)
      params.push(admin.rol)
      paramIndex++
    }

    if (admin.activo !== undefined) {
      updateFields.push(`activo = $${paramIndex}`)
      params.push(admin.activo)
      paramIndex++
    }

    // Añadir fecha de actualización
    updateFields.push(`fecha_actualizacion = NOW()`)

    // Si no hay campos para actualizar, retornar error
    if (updateFields.length === 0) {
      throw new Error("No se proporcionaron campos para actualizar")
    }

    // Añadir ID a los parámetros
    params.push(id)

    // Ejecutar consulta
    const result = await query(
      `UPDATE administradores 
       SET ${updateFields.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING id, nombre_usuario, correo_electronico, nombre_completo, 
       rol, activo, ultimo_acceso, fecha_creacion, fecha_actualizacion`,
      params,
    )

    if (result.rows.length === 0) {
      throw new Error(`No se encontró administrador con ID ${id}`)
    }

    return result.rows[0] as Administrador
  } catch (error) {
    console.error(`Error al actualizar administrador con ID ${id}`, error)
    throw error
  }
}

/**
 * Elimina un administrador
 * @param id ID del administrador
 * @returns true si se eliminó correctamente
 */
export async function eliminarAdministrador(id: number) {
  try {
    // Verificar que no sea el último superadmin activo
    const superadmins = await query(`SELECT COUNT(*) FROM administradores WHERE rol = 'superadmin' AND activo = true`)

    if (Number.parseInt(superadmins.rows[0].count) <= 1) {
      const admin = await obtenerAdministradorPorId(id)
      if (admin && admin.rol === "superadmin" && admin.activo) {
        throw new Error("No se puede eliminar el último superadmin activo")
      }
    }

    const result = await query(`DELETE FROM administradores WHERE id = $1 RETURNING id`, [id])

    if (result.rows.length === 0) {
      throw new Error(`No se encontró administrador con ID ${id}`)
    }

    return true
  } catch (error) {
    console.error(`Error al eliminar administrador con ID ${id}`, error)
    throw error
  }
}

/**
 * Cambia el estado de activación de un administrador
 * @param id ID del administrador
 * @param activo Nuevo estado
 * @returns Administrador actualizado
 */
export async function cambiarEstadoAdministrador(id: number, activo: boolean) {
  // Verificar que no sea el último superadmin activo si se está desactivando
  if (!activo) {
    const superadmins = await query(`SELECT COUNT(*) FROM administradores WHERE rol = 'superadmin' AND activo = true`)

    if (Number.parseInt(superadmins.rows[0].count) <= 1) {
      const admin = await obtenerAdministradorPorId(id)
      if (admin && admin.rol === "superadmin") {
        throw new Error("No se puede desactivar el último superadmin activo")
      }
    }
  }

  return actualizarAdministrador(id, { activo })
}
