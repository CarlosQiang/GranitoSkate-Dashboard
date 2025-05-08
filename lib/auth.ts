// Simulación de autenticación sin next-auth
import { cookies } from "next/headers"

export type User = {
  id: string
  name: string
  email: string
  image?: string
  role: "admin" | "user"
}

export type Session = {
  user: User
  expires: string
}

// Función para verificar si hay una sesión activa
export function getSession(): Session | null {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")

  if (!sessionCookie) return null

  try {
    // En producción, esto debería verificar un token JWT o similar
    // Por ahora, simplemente devolvemos un usuario de prueba
    return {
      user: {
        id: "1",
        name: "Admin User",
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        role: "admin",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error)
    return null
  }
}

// Función para verificar si el usuario está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const session = getSession()
  return !!session
}

// Función para iniciar sesión
export async function signIn(email: string, password: string): Promise<boolean> {
  // En producción, esto debería verificar las credenciales contra una base de datos
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    // Establecer cookie de sesión
    cookies().set("session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })
    return true
  }
  return false
}

// Función para cerrar sesión
export async function signOut(): Promise<void> {
  cookies().delete("session")
}
