import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByIdentifier, verifyPassword } from "./auth-service"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email o Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        try {
          // Buscar usuario por email o nombre de usuario
          const user = await getUserByIdentifier(credentials.identifier)

          if (!user) {
            console.log("Usuario no encontrado:", credentials.identifier)
            return null
          }

          // Verificar contraseña
          const isValid = await verifyPassword(credentials.password, user.contrasena)

          if (!isValid) {
            console.log("Contraseña incorrecta para:", credentials.identifier)
            return null
          }

          // Devolver usuario sin contraseña
          return {
            id: user.id.toString(),
            email: user.correo_electronico,
            name: user.nombre_completo || user.nombre_usuario,
            role: user.rol,
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
