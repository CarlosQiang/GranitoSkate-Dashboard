import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email o Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            return null
          }

          // Buscar administrador por nombre de usuario o correo electrónico
          const result = await sql`
            SELECT * FROM administradores 
            WHERE nombre_usuario = ${credentials.identifier} 
            OR correo_electronico = ${credentials.identifier}
            LIMIT 1
          `

          const admin = result.rows[0]

          if (!admin) {
            console.log("Usuario no encontrado")
            return null
          }

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(credentials.password, admin.contrasena)

          if (!isPasswordValid) {
            console.log("Contraseña inválida")
            return null
          }

          // Actualizar último acceso
          await sql`
            UPDATE administradores 
            SET ultimo_acceso = NOW() 
            WHERE id = ${admin.id}
          `

          return {
            id: admin.id.toString(),
            name: admin.nombre_completo || admin.nombre_usuario,
            email: admin.correo_electronico,
            role: admin.rol,
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
})

export { handler as GET, handler as POST }
