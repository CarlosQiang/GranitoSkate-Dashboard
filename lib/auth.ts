import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "@vercel/postgres"
import { verifyPassword, updateLastLogin } from "./auth-service"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales incompletas")
        }

        try {
          console.log("Buscando administrador con email:", credentials.email)

          // Buscar en la tabla de administradores
          const { rows } = await sql`
            SELECT id, nombre_usuario, correo_electronico, contrasena, nombre_completo, rol, activo
            FROM administradores
            WHERE correo_electronico = ${credentials.email}
          `

          if (rows.length === 0) {
            console.log("Administrador no encontrado")
            throw new Error("Credenciales incorrectas")
          }

          const admin = rows[0]

          if (!admin.activo) {
            console.log("Administrador inactivo")
            throw new Error("Usuario inactivo")
          }

          const isValid = await verifyPassword(credentials.password, admin.contrasena)

          if (!isValid) {
            console.log("Contraseña incorrecta")
            throw new Error("Credenciales incorrectas")
          }

          // Actualizar último acceso
          await updateLastLogin(admin.id)

          console.log("Login exitoso para:", admin.correo_electronico)

          return {
            id: admin.id.toString(),
            name: admin.nombre_completo || admin.nombre_usuario,
            email: admin.correo_electronico,
            role: admin.rol,
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          throw new Error(error instanceof Error ? error.message : "Error de autenticación")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
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
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
