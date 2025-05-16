import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { sql } from "@vercel/postgres"

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
          const { rows } = await sql`
            SELECT * FROM administradores 
            WHERE (nombre_usuario = ${credentials.identifier} OR correo_electronico = ${credentials.identifier})
            AND activo = true
          `

          if (rows.length === 0) {
            console.log("Usuario no encontrado:", credentials.identifier)
            return null
          }

          const user = rows[0]
          console.log("Usuario encontrado:", user.nombre_usuario)

          // Verificar contraseña con bcrypt
          const isValidPassword = await compare(credentials.password, user.contrasena)

          if (!isValidPassword) {
            console.log("Contraseña inválida para usuario:", credentials.identifier)
            return null
          }

          console.log("Autenticación exitosa para:", user.nombre_usuario)

          // Actualizar último acceso
          await sql`
            UPDATE administradores 
            SET ultimo_acceso = NOW() 
            WHERE id = ${user.id}
          `

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
