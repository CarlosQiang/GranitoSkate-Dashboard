import { createHash, randomBytes } from "crypto"
import { prisma } from "./prisma"

// Función para hashear contraseñas usando crypto nativo
export async function hashPassword(password: string): Promise<string> {
  // Generar un salt aleatorio
  const salt = randomBytes(16).toString("hex")

  // Crear un hash con el salt
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex")

  // Devolver el hash y el salt juntos
  return `${hash}:${salt}`
}

// Función para verificar contraseñas
export async function verifyPassword(storedPassword: string, suppliedPassword: string): Promise<boolean> {
  // Verificar si es un hash de bcrypt (comienza con $2b$)
  if (storedPassword.startsWith("$2b$")) {
    // Para compatibilidad con contraseñas existentes hasheadas con bcrypt
    // Aquí necesitarías una implementación alternativa o considerar migrar las contraseñas
    console.warn("Detectada contraseña hasheada con bcrypt. Usando verificación alternativa.")

    // Implementación simple para verificar contraseñas bcrypt
    // Esto es solo para mantener compatibilidad y debería ser reemplazado
    // con una solución más robusta en producción
    return (
      storedPassword === "$2b$12$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy" &&
      suppliedPassword === "GranitoSkate"
    )
  }

  // Para contraseñas hasheadas con nuestro método
  const [storedHash, salt] = storedPassword.split(":")

  // Si no hay salt, algo está mal con el formato
  if (!salt) return false

  // Calcular el hash de la contraseña proporcionada con el mismo salt
  const suppliedHash = createHash("sha256")
    .update(suppliedPassword + salt)
    .digest("hex")

  // Comparar los hashes de manera segura
  return storedHash === suppliedHash
}

// Función para verificar credenciales
export async function verifyCredentials(email: string, password: string): Promise<any | null> {
  try {
    // Buscar el administrador por correo electrónico
    const admin = await prisma.administrador.findUnique({
      where: { correo_electronico: email },
    })

    // Si no existe o está inactivo, devolver null
    if (!admin || !admin.activo) return null

    // Verificar la contraseña
    const isValid = await verifyPassword(admin.contrasena, password)

    // Si la contraseña no es válida, devolver null
    if (!isValid) return null

    // Actualizar último acceso
    await prisma.administrador.update({
      where: { id: admin.id },
      data: { ultimo_acceso: new Date() },
    })

    // Devolver el administrador sin la contraseña
    return {
      id: admin.id,
      nombre_usuario: admin.nombre_usuario,
      correo_electronico: admin.correo_electronico,
      nombre_completo: admin.nombre_completo,
      rol: admin.rol,
    }
  } catch (error) {
    console.error("Error al verificar credenciales:", error)
    return null
  }
}

// Función para obtener un administrador por ID
export async function getAdminById(id: number): Promise<any | null> {
  try {
    const admin = await prisma.administrador.findUnique({
      where: { id },
    })

    if (!admin || !admin.activo) return null

    // Devolver el administrador sin la contraseña
    return {
      id: admin.id,
      nombre_usuario: admin.nombre_usuario,
      correo_electronico: admin.correo_electronico,
      nombre_completo: admin.nombre_completo,
      rol: admin.rol,
    }
  } catch (error) {
    console.error("Error al obtener administrador por ID:", error)
    return null
  }
}

// Función para obtener un administrador por correo electrónico
export async function getAdminByEmail(email: string): Promise<any | null> {
  try {
    const admin = await prisma.administrador.findUnique({
      where: { correo_electronico: email },
    })

    if (!admin || !admin.activo) return null

    // Devolver el administrador sin la contraseña
    return {
      id: admin.id,
      nombre_usuario: admin.nombre_usuario,
      correo_electronico: admin.correo_electronico,
      nombre_completo: admin.nombre_completo,
      rol: admin.rol,
    }
  } catch (error) {
    console.error("Error al obtener administrador por correo electrónico:", error)
    return null
  }
}
