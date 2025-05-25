// Función para crear el usuario admin desde código
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function createAdminUser() {
  try {
    const password = "GranitoSkate"
    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await query(
      `INSERT INTO administradores (
        nombre_usuario, 
        correo_electronico, 
        contrasena, 
        nombre_completo, 
        rol, 
        activo
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (nombre_usuario) DO UPDATE SET
        correo_electronico = EXCLUDED.correo_electronico,
        contrasena = EXCLUDED.contrasena,
        nombre_completo = EXCLUDED.nombre_completo,
        activo = EXCLUDED.activo,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING id, nombre_usuario, correo_electronico`,
      ["admin", "admin@gmail.com", hashedPassword, "Administrador Principal", "admin", true],
    )

    console.log("✅ Usuario admin creado/actualizado:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("❌ Error al crear usuario admin:", error)
    throw error
  }
}
