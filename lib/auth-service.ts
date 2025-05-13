import { prisma } from "./prisma"
import bcrypt from "bcrypt"

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

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    console.error("Error al verificar contraseña:", error)
    return false
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

export async function hashPassword(password: string) {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
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
