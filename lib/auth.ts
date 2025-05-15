import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByIdentifier, verifyPassword, updateLastLogin } from "./auth-service"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Usuario o Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          console.error("Credenciales incompletas")
          return null
        }

        try {
          console.log(`Buscando usuario con identificador: ${credentials.identifier}`)
          const user = await getUserByIdentifier(credentials.identifier)

          if (!user) {
            console.error("Usuario no encontrado")
            return null
          }

          console.log("Usuario encontrado, verificando contraseña...")
          const isValid = await verifyPassword(credentials.password, user.contrasena)

          if (!isValid) {
            console.error("Contraseña inválida")
            return null
          }

          console.log("Autenticación exitosa, actualizando último acceso...")
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
    maxAge: 24 * 60 * 60, // 24 horas
  },
  debug: process.env.NODE_ENV === "development",
}
