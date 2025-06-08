import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "@vercel/postgres"
import { verifyPassword, updateLastLogin } from "./auth-service"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Usuario o Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciales incompletas")
          return null
        }

        try {
          console.log("🔍 Buscando administrador con identificador:", credentials.email)

          // Buscar en la tabla de administradores por nombre de usuario o correo electrónico
          const { rows } = await sql`
            SELECT id, nombre_usuario, correo_electronico, contrasena, nombre_completo, rol, activo
            FROM administradores
            WHERE nombre_usuario = ${credentials.email} OR correo_electronico = ${credentials.email}
          `

          if (rows.length === 0) {
            console.log("❌ Administrador no encontrado")
            return null
          }

          const admin = rows[0]

          if (!admin.activo) {
            console.log("❌ Administrador inactivo")
            return null
          }

          const isValid = await verifyPassword(credentials.password, admin.contrasena)

          if (!isValid) {
            console.log("❌ Contraseña incorrecta")
            return null
          }

          // Actualizar último acceso
          await updateLastLogin(admin.id)

          console.log("✅ Login exitoso para:", admin.correo_electronico)

          return {
            id: admin.id.toString(),
            name: admin.nombre_completo || admin.nombre_usuario,
            email: admin.correo_electronico,
            role: admin.rol,
          }
        } catch (error) {
          console.error("❌ Error en authorize:", error)
          return null
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
    async redirect({ url, baseUrl }) {
      // Si la URL es relativa, usar baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Si la URL pertenece al mismo dominio, permitirla
      else if (new URL(url).origin === baseUrl) return url
      // Caso contrario, redirigir al dashboard
      return `${baseUrl}/dashboard`
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
  debug: false, // Desactivar debug en producción
  trustHost: true, // Importante para Vercel
}
