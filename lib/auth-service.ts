import { db } from "@/lib/db"
import { createHash } from "crypto"

export async function getUserByIdentifier(identifier: string) {
  try {
    // Buscar por correo electrónico o nombre de usuario
    const user = await db.query({
      text: `
        SELECT * FROM administradores 
        WHERE correo_electronico = $1 OR nombre_usuario = $1
        AND activo = true
      `,
      values: [identifier],
    })

    return user.rows[0] || null
  } catch (error) {
    console.error("Error al buscar usuario:", error)
    return null
  }
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  // Verificar si es un hash de bcrypt (comienza con $2a$, $2b$ o $2y$)
  if (hashedPassword.startsWith("$2")) {
    // Implementación para verificar contraseñas hasheadas con bcrypt
    // Esto es para mantener compatibilidad con contraseñas existentes
    try {
      // Aquí deberíamos usar bcrypt, pero como no está disponible en Vercel,
      // simplemente devolvemos false y recomendamos cambiar la contraseña
      console.warn("Contraseña hasheada con bcrypt detectada. Se recomienda cambiar la contraseña.")
      return false
    } catch (error) {
      console.error("Error al verificar contraseña bcrypt:", error)
      return false
    }
  }

  // Para contraseñas hasheadas con crypto
  try {
    const hash = createHash("sha256").update(plainPassword).digest("hex")
    return hash === hashedPassword
  } catch (error) {
    console.error("Error al verificar contraseña:", error)
    return false
  }
}

export async function updateLastLogin(userId: number) {
  try {
    await db.query({
      text: `
        UPDATE administradores 
        SET ultimo_acceso = CURRENT_TIMESTAMP 
        WHERE id = $1
      `,
      values: [userId],
    })
    return true
  } catch (error) {
    console.error("Error al actualizar último acceso:", error)
    return false
  }
}

export async function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex")
}
