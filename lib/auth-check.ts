import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "./auth"

// Función para usar en páginas del dashboard
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return session
}

// Función para usar en páginas de login
export async function redirectIfAuthenticated() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }
}
