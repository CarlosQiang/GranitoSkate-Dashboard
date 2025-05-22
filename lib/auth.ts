import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { compare } from "bcrypt"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email o Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Se requieren credenciales")
        }

        try {
          // Buscar administrador por email
          const admin = await prisma.administrador.findFirst({
            where: {
              OR: [{ email: credentials.identifier }, { nombre: credentials.identifier }],
              activo: true,
            },
          })

          if (!admin) {
            throw new Error("Credenciales inválidas")
          }

          // Verificar contraseña
          const passwordMatch = await compare(credentials.password, admin.password)

          if (!passwordMatch) {
            throw new Error("Contraseña incorrecta")
          }

          // Actualizar último acceso
          await prisma.administrador.update({
            where: { id: admin.id },
            data: { ultimo_acceso: new Date() },
          })

          return {
            id: admin.id.toString(),
            name: admin.nombre,
            email: admin.email,
            role: admin.rol,
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          throw new Error(error instanceof Error ? error.message : "Error de autenticación")
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
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
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
