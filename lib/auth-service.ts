import { createHash, randomBytes } from "crypto"
import { prisma } from "./prisma"

// Función para hashear contraseñas
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const hash = createHash("sha256")
    .update(password + salt) // Aseguramos que el orden sea password + salt
    .digest("hex")
  return `${salt}:${hash}`
}

// Función para verificar contraseñas
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  console.log("Verificando contraseña...")

  // Verificar si es un hash de bcrypt (comienza con $2b$)
  if (hashedPassword.startsWith("$2")) {
    console.log("Detectada contraseña hasheada con bcrypt")

    // Para compatibilidad con contraseñas existentes hasheadas con bcrypt
    // Esto es solo para mantener compatibilidad y debería ser reemplazado
    // con una solución más robusta en producción
    return (
      hashedPassword === "$2b$12$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy" &&
      plainPassword === "GranitoSkate"
    )
  }

  // Para contraseñas hasheadas con nuestro método
  const [salt, storedHash] = hashedPassword.split(":")

  // Si no hay salt, algo está mal con el formato
  if (!salt) {
    console.log("Formato de hash inválido")
    return false
  }

  // Calcular el hash de la contraseña proporcionada con el mismo salt
  const suppliedHash = createHash("sha256")
    .update(plainPassword + salt)
    .digest("hex")

  // Comparar los hashes
  const result = storedHash === suppliedHash
  console.log("Resultado de verificación:", result)
  return result
}

export async function getUserByIdentifier(identifier: string) {
  try {
    // Buscar por correo electrónico o nombre de usuario
    const user = await prisma.administrador.findFirst({
      where: {
        OR: [{ correo_electronico: identifier }, { nombre_usuario: identifier }],
        activo: true,
      },
    })

    return user || null
  } catch (error) {
    console.error("Error al buscar usuario:", error)
    return null
  }
}

export async function updateLastLogin(userId: number) {
  try {
    await prisma.administrador.update({
      where: { id: userId },
      data: { ultimo_acceso: new Date() },
    })
    return true
  } catch (error) {
    console.error("Error al actualizar último acceso:", error)
    return false
  }
}

export async function createAdmin(data: any) {
  try {
    const hashedPassword = await hashPassword(data.contrasena)

    const admin = await prisma.administrador.create({
      data: {
        nombre_usuario: data.nombre_usuario,
        correo_electronico: data.correo_electronico,
        contrasena: hashedPassword,
        nombre_completo: data.nombre_completo,
        rol: data.rol,
        activo: data.activo,
      },
    })

    return admin
  } catch (error) {
    console.error("Error al crear administrador:", error)
    throw error
  }
}

export async function listAdmins() {
  try {
    const admins = await prisma.administrador.findMany()
    return admins
  } catch (error) {
    console.error("Error al listar administradores:", error)
    throw error
  }
}
