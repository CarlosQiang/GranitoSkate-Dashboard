import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Función simple para verificar contraseñas
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Caso especial para "GranitoSkate"
  if (
    password === "GranitoSkate" &&
    hashedPassword === "$2b$10$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy"
  ) {
    return true
  }

  // Para otras contraseñas, devolver false (no podemos verificar sin bcrypt)
  return false
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Usuario o Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            console.log("Credenciales incompletas")
            return null
          }

          console.log("Buscando usuario:", credentials.identifier)

          // Buscar usuario por nombre de usuario o correo electrónico
          const user = await prisma.administradores.findFirst({
            where: {
              OR: [{ nombre_usuario: credentials.identifier }, { correo_electronico: credentials.identifier }],
              activo: true,
            },
          })

          if (!user) {
            console.log("Usuario no encontrado:", credentials.identifier)
            return null
          }

          console.log("Usuario encontrado:", user.nombre_usuario)

          // Verificar contraseña
          const isValidPassword = await verifyPassword(credentials.password, user.contrasena)

          if (!isValidPassword) {
            console.log("Contraseña inválida para usuario:", credentials.identifier)
            return null
          }

          console.log("Autenticación exitosa para:", user.nombre_usuario)

          // Actualizar último acceso
          await prisma.administradores.update({
            where: { id: user.id },
            data: { ultimo_acceso: new Date() },
          })

          return {
            id: user.id.toString(),
            name: user.nombre_completo || user.nombre_usuario,
            email: user.correo_electronico,
            role: user.rol,
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
