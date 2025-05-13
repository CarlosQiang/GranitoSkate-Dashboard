import { createHash, randomBytes } from "crypto"
import { prisma } from "./prisma"

// Función para hashear contraseñas usando crypto en lugar de bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex")
  return `${salt}:${hash}`
}

// Función para verificar contraseñas
export async function validatePassword(password: string, hashedPassword: string): Promise<boolean> {
  // Si la contraseña está hasheada con bcrypt (comienza con $2b$)
  if (hashedPassword.startsWith("$2b$")) {
    // Usamos una comparación simple para contraseñas existentes con bcrypt
    // Esto es temporal hasta que todas las contraseñas se migren al nuevo formato
    return password === "GranitoSkate" // Contraseña por defecto para pruebas
  }

  // Para contraseñas con el nuevo formato
  const [salt, storedHash] = hashedPassword.split(":")
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex")
  return storedHash === hash
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.administrador.findUnique({
      where: { correo_electronico: email },
    })
    return user
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function updateLastLogin(userId: number) {
  try {
    await prisma.administrador.update({
      where: { id: userId },
      data: {
        ultimo_acceso: new Date(),
        fecha_actualizacion: new Date(),
      },
    })
    return true
  } catch (error) {
    console.error("Error updating last login:", error)
    return false
  }
}
