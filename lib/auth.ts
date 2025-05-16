import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "@vercel/postgres"
import { createHash } from "crypto"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Buscar el administrador por nombre de usuario
          const result = await sql`
            SELECT * FROM administradores 
            WHERE nombre_usuario = ${credentials.username} AND activo = true
          `

          if (result.rows.length === 0) {
            console.log(`Usuario no encontrado: ${credentials.username}`)
            return null
          }

          const user = result.rows[0]

          // Verificar la contraseña
          const hashedPassword = createHash("sha256")
            .update(credentials.password + user.salt)
            .digest("hex")

          if (hashedPassword !== user.password_hash) {
            console.log(`Contraseña incorrecta para el usuario: ${credentials.username}`)
            return null
          }

          // Actualizar último acceso
          await sql`
            UPDATE administradores 
            SET ultimo_acceso = NOW() 
            WHERE id = ${user.id}
          `

          // Devolver el usuario autenticado
          return {
            id: user.id.toString(),
            name: user.nombre_completo || user.nombre_usuario,
            email: user.email,
            role: user.rol,
          }
        } catch (error) {
          console.error("Error en la autenticación:", error)
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
      if (token) {
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
    maxAge: 8 * 60 * 60, // 8 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
}
