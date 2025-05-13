import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { verificarCredenciales } from "./auth-service"
import { initializeDatabase } from "./db"

// Inicializar la base de datos al cargar el módulo (solo en el servidor)
if (typeof window === "undefined") {
  initializeDatabase().catch((error) => {
    console.error("Error al inicializar la base de datos", error)
  })
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        identifier: { label: "Email o Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        try {
          // Verificar credenciales en la base de datos
          const user = await verificarCredenciales(credentials.identifier, credentials.password)

          if (!user) {
            // Si no hay usuario en la base de datos, intentar con las variables de entorno (para compatibilidad)
            if (
              (credentials.identifier === process.env.ADMIN_EMAIL || credentials.identifier === "admin") &&
              credentials.password === process.env.ADMIN_PASSWORD
            ) {
              return {
                id: "1",
                name: "Administrador",
                email: process.env.ADMIN_EMAIL,
                role: "superadmin",
                username: "admin",
              }
            }
            return null
          }

          return {
            id: user.id.toString(),
            name: user.nombre_completo || user.nombre_usuario,
            email: user.correo_electronico,
            role: user.rol,
            username: user.nombre_usuario,
          }
        } catch (error) {
          console.error("Error en authorize:", error)

          // Si hay un error con la base de datos, intentar con las variables de entorno
          if (
            (credentials.identifier === process.env.ADMIN_EMAIL || credentials.identifier === "admin") &&
            credentials.password === process.env.ADMIN_PASSWORD
          ) {
            return {
              id: "1",
              name: "Administrador",
              email: process.env.ADMIN_EMAIL,
              role: "superadmin",
              username: "admin",
            }
          }

          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.username = user.username
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.username = token.username as string
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
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
}
