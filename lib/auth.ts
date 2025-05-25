import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import { ActivityLogger } from "@/lib/services/activity-logger"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Buscar usuario por nombre de usuario
          const result = await query("SELECT * FROM administradores WHERE nombre_usuario = $1 AND activo = true", [
            credentials.username,
          ])

          if (result.rows.length === 0) {
            return null
          }

          const user = result.rows[0]

          // Verificar contraseña
          const isValidPassword = await bcrypt.compare(credentials.password, user.contrasena)

          if (!isValidPassword) {
            return null
          }

          // Actualizar último acceso
          await query("UPDATE administradores SET ultimo_acceso = NOW() WHERE id = $1", [user.id])

          // Obtener IP del usuario
          const forwarded = req?.headers?.["x-forwarded-for"]
          const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0]) : "unknown"
          const userAgent = req?.headers?.["user-agent"] || "unknown"

          // Registrar login exitoso
          await ActivityLogger.logLogin(user.id, user.nombre_completo || user.nombre_usuario, ip, userAgent)

          return {
            id: user.id.toString(),
            name: user.nombre_completo || user.nombre_usuario,
            email: user.correo_electronico,
            role: user.rol,
          }
        } catch (error) {
          console.error("Error en autenticación:", error)
          await ActivityLogger.logSystemError(error as Error, "Error en autenticación")
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || token.userId
        session.user.role = token.role as string
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.sub) {
        try {
          const result = await query("SELECT nombre_completo, nombre_usuario FROM administradores WHERE id = $1", [
            Number.parseInt(token.sub),
          ])
          if (result.rows.length > 0) {
            const user = result.rows[0]
            await ActivityLogger.logLogout(Number.parseInt(token.sub), user.nombre_completo || user.nombre_usuario)
          }
        } catch (error) {
          console.error("Error al registrar logout:", error)
        }
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
