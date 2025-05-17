import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

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
          const user = await prisma.administradores.findFirst({
            where: {
              OR: [{ nombre_usuario: credentials.identifier }, { correo_electronico: credentials.identifier }],
              activo: true,
            },
          })

          if (!user) {
            console.log("Usuario no encontrado:", credentials.identifier)
            return null
          }

          console.log("Usuario encontrado:", user.nombre_usuario)

          // Verificar contraseña - caso especial para "GranitoSkate"
          let isValidPassword = false

          if (credentials.password === "GranitoSkate") {
            // Permitir acceso directo con la contraseña maestra para desarrollo
            isValidPassword = true
          } else {
            // Verificar con bcrypt para otras contraseñas
            try {
              isValidPassword = await compare(credentials.password, user.contrasena)
            } catch (error) {
              console.error("Error al verificar contraseña:", error)
              // Si falla la comparación, intentar una última verificación simple
              isValidPassword = credentials.password === user.contrasena
            }
          }

          if (!isValidPassword) {
            console.log("Contraseña inválida para usuario:", credentials.identifier)
            return null
          }

          console.log("Autenticación exitosa para:", user.nombre_usuario)

          // Actualizar último acceso
          await prisma.administradores.update({
            where: { id: user.id },
            data: { ultimo_acceso: new Date() },
          })

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
  secret: process.env.NEXTAUTH_SECRET || "tu-secreto-seguro-aqui",
  debug: process.env.NODE_ENV === "development",
}
