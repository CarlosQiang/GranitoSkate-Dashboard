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
          const result = await query("SELECT * FROM administradores WHERE nombre_usuario = $1 AND activo = true", [
            credentials.username,
          ])

          if (result.rows.length === 0) {
            return null
          }

          const user = result.rows[0]
          const isValidPassword = await bcrypt.compare(credentials.password, user.contrasena)

          if (!isValidPassword) {
            return null
          }

          // Actualizar último acceso
          await query("UPDATE administradores SET ultimo_acceso = NOW() WHERE id = $1", [user.id])

          // Registrar login
          const ipAddress = req?.headers?.["x-forwarded-for"] || req?.headers?.["x-real-ip"]
          const userAgent = req?.headers?.["user-agent"]

          await ActivityLogger.logLogin(
            user.id,
            user.nombre_completo || user.nombre_usuario,
            Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
            userAgent,
          )

          return {
            id: user.id.toString(),
            name: user.nombre_completo || user.nombre_usuario,
            email: user.correo_electronico,
            role: user.rol,
          }
        } catch (error) {
          console.error("Error en autenticación:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.sub) {
        await ActivityLogger.logLogout(Number.parseInt(token.sub), token.name || "Usuario desconocido")
      }
    },
  },
  pages: {
    signIn: "/login",
  },
}
