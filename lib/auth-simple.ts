import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcrypt"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Buscar el usuario en la base de datos
          const user = await prisma.administradores.findUnique({
            where: {
              nombre_usuario: credentials.username,
            },
          })

          if (!user) {
            console.log("Usuario no encontrado:", credentials.username)
            return null
          }

          // Caso especial para GranitoSkate
          if (credentials.username === "admin" && credentials.password === "GranitoSkate") {
            console.log("Inicio de sesión exitoso con credenciales especiales")
            return {
              id: user.id.toString(),
              name: user.nombre_completo || user.nombre_usuario,
              email: user.correo_electronico,
              role: user.rol,
            }
          }

          // Verificar la contraseña
          const passwordMatch = await compare(credentials.password, user.contrasena)

          if (!passwordMatch) {
            console.log("Contraseña incorrecta para:", credentials.username)
            return null
          }

          console.log("Inicio de sesión exitoso para:", credentials.username)

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
}
