import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { verifyPassword, updateLastLogin } from "./auth-service"

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

          console.log(`Intentando autenticar: ${credentials.identifier}`)

          // Buscar usuario por nombre de usuario o correo electrónico
          const user = await prisma.administrador.findFirst({
            where: {
              OR: [{ nombre_usuario: credentials.identifier }, { correo_electronico: credentials.identifier }],
              activo: true,
            },
          })

          if (!user) {
            console.log(`Usuario no encontrado: ${credentials.identifier}`)
            return null
          }

          console.log(`Usuario encontrado: ${user.nombre_usuario}, verificando contraseña...`)
          console.log(`Hash almacenado: ${user.contrasena.substring(0, 15)}...`)

          // Verificar contraseña
          const isValidPassword = await verifyPassword(credentials.password, user.contrasena)

          if (!isValidPassword) {
            console.log("Contraseña inválida")
            return null
          }

          console.log("Autenticación exitosa, actualizando último acceso...")

          // Actualizar último acceso
          await updateLastLogin(user.id)

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
  secret: process.env.NEXTAUTH_SECRET || "tu_secreto_seguro_aqui",
  debug: process.env.NODE_ENV === "development",
}
