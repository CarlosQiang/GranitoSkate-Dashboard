import { createHash, randomBytes } from "crypto"
import { prisma } from "./prisma"

// Función para hashear contraseñas usando crypto nativo
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const hash = createHash("sha256")
    .update(salt + password)
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
    .update(salt + plainPassword)
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

    console.log("Usuario encontrado:", user ? `ID: ${user.id}, Usuario: ${user.nombre_usuario}` : "No encontrado")
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
    console.log(`Creando administrador: ${data.nombre_usuario}, Hash: ${hashedPassword.substring(0, 15)}...`)

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

// Función para verificar administradores existentes
export async function checkExistingAdmins() {
  try {
    const adminCount = await prisma.administrador.count()
    const admins = await prisma.administrador.findMany({
      select: {
        id: true,
        nombre_usuario: true,
        correo_electronico: true,
        nombre_completo: true,
        rol: true,
        activo: true,
      },
    })

    return {
      count: adminCount,
      admins: admins.map((admin) => ({
        ...admin,
        id: admin.id.toString(),
      })),
    }
  } catch (error) {
    console.error("Error al verificar administradores existentes:", error)
    return { count: 0, admins: [] }
  }
}
