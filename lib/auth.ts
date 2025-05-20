import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

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
            console.log("Faltan credenciales")
            return null
          }

          console.log("Buscando usuario con identificador:", credentials.identifier)

          // Buscar por email o nombre de usuario
          const result = await query(`SELECT * FROM administradores WHERE email = $1 OR nombre_usuario = $1`, [
            credentials.identifier,
          ])

          const user = result.rows[0]

          if (!user) {
            console.log("Usuario no encontrado")
            return null
          }

          console.log("Usuario encontrado, verificando contraseña")

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log("Contraseña inválida")
            return null
          }

          console.log("Autenticación exitosa")

          // Devolver el usuario sin la contraseña
          return {
            id: user.id.toString(),
            name: user.nombre,
            email: user.email,
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

export default authOptions
