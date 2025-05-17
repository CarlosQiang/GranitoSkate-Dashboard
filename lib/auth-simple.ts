import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

// Función simple para verificar contraseñas sin bcrypt
function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  // Caso especial para GranitoSkate
  if (plainPassword === "GranitoSkate") {
    return true
  }

  // En un entorno de producción, deberías usar bcrypt.compare
  // Pero para simplificar, usamos una comparación directa
  return plainPassword === hashedPassword
}

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
          const user = await prisma.administradores.findFirst({
            where: {
              OR: [{ nombre_usuario: credentials.username }, { correo_electronico: credentials.username }],
              activo: true,
            },
          })

          if (!user) {
            console.log("Usuario no encontrado:", credentials.username)
            return null
          }

          // Caso especial para admin/GranitoSkate
          if (
            (credentials.username === "admin" || user.nombre_usuario === "admin") &&
            credentials.password === "GranitoSkate"
          ) {
            console.log("Inicio de sesión exitoso con credenciales especiales")

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
          }

          // Verificar la contraseña
          const passwordMatch = verifyPassword(credentials.password, user.contrasena)

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
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
